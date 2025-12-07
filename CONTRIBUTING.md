# 기여 가이드 (Contributing Guide)

쿠팡 소싱 도우미 프로젝트에 기여해 주셔서 감사합니다! 🎉

## 목차

- [행동 강령](#행동-강령)
- [시작하기](#시작하기)
- [개발 워크플로우](#개발-워크플로우)
- [코드 스타일](#코드-스타일)
- [커밋 메시지](#커밋-메시지)
- [Pull Request 프로세스](#pull-request-프로세스)
- [이슈 보고](#이슈-보고)

## 행동 강령

이 프로젝트는 모든 기여자가 존중받는 환경을 유지합니다. 참여함으로써 귀하는 이 행동 강령을 준수하는 데 동의합니다.

## 시작하기

### 1. 저장소 포크 및 클론

```bash
# 저장소 포크 (GitHub 웹에서)
# 그 다음 클론
git clone https://github.com/YOUR_USERNAME/chatbot-project-1.git
cd chatbot-project-1

# 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/david1005910/chatbot-project-1.git
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp .env.local.example .env.local
# .env.local 파일을 열어 API 키 설정
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 개발 워크플로우

### 새로운 기능 개발

1. **최신 코드 가져오기**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **새 브랜치 생성**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **개발 진행**
   - 코드 작성
   - 테스트 추가/수정
   - 린트 검사 통과

4. **커밋**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **푸시 및 PR 생성**
   ```bash
   git push origin feature/your-feature-name
   # GitHub에서 Pull Request 생성
   ```

## 코드 스타일

### TypeScript/JavaScript

- **린터**: ESLint 설정 준수
- **포맷터**: Prettier 자동 포맷팅
- **네이밍**:
  - 컴포넌트: PascalCase (예: `TrendChart.tsx`)
  - 함수/변수: camelCase (예: `fetchTrendData`)
  - 상수: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
  - 타입/인터페이스: PascalCase (예: `TrendData`)

### React 컴포넌트

```typescript
// ✅ 좋은 예
export function TrendChart({ data, loading }: TrendChartProps) {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="trend-chart">
      {/* 컴포넌트 내용 */}
    </div>
  );
}

// ❌ 나쁜 예
export default function trendChart(props: any) {
  // ...
}
```

### Tailwind CSS

- 유틸리티 클래스 우선 사용
- 다크 모드 지원: `dark:` prefix 사용
- 반응형 디자인: `sm:`, `md:`, `lg:` breakpoints

## 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스, 도구 설정 등

### 예시

```bash
feat(trend-chart): add zoom functionality to trend visualization

- Implement drag-to-zoom on chart
- Add reset zoom button
- Update chart legend with zoom indicator

Closes #123
```

## Pull Request 프로세스

### PR 체크리스트

- [ ] 코드가 린트 검사를 통과함 (`npm run lint`)
- [ ] 타입 체크 통과 (`npx tsc --noEmit`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 테스트 통과 (`npm test`)
- [ ] 새 기능에 대한 테스트 추가
- [ ] 문서 업데이트 (필요 시)
- [ ] 커밋 메시지가 Conventional Commits 형식을 따름

### PR 템플릿

```markdown
## 변경 사항

<!-- 변경 사항을 간단히 설명해주세요 -->

## 동기 및 맥락

<!-- 왜 이 변경이 필요한가요? 어떤 문제를 해결하나요? -->
Closes #(이슈 번호)

## 테스트 방법

<!-- 이 변경 사항을 어떻게 테스트했나요? -->

1.
2.
3.

## 스크린샷 (UI 변경 시)

<!-- UI 변경이 있다면 스크린샷을 첨부해주세요 -->

## 체크리스트

- [ ] 린트 검사 통과
- [ ] 타입 체크 통과
- [ ] 빌드 성공
- [ ] 테스트 추가/업데이트
```

### 리뷰 프로세스

1. CI/CD 파이프라인 통과 대기
2. 코드 리뷰 피드백 반영
3. 승인 후 병합

## 이슈 보고

### 버그 리포트

```markdown
**버그 설명**
명확하고 간단한 버그 설명

**재현 방법**
1. '...'로 이동
2. '...' 클릭
3. '...'까지 스크롤
4. 오류 확인

**예상 동작**
어떤 동작이 예상되었는지 설명

**실제 동작**
실제로 어떤 동작이 일어났는지 설명

**스크린샷**
해당하는 경우 스크린샷 추가

**환경**
- OS: [예: macOS 14.0]
- 브라우저: [예: Chrome 120]
- Node.js 버전: [예: 20.10.0]
- Next.js 버전: [예: 14.2.33]

**추가 정보**
기타 필요한 정보
```

### 기능 제안

```markdown
**제안하는 기능과 관련된 문제가 있나요?**
예: 항상 [...] 할 때 불편합니다

**원하는 해결 방법**
명확하고 간단한 해결 방법 설명

**고려한 대안**
고려한 다른 해결 방법이나 기능 설명

**추가 정보**
기능 제안에 대한 기타 정보나 스크린샷
```

## 개발 가이드라인

### API 키 보안

- **절대** `.env.local` 파일을 커밋하지 마세요
- 환경 변수 예제는 `.env.local.example`에만 추가
- 실제 API 키는 placeholder 값으로 대체

### 접근성

- WCAG 2.1 Level AA 준수
- ARIA 라벨 추가
- 키보드 네비게이션 지원
- 스크린 리더 호환

### 성능

- 이미지 최적화 (`next/image` 사용)
- 코드 스플리팅
- 메모이제이션 (`useMemo`, `useCallback`)
- 불필요한 리렌더링 방지

### 테스트

```bash
# 단위 테스트
npm test

# 커버리지
npm test -- --coverage

# 특정 파일 테스트
npm test -- path/to/test.ts
```

## 질문이 있나요?

- 이슈 생성: [GitHub Issues](https://github.com/david1005910/chatbot-project-1/issues)
- 토론: [GitHub Discussions](https://github.com/david1005910/chatbot-project-1/discussions)

---

다시 한 번 기여에 감사드립니다! 🚀
