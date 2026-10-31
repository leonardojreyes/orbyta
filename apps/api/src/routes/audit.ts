import type { FastifyInstance } from "fastify";
import { and, desc, eq, sql } from "drizzle-orm";
import { AuditQuery, type AuditPage } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { auditLog, users } from "../db/schema.js";

/** Solo administradores (el grupo se registra con allow("admin")). La bitácora es de solo lectura. */
export async function auditRoutes(app: FastifyInstance) {
  app.get("/audit", async (req): Promise<AuditPage> => {
    const q = AuditQuery.parse(req.query);
    const cut = q.cursor ? { at: q.cursor.slice(0, q.cursor.lastIndexOf("_")), id: q.cursor.slice(q.cursor.lastIndexOf("_") + 1) } : undefined;
    const rows = await withTenant(req.tenantId, (tx) =>
      tx.select({
        id: auditLog.id, tableName: auditLog.tableName, recordId: auditLog.recordId, recordLabel: auditLog.recordLabel,
        action: auditLog.action, changes: auditLog.changes, userId: auditLog.userId, userName: users.name, createdAt: auditLog.createdAt,
      })
        .from(auditLog)
        .leftJoin(users, eq(users.id, auditLog.userId))
        .where(and(
          q.table ? eq(auditLog.tableName, q.table) : undefined,
          q.action ? eq(auditLog.action, q.action) : undefined,
          q.userId ? eq(auditLog.userId, q.userId) : undefined,
          q.recordId ? eq(auditLog.recordId, q.recordId) : undefined,
          cut ? sql`(${auditLog.createdAt}, ${auditLog.id}) < (${cut.at}::timestamptz, ${cut.id}::uuid)` : undefined,
        ))
        .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
        .limit(q.limit + 1),
    );
    const items = rows.slice(0, q.limit) as AuditPage["items"];
    const last = items.at(-1);
    return { items, nextCursor: rows.length > q.limit && last ? `${last.createdAt}_${last.id}` : null };
  });
}
