ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE} AS dependencies
WORKDIR /app
ARG NPM_VERSION=11.12.1
COPY package.json package-lock.json ./
RUN npm install --global npm@${NPM_VERSION} --no-audit --no-fund \
  && npm ci --ignore-scripts --no-audit --no-fund

FROM dependencies AS builder
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ARG NODE_ENV
ARG FRONTEND_PORT
ARG NODE_UID
ARG NODE_GID
ARG NODE_USER
ARG NODE_GROUP
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${FRONTEND_PORT}
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid ${NODE_GID} ${NODE_GROUP} \
  && adduser --system --uid ${NODE_UID} --ingroup ${NODE_GROUP} ${NODE_USER}

COPY --from=builder --chown=${NODE_USER}:${NODE_GROUP} /app/.next/standalone ./
COPY --from=builder --chown=${NODE_USER}:${NODE_GROUP} /app/.next/static ./.next/static

USER ${NODE_USER}
EXPOSE ${FRONTEND_PORT}
CMD ["node", "server.js"]
