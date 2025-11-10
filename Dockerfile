# syntax=docker/dockerfile:1.4
# マルチステージビルドで最適化
FROM node:20-alpine AS base

# 依存関係のインストール（BuildKitキャッシュマウント活用）
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci

# 開発環境
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.jsの設定最適化
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

CMD ["yarn", "dev"]