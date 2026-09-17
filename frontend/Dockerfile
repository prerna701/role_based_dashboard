ARG NODE_IMAGE
FROM ${NODE_IMAGE} AS dependencies
WORKDIR /app
COPY package.json ./
RUN npm install --ignore-scripts --no-audit --no-fund

FROM dependencies AS builder
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

ARG NODE_IMAGE
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

RUN addgroup --system --gid ${NODE_GID} ${NODE_GROUP} \
  && adduser --system --uid ${NODE_UID} --ingroup ${NODE_GROUP} ${NODE_USER}

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=dependencies /app/node_modules ./node_modules

USER ${NODE_USER}
EXPOSE ${FRONTEND_PORT}
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
