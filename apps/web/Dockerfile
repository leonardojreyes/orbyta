# Imagen de web (Next.js, salida standalone). Contexto de build: raíz del repositorio.
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm nx build web

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
USER node
CMD ["node", "apps/web/server.js"]
