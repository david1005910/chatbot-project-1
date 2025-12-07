import { NextRequest, NextResponse } from 'next/server';
import { nicheKeywordSchema } from '@/lib/validation';
import Anthropic from '@anthropic-ai/sdk';

// JSON 추출 헬퍼
function extractJSON(text: string): string {
  // 먼저 ```json ... ``` 블록 추출 시도
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // { 로 시작하는 JSON 객체 찾기
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = nicheKeywordSchema.parse(body);

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `메인 키워드 "${validated.mainKeyword}"에 대한 틈새 키워드를 ${validated.maxResults}개 추천해주세요.

각 키워드에 대해 다음 정보를 JSON 형식으로 제공해주세요:
- keyword: 틈새 키워드
- searchVolume: 예상 월간 검색량 (숫자)
- competition: 경쟁강도 ("상", "중", "하" 중 하나)
- cpc: 예상 클릭당 비용 (원, 숫자)
- relevanceScore: 메인 키워드와의 연관성 점수 (0-100)
- recommendedTitle: 이 키워드를 활용한 추천 상품명
- reasoning: 이 키워드를 추천하는 이유

반드시 유효한 JSON만 반환하세요. 코드블록이나 설명 없이 순수 JSON만 출력하세요.

형식:
{
  "nicheKeywords": [
    {
      "keyword": "틈새키워드1",
      "searchVolume": 5000,
      "competition": "하",
      "cpc": 150,
      "relevanceScore": 85,
      "recommendedTitle": "추천 상품명",
      "reasoning": "추천 이유"
    }
  ],
  "titleSuggestions": [
    { "keyword": "키워드", "titles": ["제품명1", "제품명2", "제품명3"] }
  ]
}`,
        },
      ],
      system:
        '당신은 쿠팡 마켓플레이스 전문 키워드 분석가입니다. 경쟁을 회피할 수 있는 롱테일 키워드를 발굴하는 전문가입니다. 반드시 유효한 JSON 형식으로만 응답하세요. 마크다운 코드 블록을 사용하지 마세요.',
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // JSON 추출 및 파싱
    const jsonText = extractJSON(content.text);
    let parsed;

    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw text:', content.text);
      console.error('Extracted JSON:', jsonText);

      // 폴백: 기본 응답 생성
      parsed = {
        nicheKeywords: [
          {
            keyword: `${validated.mainKeyword} 추천`,
            searchVolume: 3000,
            competition: '중',
            cpc: 200,
            relevanceScore: 80,
            recommendedTitle: `${validated.mainKeyword} 베스트셀러`,
            reasoning: '기본 롱테일 키워드 조합입니다.',
          },
          {
            keyword: `${validated.mainKeyword} 인기`,
            searchVolume: 2500,
            competition: '중',
            cpc: 180,
            relevanceScore: 75,
            recommendedTitle: `${validated.mainKeyword} 인기상품`,
            reasoning: '검색 수요가 있는 키워드입니다.',
          },
          {
            keyword: `${validated.mainKeyword} 가성비`,
            searchVolume: 2000,
            competition: '하',
            cpc: 120,
            relevanceScore: 70,
            recommendedTitle: `가성비 좋은 ${validated.mainKeyword}`,
            reasoning: '가격 민감 고객을 타겟팅합니다.',
          },
        ],
        titleSuggestions: [
          {
            keyword: validated.mainKeyword,
            titles: [
              `${validated.mainKeyword} 베스트셀러 1위`,
              `프리미엄 ${validated.mainKeyword}`,
              `${validated.mainKeyword} 대용량 특가`,
            ],
          },
        ],
        notice: 'AI 응답 파싱 오류로 기본 데이터가 제공됩니다.',
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        mainKeyword: validated.mainKeyword,
        ...parsed,
      },
    });
  } catch (error) {
    console.error('Niche keyword API error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
