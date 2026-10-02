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
# npm solo se usa para instalar; se elimina de la imagen final (reduce superficie de ataque).
RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /root/.npm
USER node
CMD ["node", "main.js"]
