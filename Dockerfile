FROM node:20 AS builder

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Development stage
FROM node:20 AS development

WORKDIR /app

COPY --from=builder /app /app

CMD ["yarn", "start:dev"]

# Production stage
FROM node:20 AS production

WORKDIR /app

COPY --from=builder /app /app

ENV NODE_ENV=production

RUN yarn install --production

CMD ["yarn", "start:prod"]
