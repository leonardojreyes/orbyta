import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { ATTACHMENT_DEFAULT_MAX_MB } from "@orbyta/shared";

const envPath = resolve(import.meta.dirname, "../../../.env");
if (existsSync(envPath)) process.loadEnvFile(envPath);

const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://localhost:5432/orbyta";

const ROOT = resolve(import.meta.dirname, "../../..");

/** MAX_UPLOAD_MB: entre 1 y 25. Un valor inválido detiene el arranque (un bodyLimit roto aceptaría cualquier tamaño). */
function uploadLimitMb() {
  const mb = Number(process.env.MAX_UPLOAD_MB ?? ATTACHMENT_DEFAULT_MAX_MB);
  if (!Number.isFinite(mb) || mb < 1 || mb > 25) throw new Error(`MAX_UPLOAD_MB inválido: "${process.env.MAX_UPLOAD_MB}" (debe estar entre 1 y 25)`);
  return mb;
}

export const env = {
  // Adjuntos: "local" (disco). Para S3 se agrega otra implementación de Storage (ver src/storage.ts) y un valor aquí.
  STORAGE_DRIVER: process.env.STORAGE_DRIVER ?? "local",
  STORAGE_DIR: resolve(process.env.STORAGE_DIR ?? resolve(ROOT, "storage")),
  MAX_UPLOAD_BYTES: uploadLimitMb() * 1024 * 1024,
  // Conexión de la API: rol `orbyta_app` (sin superusuario, RLS activo).
  DATABASE_URL,
  // Conexión del dueño del esquema: solo para migrar y cargar datos de ejemplo.
  DATABASE_ADMIN_URL: process.env.DATABASE_ADMIN_URL ?? DATABASE_URL,
  API_PORT: Number(process.env.API_PORT ?? 3001),
};
