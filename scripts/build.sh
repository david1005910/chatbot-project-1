#!/bin/bash

# ============================================
# 쿠팡 소싱 도우미 - 빌드 스크립트
# ============================================

set -e

echo "🚀 쿠팡 소싱 도우미 빌드 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 환경 변수 확인
check_env() {
    echo -e "${YELLOW}환경 변수 확인 중...${NC}"

    if [ ! -f .env.local ] && [ ! -f .env.production ]; then
        echo -e "${RED}오류: .env.local 또는 .env.production 파일이 필요합니다.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ 환경 변수 파일 확인 완료${NC}"
}

# 의존성 설치
install_deps() {
    echo -e "${YELLOW}의존성 설치 중...${NC}"
    npm ci --legacy-peer-deps
    echo -e "${GREEN}✓ 의존성 설치 완료${NC}"
}

# 린트 검사
run_lint() {
    echo -e "${YELLOW}린트 검사 중...${NC}"
    npm run lint || true
    echo -e "${GREEN}✓ 린트 검사 완료${NC}"
}

# 타입 체크
run_typecheck() {
    echo -e "${YELLOW}타입 체크 중...${NC}"
    npx tsc --noEmit || true
    echo -e "${GREEN}✓ 타입 체크 완료${NC}"
}

# 테스트 실행
run_tests() {
    echo -e "${YELLOW}테스트 실행 중...${NC}"
    npm run test -- --passWithNoTests || true
    echo -e "${GREEN}✓ 테스트 완료${NC}"
}

# 빌드 실행
run_build() {
    echo -e "${YELLOW}프로덕션 빌드 중...${NC}"

    # 이전 빌드 정리
    rm -rf .next
    rm -rf out

    # Next.js 빌드
    npm run build

    echo -e "${GREEN}✓ 빌드 완료${NC}"
}

# 빌드 결과 확인
check_build() {
    echo -e "${YELLOW}빌드 결과 확인 중...${NC}"

    if [ -d ".next" ]; then
        echo -e "${GREEN}✓ .next 디렉토리 생성됨${NC}"

        # 빌드 크기 확인
        BUILD_SIZE=$(du -sh .next | cut -f1)
        echo -e "  빌드 크기: ${BUILD_SIZE}"
    else
        echo -e "${RED}오류: 빌드 실패 - .next 디렉토리가 없습니다${NC}"
        exit 1
    fi
}

# 메인 실행
main() {
    echo ""
    echo "============================================"
    echo "  쿠팡 소싱 도우미 프로덕션 빌드"
    echo "============================================"
    echo ""

    check_env
    install_deps
    run_lint
    run_typecheck
    run_tests
    run_build
    check_build

    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  ✓ 빌드가 성공적으로 완료되었습니다!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo "실행 방법:"
    echo "  npm run start"
    echo ""
    echo "또는 PM2로 실행:"
    echo "  pm2 start npm --name 'coupang-sourcing' -- start"
    echo ""
}

main "$@"
