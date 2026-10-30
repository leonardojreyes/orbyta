# Orbyta

Gestión de proyectos y órdenes de servicio · multiempresa · SynapTech Ecuador.

## Puesta en marcha en Mac (una sola vez)

```bash
# 1. Node 22 y pnpm (si ya los tienes, salta)
brew install node@22
corepack enable && corepack prepare pnpm@latest --activate

# 2. PostgreSQL nativo (~100 MB de RAM)
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
createdb orbyta
```

## Ejecutar

```bash
cd orbyta
cp .env.example .env
pnpm install
pnpm db:migrate && pnpm db:seed
pnpm dev
```

Abre http://localhost:5173 — cambia de empresa en el selector de la izquierda para ver el aislamiento multiempresa.

## Estructura

```
apps/api        API Fastify + Drizzle (migraciones SQL en apps/api/migrations)
apps/web        Web React + Vite + Tailwind
packages/shared Esquemas Zod y tipos compartidos
docs/           roadmap, avance y decisiones de arquitectura
.claude/        configuración de Claude Code: permisos, subagentes, skills y comandos
```
