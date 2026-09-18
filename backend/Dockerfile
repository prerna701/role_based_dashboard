ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE} AS base
WORKDIR /app
ARG NPM_VERSION=11.12.1
RUN npm install --global npm@${NPM_VERSION} --no-audit --no-fund

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund

FROM dependencies AS builder
COPY . .
RUN npm run build
RUN mkdir -p dist/database/seeds/relational/assessment \
  && cp src/database/seeds/relational/assessment/data.json dist/database/seeds/relational/assessment/data.json

FROM dependencies AS production-dependencies
RUN npm prune --omit=dev --ignore-scripts --no-audit

ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ARG NODE_ENV
ARG APP_PORT
ARG NODE_UID
ARG NODE_GID
ARG NODE_USER
ARG NODE_GROUP
ENV NODE_ENV=${NODE_ENV}
ENV APP_PORT=${APP_PORT}

RUN addgroup --system --gid ${NODE_GID} ${NODE_GROUP} \
  && adduser --system --uid ${NODE_UID} --ingroup ${NODE_GROUP} ${NODE_USER}

COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

USER ${NODE_USER}
EXPOSE ${APP_PORT}
CMD ["node", "dist/main.js"]
