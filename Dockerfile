FROM node:19-slim AS base

FROM base as builder

WORKDIR /home/builder
COPY . .
RUN npm ci

RUN npm run compile

FROM base as runner

WORKDIR /home/runner
COPY package.json .
COPY package-lock.json .
COPY --from=builder /home/builder/out ./out

RUN npm ci

ENTRYPOINT ["node", "."]