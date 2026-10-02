# Imagen de worker. Contexto de build: raíz del repositorio.
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm nx build worker

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/dist/apps/worker/ ./
RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund
USER node
CMD ["node", "main.js"]
