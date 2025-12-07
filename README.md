# 🛒 쿠팡 소싱 도우미

[![Next.js](https://img.shields.io/badge/Next.js-14.2.33-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Security](https://img.shields.io/badge/Security-Patched-brightgreen)](https://github.com/david1005910/chatbot-project-1/security)

네이버 트렌드 분석과 AI 기반 키워드 추천을 활용한 쿠팡 셀러 소싱 도우미 웹 애플리케이션입니다.

> 🔒 **보안**: Next.js 14.2.33으로 업그레이드하여 CVE-2024-XXXX (CVSS 9.1) 취약점 패치 완료
> ♿ **접근성**: WCAG 2.1 Level AA 준수
> 🌙 **다크 모드**: 완전 지원

## 주요 기능

- **트렌드 분석**: 네이버 데이터랩 API를 활용한 키워드 트렌드 분석
- **AI 기반 트렌드 예측**: 앙상블 시계열 모델로 미래 30일 트렌드 예측 (95% 신뢰구간 포함)
- **계절성 분석**: 상품별 계절성 자동 분류 (상록수/계절성/고계절성)
- **AI 키워드 추천**: Claude AI를 활용한 틈새 키워드 및 상품명 추천
- **경쟁 분석**: 쿠팡 키워드별 경쟁강도 분석
- **소싱처 검색**: 1688, 타오바오, 알리익스프레스 상품 검색
- **마진 계산기**: 쿠팡 판매 수익 시뮬레이션
- **데이터 저장**: Supabase 연동으로 분석 결과 저장/내보내기

## 빠른 시작

### 1. 설치

```bash
# 저장소 클론
git clone https://github.com/david1005910/chatbot-project-1.git
cd chatbot-project-1

# 설정 스크립트 실행
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. 환경변수 설정

`.env.local` 파일을 열어 API 키를 설정합니다:

```env
# 필수 설정
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
CLAUDE_API_KEY=your_claude_api_key

# Supabase (데이터 저장 기능)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 실행

```bash
# 개발 서버
./scripts/dev.sh
# 또는
npm run dev

# 프로덕션 서버
./scripts/start.sh
# 또는
npm run build && npm start
```

접속: http://localhost:3000

## API 키 발급 안내

### 필수 API

| API | 용도 | 발급 URL |
|-----|------|----------|
| 네이버 데이터랩 | 트렌드 분석 | https://developers.naver.com/apps |
| Claude (Anthropic) | AI 분석 | https://console.anthropic.com |

### 선택 API

| API | 용도 | 발급 URL |
|-----|------|----------|
| Supabase | 데이터 저장 | https://supabase.com |
| Coupang Partners | 쿠팡 상품 검색 | https://partners.coupang.com |
| 1688 | 중국 도매 검색 | https://open.1688.com |
| 타오바오 | 중국 소매 검색 | https://open.taobao.com |
| AliExpress | 알리 상품 검색 | https://portals.aliexpress.com |

## 프로젝트 구조

```
chatbot-project/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── api/               # API 라우트
│   │   │   ├── naver/         # 네이버 트렌드 API
│   │   │   ├── claude/        # Claude AI API
│   │   │   ├── coupang/       # 쿠팡 검색/경쟁분석
│   │   │   ├── keyword/       # 키워드 분석
│   │   │   └── sourcing/      # 소싱처 검색
│   │   ├── sourcing/          # 소싱처 검색 페이지
│   │   ├── analysis/          # 분석 결과 페이지
│   │   ├── calculator/        # 마진 계산기
│   │   └── ...
│   ├── components/            # React 컴포넌트
│   ├── lib/                   # 유틸리티 및 API 클라이언트
│   │   ├── supabase/          # Supabase 클라이언트
│   │   ├── ensemble-forecast-model.ts  # 앙상블 예측 모델 (SARIMA+ETS+Theta)
│   │   ├── lstm-model.ts      # 기본 LSTM 예측 모델 (레거시)
│   │   ├── advanced-trend-model.ts  # 고급 STL+BiLSTM 모델
│   │   ├── coupang-partners-api.ts
│   │   └── ...
│   └── types/                 # TypeScript 타입 정의
├── supabase/
│   └── schema.sql            # 데이터베이스 스키마
├── scripts/
│   ├── setup.sh              # 초기 설정
│   ├── dev.sh                # 개발 서버 실행
│   └── start.sh              # 프로덕션 서버 실행
└── .env.local.example        # 환경변수 예제
```

## Supabase 설정

데이터 저장 기능을 사용하려면:

1. https://supabase.com 에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Settings > API에서 URL과 anon key 복사
4. `.env.local`에 설정

## 기술 스택

- **Framework**: Next.js 14.2.33 (App Router, CVE 패치 완료)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS + Dark Mode
- **State**: Zustand
- **Validation**: Zod
- **AI**: Claude API (Anthropic)
- **ML**: TensorFlow.js (시계열 예측)
- **Database**: Supabase (PostgreSQL) - 선택사항
- **APIs**: Naver DataLab, Coupang Partners, 1688, Taobao, AliExpress
- **Accessibility**: WCAG 2.1 Level AA 준수

## 트렌드 예측 모델

본 프로젝트는 **앙상블 시계열 예측 모델**을 사용하여 키워드 트렌드를 예측합니다.
최신 연구 기반으로 여러 모델을 결합하여 단일 모델보다 높은 정확도를 제공합니다.

### 앙상블 모델 구성

| 모델 | 설명 | 강점 |
|------|------|------|
| **SARIMA** | Seasonal ARIMA | 계절성 시계열에 최적 |
| **ETS** | Error-Trend-Seasonality | 상태공간 모델, 안정적 |
| **Theta** | M3 Competition 우승 | 단순하지만 효과적 |
| **Damped Trend** | 감쇠 트렌드 | 장기 예측 안정성 |

### 주요 특징

- **Cross-Validation 기반 가중치**: 각 모델의 정확도에 따라 동적으로 가중치 결정
- **자동 계절 주기 감지**: 자기상관 분석으로 최적 주기 탐지 (주간/월간/연간)
- **95% 신뢰구간**: 시간에 따라 증가하는 불확실성 반영
- **정확도 지표 제공**: MAPE, RMSE, MAE 자동 계산

### 모델 비교 (이전 vs 현재)

| 항목 | 이전 (단일 LSTM) | 현재 (앙상블) |
|------|-----------------|---------------|
| 계절성 처리 | 단순 평균 | SARIMA + ETS |
| 장기 예측 | 불안정 | Damped Trend로 안정화 |
| 신뢰구간 | 고정 | 시간에 따라 증가 |
| 가중치 | 고정 | Cross-Validation 기반 |

### 예측 결과

```typescript
{
  predictions: [...],      // 예측값 배열
  confidence: 85,          // 모델 신뢰도 (0-100)
  confidenceLower: [...],  // 95% 신뢰구간 하한
  confidenceUpper: [...],  // 95% 신뢰구간 상한
  seasonality: {
    pattern: "1월, 12월 성수기, 6월, 7월 비수기",
    peakMonths: [1, 12],
    lowMonths: [6, 7],
    strength: 72,          // 계절성 강도
    period: 30             // 감지된 주기 (일)
  },
  trendDirection: "up",    // 트렌드 방향
  trendStrength: 45,       // 트렌드 강도
  modelWeights: {          // 앙상블 가중치
    sarima: 0.35,
    ets: 0.30,
    theta: 0.20,
    dampedTrend: 0.15
  },
  accuracy: {              // 정확도 지표
    mape: 8.5,             // Mean Absolute Percentage Error
    rmse: 12.3,            // Root Mean Squared Error
    mae: 9.8               // Mean Absolute Error
  }
}
```

### 참고 문헌

- [Time Series Forecasting Best Practices 2024-2025](https://towardsdatascience.com/influential-time-series-forecasting-papers-of-2023-2024-part-1)
- [Ensemble Methods for Time Series](https://www.nature.com/articles/s41467-025-63786-4)

## 트렌드 차트 기능

### 인터랙티브 차트

- **기간 선택**: 1주, 1개월, 3개월, 6개월, 1년, 2년, 전체 중 선택
- **드래그 줌**: 차트를 드래그하여 특정 기간 확대
- **미니맵 네비게이터**: 하단 브러시로 빠른 기간 탐색
- **미래 예측 표시**: 오늘 기준 30일 후까지 예측 (초록색 점선)

### 통계 요약

| 항목 | 설명 | 색상 |
|------|------|------|
| **최저** | 선택 기간 내 최저 검색량 | 파란색 |
| **최고** | 선택 기간 내 최고 검색량 | 빨간색 |
| **평균** | 선택 기간 평균 검색량 | 보라색 |
| **변화율** | 기간 시작~종료 변화율 (%) | 녹색(상승)/빨간색(하락) |

### 예측 시각화

- **실제 검색량**: 파란색 실선
- **예측 검색량**: 초록색 점선 (미래 30일)
- **95% 신뢰구간**: 연한 초록색 영역
- **오늘 기준선**: 세로 점선으로 과거/미래 구분

## 계절성 분석 기능

상품의 계절성을 자동으로 분류하여 판매 전략 수립에 활용합니다.

### 계절성 유형

| 유형 | 강도 | 색상 | 설명 |
|------|------|------|------|
| **상록수 (Evergreen)** | < 20% | 에메랄드 | 연중 안정적 수요, 재고 관리 용이 |
| **계절성 (Seasonal)** | 20-50% | 앰버 | 중간 계절 변동, 성수기 전 재고 확보 권장 |
| **고계절성 (Highly Seasonal)** | ≥ 50% | 로즈 | 특정 계절 수요 집중, 비수기 재고 최소화 |

### 월별 수요 분포

- **성수기**: 빨간색 바 + ▲ 표시
- **비수기**: 파란색 바 + ▼ 표시
- **보통**: 회색 바

### 분석 결과

```typescript
{
  type: 'seasonal',           // 계절성 유형
  strength: 42,               // 계절성 강도 (0-100)
  peakMonths: [1, 12],        // 성수기 월
  lowMonths: [6, 7],          // 비수기 월
  pattern: "1월, 12월에 수요 증가",
  recommendation: "성수기 전 재고 확보 권장, 비수기에는 프로모션 고려"
}
```

## 스크립트

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm start         # 프로덕션 서버 실행
npm run lint      # 린트 검사
```

## 라이선스

MIT License
