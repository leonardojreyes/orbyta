import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(import.meta.dirname, "../../../.env");
if (existsSync(envPath)) process.loadEnvFile(envPath);

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://localhost:5432/orbyta",
  API_PORT: Number(process.env.API_PORT ?? 3001),
};
