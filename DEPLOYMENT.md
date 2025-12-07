# 배포 가이드 (Deployment Guide)

## 목차
- [Vercel 배포 (권장)](#vercel-배포-권장)
- [수동 배포](#수동-배포)
- [GitHub Actions 자동 배포](#github-actions-자동-배포)
- [환경 변수 설정](#환경-변수-설정)
- [도메인 설정](#도메인-설정)
- [문제 해결](#문제-해결)

---

## Vercel 배포 (권장)

### 방법 1: Vercel 웹 대시보드 (가장 쉬움)

1. **Vercel 계정 생성**
   - https://vercel.com/signup 방문
   - GitHub 계정으로 로그인

2. **프로젝트 임포트**
   - "Add New Project" 클릭
   - GitHub 저장소 `david1005910/chatbot-project-1` 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - Framework Preset: Next.js (자동 감지됨)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (자동)
   - Install Command: `npm install` (자동)

4. **환경 변수 추가**

   Environment Variables 섹션에서 다음 변수를 추가:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NAVER_CLIENT_ID` | 네이버 클라이언트 ID | Production, Preview, Development |
   | `NAVER_CLIENT_SECRET` | 네이버 클라이언트 시크릿 | Production, Preview, Development |
   | `CLAUDE_API_KEY` | Claude API 키 | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (선택) | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key (선택) | Production, Preview, Development |

5. **배포**
   - "Deploy" 버튼 클릭
   - 배포 완료 대기 (약 2-3분)
   - 배포 URL 확인: `https://your-project.vercel.app`

### 방법 2: Vercel CLI

1. **Vercel CLI 설치** (이미 완료됨)
   ```bash
   npm install -g vercel
   ```

2. **Vercel 로그인**
   ```bash
   vercel login
   # 이메일 입력 후 확인 메일의 "Verify" 클릭
   ```

3. **프로젝트 배포**
   ```bash
   # 프로젝트 디렉토리에서 실행
   vercel

   # 프로덕션 배포
   vercel --prod
   ```

4. **환경 변수 설정**
   ```bash
   # 환경 변수 추가
   vercel env add NAVER_CLIENT_ID production
   vercel env add NAVER_CLIENT_SECRET production
   vercel env add CLAUDE_API_KEY production

   # 환경 변수 확인
   vercel env ls
   ```

5. **재배포**
   ```bash
   vercel --prod
   ```

---

## 수동 배포

### 프로덕션 빌드

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t coupang-sourcing-assistant .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e NAVER_CLIENT_ID=your_id \
  -e NAVER_CLIENT_SECRET=your_secret \
  -e CLAUDE_API_KEY=your_key \
  coupang-sourcing-assistant
```

---

## GitHub Actions 자동 배포

### 설정 단계

1. **Vercel 토큰 발급**
   - Vercel Dashboard → Settings → Tokens
   - "Create Token" 클릭
   - 토큰 복사

2. **Vercel 프로젝트 정보 확인**
   ```bash
   # 프로젝트 설정 파일 확인
   cat .vercel/project.json
   ```

   다음 정보를 찾아 기록:
   - `orgId`: Vercel Organization ID
   - `projectId`: Vercel Project ID

3. **GitHub Secrets 설정**

   GitHub 저장소 → Settings → Secrets and variables → Actions

   다음 Secrets 추가:
   - `VERCEL_TOKEN`: Vercel 토큰
   - `VERCEL_ORG_ID`: Organization ID
   - `VERCEL_PROJECT_ID`: Project ID

4. **자동 배포 활성화**

   이미 `.github/workflows/deploy.yml`이 설정되어 있습니다.

   - `main` 브랜치에 푸시하면 자동으로 프로덕션 배포
   - Pull Request 생성 시 프리뷰 배포

### 배포 워크플로우

```
1. 코드 변경 및 커밋
   ↓
2. GitHub에 푸시
   ↓
3. GitHub Actions 자동 실행
   ↓
4. Vercel에 자동 배포
   ↓
5. 배포 완료 알림
```

---

## 환경 변수 설정

### 필수 환경 변수

| 변수명 | 설명 | 필수 여부 | 발급 위치 |
|--------|------|-----------|-----------|
| `NAVER_CLIENT_ID` | 네이버 DataLab API 클라이언트 ID | ✅ 필수 | https://developers.naver.com/apps |
| `NAVER_CLIENT_SECRET` | 네이버 DataLab API 시크릿 | ✅ 필수 | https://developers.naver.com/apps |
| `CLAUDE_API_KEY` | Claude (Anthropic) API 키 | ✅ 필수 | https://console.anthropic.com |

### 선택 환경 변수

| 변수명 | 설명 | 필수 여부 | 발급 위치 |
|--------|------|-----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 선택 | https://supabase.com/dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon 키 | 선택 | https://supabase.com/dashboard |
| `UPSTASH_REDIS_REST_URL` | Redis 캐시 URL | 선택 | https://upstash.com |
| `UPSTASH_REDIS_REST_TOKEN` | Redis 토큰 | 선택 | https://upstash.com |

### Vercel에서 환경 변수 추가 방법

#### 웹 대시보드
1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. 변수 추가:
   - Name: 변수명
   - Value: 변수값
   - Environment: Production, Preview, Development 선택
4. "Save" 클릭

#### CLI
```bash
vercel env add VARIABLE_NAME production
# 값 입력
```

---

## 도메인 설정

### 커스텀 도메인 연결

1. **Vercel 대시보드에서 설정**
   - 프로젝트 → Settings → Domains
   - "Add Domain" 클릭
   - 도메인 입력 (예: `coupang-sourcing.com`)

2. **DNS 설정**

   도메인 등록업체에서 다음 레코드 추가:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **HTTPS 자동 활성화**
   - Vercel이 자동으로 SSL 인증서 발급
   - 약 5-10분 소요

---

## 문제 해결

### 빌드 오류

**문제**: `Module not found` 오류
```bash
# 해결: 의존성 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

**문제**: TypeScript 타입 오류
```bash
# 해결: 타입 체크
npx tsc --noEmit
```

### 환경 변수 문제

**문제**: 환경 변수가 로드되지 않음

**해결**:
1. Vercel Dashboard에서 환경 변수 확인
2. 변수명이 정확한지 확인 (대소문자 구분)
3. 재배포 (`vercel --prod`)

### 성능 문제

**문제**: 느린 로딩 속도

**해결**:
1. 이미지 최적화 확인 (`next/image` 사용)
2. 코드 스플리팅 확인
3. Vercel Analytics 활성화하여 성능 모니터링

### API 오류

**문제**: 403 Forbidden 또는 CORS 오류

**해결**:
1. API 키 권한 확인
2. Naver Developer Console에서 서비스 URL 등록
3. `vercel.json`에서 CORS 설정 확인

---

## 배포 체크리스트

배포 전 확인사항:

- [ ] 모든 환경 변수가 설정되었는지 확인
- [ ] 로컬에서 `npm run build` 성공하는지 확인
- [ ] API 키가 유효한지 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되었는지 확인
- [ ] `package.json`의 `scripts`가 올바른지 확인
- [ ] Supabase 설정 (선택사항)이 완료되었는지 확인

배포 후 확인사항:

- [ ] 프로덕션 URL에서 페이지가 로드되는지 확인
- [ ] 트렌드 분석 기능이 작동하는지 테스트
- [ ] 마진 계산기가 정상 작동하는지 확인
- [ ] 다크 모드가 작동하는지 확인
- [ ] 모바일 반응형이 정상인지 확인

---

## 도움이 필요하신가요?

- 📖 [Vercel 공식 문서](https://vercel.com/docs)
- 💬 [GitHub Issues](https://github.com/david1005910/chatbot-project-1/issues)
- 📧 [Vercel 지원팀](https://vercel.com/support)

---

**축하합니다!** 🎉
프로젝트가 성공적으로 배포되었습니다!
