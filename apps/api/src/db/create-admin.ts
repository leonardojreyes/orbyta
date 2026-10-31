// Crea un administrador en una empresa existente (primer acceso tras migrar).
// Uso: pnpm db:create-admin <codigo-empresa> <correo> [nombre]
// La contraseña sale de ADMIN_PASSWORD o, si no existe, se genera y se muestra una sola vez.
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { UserCreate } from "@orbyta/shared";
import { admin } from "./client.js";
import { tenants, users } from "./schema.js";
import { hashPassword } from "../auth.js";
import { isUniqueViolation } from "../routes/users.js";

const [slug, emailArg, nameArg] = process.argv.slice(2);
if (!slug || !emailArg) {
  console.error("Uso: pnpm db:create-admin <codigo-empresa> <correo> [nombre]");
  process.exit(1);
}

const generated = !process.env.ADMIN_PASSWORD;
const password = process.env.ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");
try {
  const input = UserCreate.parse({ email: emailArg, name: nameArg ?? "Administrador", role: "admin", password });
  const [tenant] = await admin.db.select().from(tenants).where(eq(tenants.slug, slug.toLowerCase()));
  if (!tenant) throw new Error(`No existe la empresa "${slug}". Códigos: ${(await admin.db.select().from(tenants)).map((t) => t.slug).join(", ")}`);
  const { password: _, ...fields } = input;
  await admin.withTenant(tenant.id, async (tx) => {
    await tx.insert(users).values({ ...fields, tenantId: tenant.id, passwordHash: await hashPassword(password) });
  });
  console.log(`✓ Administrador ${input.email} creado en ${tenant.name} (código de empresa: ${tenant.slug})`);
  if (generated) console.log(`  Contraseña (no se vuelve a mostrar): ${password}`);
} catch (e) {
  console.error(`✗ ${isUniqueViolation(e) ? "Ya existe un usuario con ese correo en la empresa."
    : e instanceof ZodError ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : (e as Error).message}`);
  process.exitCode = 1;
} finally {
  await admin.pool.end();
}
