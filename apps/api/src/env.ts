import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(import.meta.dirname, "../../../.env");
if (existsSync(envPath)) process.loadEnvFile(envPath);

const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://localhost:5432/orbyta";

export const env = {
  // Conexión de la API: rol `orbyta_app` (sin superusuario, RLS activo).
  DATABASE_URL,
  // Conexión del dueño del esquema: solo para migrar y cargar datos de ejemplo.
  DATABASE_ADMIN_URL: process.env.DATABASE_ADMIN_URL ?? DATABASE_URL,
  API_PORT: Number(process.env.API_PORT ?? 3001),
};
