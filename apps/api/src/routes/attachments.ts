import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { ATTACHMENT_MAX_PER_ORDER, ATTACHMENT_TYPES, CLOSED_ORDER_STATUS, type Attachment } from "@orbyta/shared";
import { withTenant } from "../db/client.js";
import { attachments, serviceOrders, users } from "../db/schema.js";
import { env } from "../env.js";
import { createStorage } from "../storage.js";
import { mine } from "./orders.js";

type ImageType = (typeof ATTACHMENT_TYPES)[number];
const EXT: Record<ImageType, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Tipo real de la imagen por sus primeros bytes: el Content-Type que declara el cliente no se da por bueno. */
function sniff(b: Buffer): ImageType | undefined {
  if (b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return undefined;
}

/** Nombre solo para mostrar: sin rutas ni caracteres de control, máx. 120. Nunca se usa para guardar el archivo. */
function displayName(raw: unknown) {
  let name = typeof raw === "string" ? raw : "";
  try { name = decodeURIComponent(name); } catch { /* se deja tal cual */ }
  name = name.replace(/[\u0000-\u001f\u007f/\\]/g, "").trim().slice(0, 120);
  return name || "foto";
}

const isClosed = (status: string) => (CLOSED_ORDER_STATUS as readonly string[]).includes(status);

/** Fotos de las órdenes. Acceso igual al de las órdenes: el técnico solo las de sus órdenes y no las cerradas. */
export async function attachmentRoutes(app: FastifyInstance) {
  const storage = createStorage();
  // La imagen llega como cuerpo en bruto (sin multipart): una foto por solicitud, con el tope de tamaño de MAX_UPLOAD_MB.
  app.addContentTypeParser([...ATTACHMENT_TYPES], { parseAs: "buffer", bodyLimit: env.MAX_UPLOAD_BYTES }, (_req, body, done) => done(null, body));

  const orderWhere = (req: Parameters<typeof mine>[0], id: string) =>
    and(eq(serviceOrders.id, id), isNull(serviceOrders.deletedAt), mine(req));

  app.get<{ Params: { id: string } }>("/service-orders/:id/attachments", async (req, reply) => {
    const rows = await withTenant(req.tenantId, async (tx) => {
      const [order] = await tx.select({ id: serviceOrders.id }).from(serviceOrders).where(orderWhere(req, req.params.id));
      if (!order) return undefined;
      return tx.select({
        id: attachments.id, orderId: attachments.orderId, fileName: attachments.fileName, contentType: attachments.contentType,
        sizeBytes: attachments.sizeBytes, uploadedBy: attachments.uploadedBy, uploadedByName: users.name, createdAt: attachments.createdAt,
      }).from(attachments).leftJoin(users, eq(users.id, attachments.uploadedBy))
        .where(and(eq(attachments.orderId, order.id), isNull(attachments.deletedAt))).orderBy(asc(attachments.createdAt), asc(attachments.id));
    });
    return (rows ?? reply.code(404).send({ error: "Orden no encontrada" })) as Attachment[];
  });

  app.post<{ Params: { id: string } }>("/service-orders/:id/attachments", async (req, reply) => {
    const body = req.body;
    if (!Buffer.isBuffer(body) || !body.length) return reply.code(400).send({ error: "Falta la imagen" });
    const type = sniff(body);
    if (!type || type !== req.headers["content-type"]?.split(";")[0]) return reply.code(400).send({ error: "El archivo no es una imagen válida (jpeg, png o webp)" });

    // Todo en una transacción con la orden bloqueada (FOR UPDATE): el límite por orden y el estado "cerrada" no pueden
    // cambiar entre comprobar y guardar, ni siquiera con subidas simultáneas. El archivo se escribe antes del registro;
    // si algo falla después, se borra para no dejarlo huérfano.
    const id = randomUUID();
    let key: string | undefined;
    try {
      const out = await withTenant(req.tenantId, async (tx): Promise<{ status: number; error: string } | { attachment: typeof attachments.$inferSelect }> => {
        const [order] = await tx.select({ id: serviceOrders.id, status: serviceOrders.status }).from(serviceOrders)
          .where(orderWhere(req, req.params.id)).for("update");
        if (!order) return { status: 404, error: "Orden no encontrada" };
        if (req.user.role === "technician" && isClosed(order.status)) return { status: 403, error: "La orden ya está cerrada" };
        const n = (await tx.select({ n: count() }).from(attachments).where(and(eq(attachments.orderId, order.id), isNull(attachments.deletedAt))))[0]?.n ?? 0;
        if (n >= ATTACHMENT_MAX_PER_ORDER) return { status: 409, error: `Una orden admite hasta ${ATTACHMENT_MAX_PER_ORDER} fotos` };

        const storageKey = `${req.tenantId}/${order.id}/${id}.${EXT[type]}`;
        await storage.put(storageKey, body);
        key = storageKey;
        const [row] = await tx.insert(attachments).values({
          id, tenantId: req.tenantId, orderId: order.id, storageKey, fileName: displayName(req.headers["x-file-name"]),
          contentType: type, sizeBytes: body.length, uploadedBy: req.user.id,
        }).returning();
        return { attachment: row! };
      });
      if ("error" in out) return reply.code(out.status).send({ error: out.error });
      return reply.code(201).send({ ...out.attachment, storageKey: undefined, uploadedByName: req.user.name });
    } catch (e) {
      if (key) await storage.remove(key).catch(() => {});
      throw e;
    }
  });

  // Acceso por la orden: mismas reglas (y mismo 404) que para ver la orden.
  const findAttachment = (req: Parameters<typeof mine>[0], id: string) =>
    withTenant(req.tenantId, async (tx) => (await tx.select({ a: attachments, status: serviceOrders.status }).from(attachments)
      .innerJoin(serviceOrders, eq(serviceOrders.id, attachments.orderId))
      .where(and(eq(attachments.id, id), isNull(attachments.deletedAt), isNull(serviceOrders.deletedAt), mine(req))))[0]);

  app.get<{ Params: { id: string } }>("/attachments/:id/file", async (req, reply) => {
    const found = await findAttachment(req, req.params.id);
    const file = found && (await storage.get(found.a.storageKey));
    if (!found || !file) return reply.code(404).send({ error: "Archivo no encontrado" });
    // El contenido de un adjunto nunca cambia, pero el permiso sí (se quita, se revoca el acceso): el navegador debe
    // revalidar cada vez, y como la comprobación de acceso ya pasó, basta con responder 304 si el ETag coincide.
    const etag = `"${found.a.id}"`;
    if (req.headers["if-none-match"] === etag) { file.stream.destroy(); return reply.code(304).header("ETag", etag).header("Cache-Control", "private, no-cache").send(); }
    return reply
      .header("Content-Type", found.a.contentType).header("Content-Length", file.size)
      .header("ETag", etag).header("Cache-Control", "private, no-cache")
      // El archivo se muestra tal cual en <img>; estos encabezados impiden que un navegador lo trate como otra cosa.
      .header("X-Content-Type-Options", "nosniff").header("Content-Security-Policy", "default-src 'none'; sandbox")
      .send(file.stream);
  });

  // "Quitar" es borrado lógico: el registro deja de verse; el archivo se conserva (la bitácora guarda quién lo quitó).
  app.delete<{ Params: { id: string } }>("/attachments/:id", async (req, reply) => {
    const found = await findAttachment(req, req.params.id);
    if (!found) return reply.code(404).send({ error: "Archivo no encontrado" });
    if (req.user.role === "technician" && (found.a.uploadedBy !== req.user.id || isClosed(found.status)))
      return reply.code(403).send({ error: "No tienes permiso para esta acción" });
    await withTenant(req.tenantId, (tx) => tx.update(attachments)
      .set({ deletedAt: new Date().toISOString(), updatedAt: sql`now()` }).where(eq(attachments.id, found.a.id)));
    return { ok: true };
  });
}
