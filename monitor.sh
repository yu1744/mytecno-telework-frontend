#!/bin/bash
# Dockerパフォーマンスモニタリングスクリプト

echo "📊 Docker パフォーマンスモニタリング"
echo "======================================"

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# コンテナの状態
echo -e "\n${BLUE}【コンテナ状態】${NC}"
docker-compose ps

# リソース使用状況
echo -e "\n${BLUE}【リソース使用状況】${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# イメージサイズ
echo -e "\n${BLUE}【イメージサイズ】${NC}"
docker images | grep -E "frontend|backend|mysql" | awk '{printf "%-40s %-15s %-15s\n", $1":"$2, $7, $3}'

# ボリュームサイズ
echo -e "\n${BLUE}【ボリュームサイズ】${NC}"
docker system df -v | grep -A 20 "Local Volumes:" | head -n 10

# ビルドキャッシュ
echo -e "\n${BLUE}【ビルドキャッシュ】${NC}"
docker buildx du --verbose 2>/dev/null || docker system df | grep "Build Cache"

# コンテナログサイズ
echo -e "\n${BLUE}【ログファイルサイズ（上位5つ）】${NC}"
docker ps -q | xargs -I {} sh -c 'docker inspect --format="{{.Name}}: {{.LogPath}}" {} | xargs -I @ sh -c "echo @ && du -h $(echo @ | cut -d: -f2) 2>/dev/null"' | grep -v "^$" | sort -hr | head -n 10

# 推奨事項
echo -e "\n${YELLOW}【最適化推奨事項】${NC}"
TOTAL_SIZE=$(docker system df | grep "Images" | awk '{print $4}')
echo "- 現在の総ディスク使用量: $TOTAL_SIZE"

RECLAIMABLE=$(docker system df | grep "Images" | awk '{print $7}')
if [ ! -z "$RECLAIMABLE" ]; then
    echo "- 回収可能な容量: $RECLAIMABLE"
    echo "  → make clean で不要なデータを削除できます"
fi

# ビルドキャッシュのサイズをチェック
BUILD_CACHE_SIZE=$(docker system df | grep "Build Cache" | awk '{print $4}')
if [ ! -z "$BUILD_CACHE_SIZE" ]; then
    echo "- ビルドキャッシュ: $BUILD_CACHE_SIZE"
fi

echo -e "\n${GREEN}【クイックアクション】${NC}"
echo "  make clean     - 不要なコンテナとイメージを削除"
echo "  make rebuild   - クリーンビルドして起動"
echo "  make logs      - ログを確認"
echo ""
