.PHONY: help build up down restart logs clean rebuild

help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## コンテナをビルド
	DOCKER_BUILDKIT=1 docker-compose build

up: ## コンテナを起動
	docker-compose up -d

down: ## コンテナを停止
	docker-compose down

restart: ## コンテナを再起動
	docker-compose restart

logs: ## ログを表示
	docker-compose logs -f

clean: ## すべてのコンテナとボリュームを削除
	docker-compose down -v
	docker system prune -f

rebuild: clean build up ## クリーンビルドして起動

dev: ## 開発環境を起動（ログ付き）
	docker-compose up

db-reset: ## データベースをリセット
	docker-compose exec backend bundle exec rails db:reset

db-migrate: ## マイグレーション実行
	docker-compose exec backend bundle exec rails db:migrate

db-seed: ## シードデータ投入
	docker-compose exec backend bundle exec rails db:seed

shell-backend: ## バックエンドのシェルに入る
	docker-compose exec backend sh

shell-frontend: ## フロントエンドのシェルに入る
	docker-compose exec frontend sh

shell-db: ## MySQLのシェルに入る
	docker-compose exec db mysql -uroot -ppassword myapp_development

ps: ## コンテナの状態を表示
	docker-compose ps

stats: ## リソース使用状況を表示
	docker stats

monitor: ## 詳細なパフォーマンス情報を表示
	./monitor.sh

setup: ## 初回セットアップを実行
	./setup.sh

health: ## ヘルスチェックを実行
	@echo "🏥 ヘルスチェック実行中..."
	@docker-compose ps
	@echo "\n📡 Backend ヘルスチェック:"
	@curl -f http://localhost:3001/health 2>/dev/null && echo "✅ Backend OK" || echo "❌ Backend NG"
	@echo "\n📡 Frontend ヘルスチェック:"
	@curl -f http://localhost:3000 2>/dev/null && echo "✅ Frontend OK" || echo "❌ Frontend NG"
	@echo "\n📡 MySQL ヘルスチェック:"
	@docker-compose exec -T db mysqladmin ping -h localhost -u root -ppassword 2>/dev/null && echo "✅ MySQL OK" || echo "❌ MySQL NG"

benchmark: ## ビルド時間をベンチマーク
	@echo "⏱️  ビルド時間計測中..."
	@time docker-compose build --no-cache

optimize: ## システム最適化を実行
	@echo "🔧 Docker システム最適化中..."
	docker system prune -f
	docker volume prune -f
	@echo "✅ 最適化完了"
