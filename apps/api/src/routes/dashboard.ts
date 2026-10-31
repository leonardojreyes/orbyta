import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { DashboardQuery, ORDER_PRIORITY, ORDER_STATUS, type DashboardData } from "@orbyta/shared";
import { withTenant } from "../db/client.js";

type Row = Record<string, unknown>;
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const count = (rows: Row[], key: string, value: string) => Number(rows.find((r) => r[key] === value)?.n ?? 0);

// Solo admin y supervisor (el grupo se registra con allow("admin", "supervisor")).
// Todo corre dentro de withTenant: RLS limita cada consulta a la empresa de la sesión. Los días se cuentan en la zona
// horaria de la base de datos (la misma que `current_date`).
export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard", async (req): Promise<DashboardData> => {
    const { days } = DashboardQuery.parse(req.query);

    return withTenant(req.tenantId, async (tx) => {
      const run = async (q: ReturnType<typeof sql>) => (await tx.execute(q)).rows as Row[];
      // Primera vez que cada orden pasó a "terminada" (el evento de creación, sin estado anterior, no cuenta).
      const firstDone = sql`first_done as (
        select e.order_id, min(e.created_at) as done_at
          from service_order_events e join service_orders o on o.id = e.order_id and o.deleted_at is null
         where e.to_status = 'done' and e.from_status is not null and e.deleted_at is null
         group by e.order_id)`;
      const since = sql`(current_date - (${days}::int - 1))`;

      // En serie: una transacción usa una sola conexión, así que en paralelo no ganaría nada y un fallo dejaría consultas en cola.
      const status = await run(sql`select status, count(*)::int as n from service_orders where deleted_at is null group by status`);
      const priority = await run(sql`select priority, count(*)::int as n from service_orders
                 where deleted_at is null and status not in ('done','cancelled') group by priority`);
      const aging = await run(sql`select
                  count(*) filter (where created_at >  now() - interval '1 day')::int as lt1d,
                  count(*) filter (where created_at <= now() - interval '1 day' and created_at > now() - interval '3 days')::int as d1to3,
                  count(*) filter (where created_at <= now() - interval '3 days' and created_at > now() - interval '7 days')::int as d3to7,
                  count(*) filter (where created_at <= now() - interval '7 days')::int as gt7
                  from service_orders where deleted_at is null and status not in ('done','cancelled')`);
      const daily = await run(sql`with ${firstDone}, d as (select generate_series(${since}, current_date, interval '1 day')::date as day)
                select d.day::text as date,
                  (select count(*)::int from service_orders o
                    where o.deleted_at is null and o.created_at >= d.day and o.created_at < d.day + 1) as created,
                  (select count(*)::int from first_done f where f.done_at >= d.day and f.done_at < d.day + 1) as closed
                  from d order by d.day`);
      const resolution = await run(sql`with ${firstDone}
                select count(*)::int as sample,
                  (avg(extract(epoch from f.done_at - o.created_at)) / 3600)::float8 as avg_h,
                  (percentile_cont(0.5) within group (order by extract(epoch from f.done_at - o.created_at)) / 3600)::float8 as median_h,
                  (percentile_cont(0.9) within group (order by extract(epoch from f.done_at - o.created_at)) / 3600)::float8 as p90_h
                  from first_done f join service_orders o on o.id = f.order_id
                 where f.done_at >= ${since}`);
      // Las terminadas se atribuyen al técnico que tiene hoy la orden (si se reasignó, el crédito va al actual).
      const technicians = await run(sql`with ${firstDone}
                select t.id, t.name,
                  count(*) filter (where o.status in ('assigned','in_progress'))::int as open_count,
                  count(*) filter (where f.done_at >= ${since})::int as done_in_period,
                  (avg(extract(epoch from f.done_at - o.created_at)) filter (where f.done_at >= ${since}) / 3600)::float8 as avg_h
                  from technicians t
                  join service_orders o on o.technician_id = t.id and o.deleted_at is null
                  left join first_done f on f.order_id = o.id
                 where t.deleted_at is null
                 group by t.id, t.name
                having count(*) filter (where o.status in ('assigned','in_progress')) > 0 or count(*) filter (where f.done_at >= ${since}) > 0
                 order by open_count desc, t.name`);

      const a = aging[0] ?? {};
      const r = resolution[0] ?? {};
      return {
        days,
        byStatus: Object.fromEntries(ORDER_STATUS.map((s) => [s, count(status, "status", s)])) as DashboardData["byStatus"],
        openByPriority: Object.fromEntries(ORDER_PRIORITY.map((p) => [p, count(priority, "priority", p)])) as DashboardData["openByPriority"],
        aging: { lt1d: Number(a.lt1d ?? 0), d1to3: Number(a.d1to3 ?? 0), d3to7: Number(a.d3to7 ?? 0), gt7: Number(a.gt7 ?? 0) },
        daily: daily.map((d) => ({ date: String(d.date), created: Number(d.created), closed: Number(d.closed) })),
        resolution: { sample: Number(r.sample ?? 0), avgHours: num(r.avg_h), medianHours: num(r.median_h), p90Hours: num(r.p90_h) },
        byTechnician: technicians.map((t) => ({
          id: String(t.id), name: String(t.name), openCount: Number(t.open_count), doneInPeriod: Number(t.done_in_period), avgHours: num(t.avg_h),
        })),
      };
    });
  });
}
