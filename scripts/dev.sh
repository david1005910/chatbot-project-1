#!/bin/bash

# ============================================
# 쿠팡 소싱 도우미 - 개발 서버 실행
# ============================================

echo "=========================================="
echo "  쿠팡 소싱 도우미 - 개발 서버"
echo "=========================================="
echo ""

# 환경변수 파일 확인
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local 파일이 없습니다."
    echo "   먼저 ./scripts/setup.sh 를 실행해주세요."
    exit 1
fi

# 포트 사용 중인지 확인
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  포트 3000이 이미 사용 중입니다."
    read -p "기존 프로세스를 종료하시겠습니까? (y/n): " choice
    if [ "$choice" = "y" ]; then
        kill $(lsof -Pi :3000 -sTCP:LISTEN -t) 2>/dev/null
        echo "✓ 기존 프로세스 종료됨"
        sleep 1
    else
        echo "다른 포트로 실행하려면: PORT=3001 npm run dev"
        exit 1
    fi
fi

echo "🚀 개발 서버 시작..."
echo "   접속 주소: http://localhost:3000"
echo ""
echo "   종료: Ctrl+C"
echo ""

# .next 캐시 정리 후 실행
rm -rf .next
npm run dev
