#!/bin/bash

# ============================================
# 쿠팡 소싱 도우미 - 초기 설정 스크립트
# ============================================

set -e

echo "=========================================="
echo "  쿠팡 소싱 도우미 - 초기 설정"
echo "=========================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Node.js 버전 확인
echo -e "${YELLOW}[1/5] Node.js 버전 확인...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION 설치됨${NC}"
else
    echo -e "${RED}✗ Node.js가 설치되지 않았습니다. https://nodejs.org 에서 설치해주세요.${NC}"
    exit 1
fi

# 2. 의존성 설치
echo ""
echo -e "${YELLOW}[2/5] 의존성 설치...${NC}"
npm install
echo -e "${GREEN}✓ 의존성 설치 완료${NC}"

# 3. 환경변수 파일 확인/생성
echo ""
echo -e "${YELLOW}[3/5] 환경변수 파일 확인...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local 파일 존재${NC}"
else
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo -e "${YELLOW}! .env.local.example을 복사하여 .env.local 생성${NC}"
        echo -e "${RED}! .env.local 파일을 열어 API 키를 설정해주세요${NC}"
    else
        echo -e "${RED}✗ .env.local.example 파일이 없습니다${NC}"
    fi
fi

# 4. 필수 환경변수 확인
echo ""
echo -e "${YELLOW}[4/5] 필수 환경변수 확인...${NC}"

check_env() {
    local var_name=$1
    local var_value=$(grep "^$var_name=" .env.local 2>/dev/null | cut -d '=' -f2)

    if [ -z "$var_value" ] || [[ "$var_value" == your_* ]]; then
        echo -e "${RED}  ✗ $var_name: 미설정${NC}"
        return 1
    else
        echo -e "${GREEN}  ✓ $var_name: 설정됨${NC}"
        return 0
    fi
}

echo "필수:"
check_env "NAVER_CLIENT_ID" || true
check_env "NAVER_CLIENT_SECRET" || true
check_env "CLAUDE_API_KEY" || true

echo ""
echo "선택 (Supabase 저장 기능):"
check_env "NEXT_PUBLIC_SUPABASE_URL" || true
check_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" || true

echo ""
echo "선택 (API 연동):"
check_env "COUPANG_ACCESS_KEY" || true
check_env "ALIBABA_1688_APP_KEY" || true

# 5. 빌드 테스트
echo ""
echo -e "${YELLOW}[5/5] 빌드 테스트...${NC}"
npm run build > /dev/null 2>&1 && echo -e "${GREEN}✓ 빌드 성공${NC}" || echo -e "${YELLOW}! 빌드 실패 - 환경변수 설정 후 다시 시도해주세요${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}  설정 완료!${NC}"
echo "=========================================="
echo ""
echo "실행 방법:"
echo "  개발 서버: npm run dev"
echo "  프로덕션:  npm run build && npm start"
echo ""
echo "접속 주소: http://localhost:3000"
echo ""
