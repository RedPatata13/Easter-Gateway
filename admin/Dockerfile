FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS ui-build
WORKDIR /app/ui
ARG VITE_ADMIN_API_KEY
ENV VITE_ADMIN_API_KEY=$VITE_ADMIN_API_KEY
COPY ui/package*.json ./
RUN npm install
COPY ui/ .
RUN npm run build

FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=ui-build /app/ui/dist ./ui/dist
EXPOSE 4000
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "./src/server.ts"]

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=ui-build /app/ui/dist ./ui/dist
RUN npm run build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=ui-build /app/ui/dist ./ui/dist
EXPOSE 4000
CMD ["node", "dist/server.js"]