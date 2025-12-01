# syntax=docker/dockerfile:1.4
# マルチステージビルドで最適化
FROM node:20-alpine AS base

# 依存関係のインストール（BuildKitキャッシュマウント活用）
FROM base AS deps
# libc6-compat might be needed for some deps, and python3 for native builds
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./
# Yarnを使用するように変更
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else echo "Lockfile not found." && exit 1; \
    fi

# 開発環境
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.jsの設定最適化
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development
# lightningcss WASM fallback for Alpine Linux compatibility
ENV CSS_TRANSFORMER_WASM=1

# ポート公開
EXPOSE 3000

CMD ["yarn", "dev"]