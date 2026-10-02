# Imagen de api. Contexto de build: raíz del repositorio.
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm nx build api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/dist/apps/api/ ./
RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund
USER node
CMD ["node", "main.js"]
