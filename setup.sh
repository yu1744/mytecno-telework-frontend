#!/bin/bash
# 開発環境セットアップスクリプト

set -e

echo "🚀 在宅勤務管理システム - 開発環境セットアップ"
echo "=================================================="

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Dockerの確認
echo -e "\n${YELLOW}[1/6] Docker環境を確認中...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Dockerがインストールされていません${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker確認完了${NC}"

# Docker Composeの確認
echo -e "\n${YELLOW}[2/6] Docker Composeを確認中...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Composeがインストールされていません${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose確認完了${NC}"

# BuildKit有効化
echo -e "\n${YELLOW}[3/6] BuildKitを有効化中...${NC}"
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
echo -e "${GREEN}✅ BuildKit有効化完了${NC}"

# 環境変数ファイルのコピー
echo -e "\n${YELLOW}[4/6] 環境変数ファイルを確認中...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env.exampleから.envを作成しました${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.exampleが見つかりません${NC}"
    fi
else
    echo -e "${GREEN}✅ .envファイル確認完了${NC}"
fi

# Frontendの環境変数
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env.localを作成してください${NC}"
else
    echo -e "${GREEN}✅ frontend/.env.local確認完了${NC}"
fi

# 古いコンテナとイメージのクリーンアップ
echo -e "\n${YELLOW}[5/6] 古いコンテナをクリーンアップ中...${NC}"
echo "オプションを選択してください:"
echo "  1) コンテナのみ削除（データベースデータは保持）"
echo "  2) コンテナとボリュームを削除（完全クリーン）"
read -p "選択 (1/2) [デフォルト: 1]: " cleanup_choice
cleanup_choice=${cleanup_choice:-1}

if [ "$cleanup_choice" = "2" ]; then
    echo -e "${YELLOW}⚠️  すべてのデータが削除されます${NC}"
    docker-compose down -v 2>/dev/null || true
    echo -e "${GREEN}✅ 完全クリーンアップ完了${NC}"
else
    docker-compose down 2>/dev/null || true
    echo -e "${GREEN}✅ コンテナクリーンアップ完了（データは保持）${NC}"
fi

# コンテナのビルドと起動
echo -e "\n${YELLOW}[6/6] コンテナをビルド・起動中...${NC}"
echo "これには数分かかる場合があります..."
docker-compose build --parallel
docker-compose up -d

# 起動待機
echo -e "\n${YELLOW}コンテナの起動を待機中...${NC}"
sleep 10

# ヘルスチェック
echo -e "\n${YELLOW}ヘルスチェック中...${NC}"
docker-compose ps

# データベースのセットアップ
echo -e "\n${YELLOW}データベースをセットアップ中...${NC}"
echo "これには数分かかる場合があります..."

# バックエンドが完全に起動するまで待機
echo "バックエンドの起動を待機中..."
sleep 30

# データベース作成
echo -e "\n${YELLOW}データベースを作成中...${NC}"
docker-compose exec -T backend bash -c "bundle exec rails db:create" 2>&1 || {
    echo -e "${YELLOW}⚠️  データベースは既に存在するか、作成に失敗しました${NC}"
}

# マイグレーション実行
echo -e "\n${YELLOW}マイグレーションを実行中...${NC}"
docker-compose exec -T backend bash -c "bundle exec rails db:migrate" || {
    echo -e "${RED}❌ マイグレーションに失敗しました${NC}"
    echo "  手動で実行してください: docker-compose exec backend bundle exec rails db:migrate"
}

# シードデータ投入
echo -e "\n${YELLOW}初期データとユーザーを作成中...${NC}"
docker-compose exec -T backend bash -c "bundle exec rails db:seed" || {
    echo -e "${RED}❌ シードデータの投入に失敗しました${NC}"
    echo "  手動で実行してください: docker-compose exec backend bundle exec rails db:seed"
}

# 完了メッセージ
echo -e "\n${GREEN}=================================================="
echo "🎉 セットアップ完了！"
echo "==================================================${NC}"
echo ""
echo "📝 アクセス情報:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:3001"
echo "  - MySQL:    localhost:3306"
echo ""
echo "� ログイン情報:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "管理者:"
echo "  Email:    admin@example.com"
echo "  Password: password123"
echo ""
echo "承認者:"
echo "  Email:    approver@example.com"
echo "  Password: password123"
echo ""
echo "一般ユーザー:"
echo "  Email:    user@example.com"
echo "  Password: password123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "�🛠️  便利なコマンド:"
echo "  make dev        - ログ付きで起動"
echo "  make logs       - ログを表示"
echo "  make down       - コンテナを停止"
echo "  make db-reset   - データベースをリセット"
echo "  make stats      - リソース使用状況を表示"
echo ""
echo "📚 詳細は DOCKER_OPTIMIZATION.md を参照してください"
echo ""
