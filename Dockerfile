FROM node:19-slim AS base
RUN corepack enable

FROM base as builder

WORKDIR /home/builder
COPY . .
RUN pnpm install --frozen-lockfile

RUN pnpm compile

FROM base as runner

WORKDIR /home/runner
COPY package.json .
COPY pnpm-lock.yaml .
COPY --from=builder /home/builder/out ./out

RUN pnpm install --frozen-lockfile

ENTRYPOINT ["node", "."]