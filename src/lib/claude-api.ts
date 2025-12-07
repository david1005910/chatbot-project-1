import Anthropic from '@anthropic-ai/sdk';
import type { ClaudeAnalyzeRequest, ClaudeAnalyzeResponse } from '@/types';

export async function analyzeWithClaude(
  request: ClaudeAnalyzeRequest
): Promise<ClaudeAnalyzeResponse> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }

  const anthropic = new Anthropic({
    apiKey,
  });

  const systemPrompt = `당신은 숙련된 온라인 쇼핑몰 소싱 전문가입니다.
특히 쿠팡 마켓플레이스에 대한 깊은 이해를 가지고 있습니다.

분석 기준:
1. 부피가 크지 않은 제품 (택배 배송 가능)
2. 의류 카테고리 제외
3. 쿠팡 소비자 검색 패턴 기반

중요: 응답은 반드시 순수 JSON 형식으로만 출력하세요.
- 코드 블록 마커(\`\`\`)를 사용하지 마세요.
- JSON 외의 어떤 설명이나 텍스트도 포함하지 마세요.
- 데이터가 부족하면 추론하여 분석 결과를 생성하세요.`;

  const userPrompt = `다음 트렌드 데이터를 분석하여 TOP 10 유망 키워드를 선정해주세요.

트렌드 데이터:
${JSON.stringify(request.trendData, null, 2)}

사용자 조건:
${JSON.stringify(request.userCriteria, null, 2)}

각 키워드에 대해 다음을 포함해주세요:
1. 유망한 이유 (구체적 근거)
2. 예상 성장 잠재력 (상/중/하)
3. 경쟁 강도 예측 (상/중/하)
4. 최적 진입 시기
5. 계절성 패턴
6. 추천 틈새 키워드 3개

JSON 형식으로 응답해주세요:
{
  "top10Keywords": [
    {
      "rank": 1,
      "keyword": "키워드명",
      "growthPotential": "상",
      "competitionLevel": "중",
      "reason": "유망 이유",
      "recommendedTiming": "진입 시기",
      "seasonalPattern": "계절성 패턴",
      "nicheKeywords": ["틈새1", "틈새2", "틈새3"]
    }
  ],
  "analysisInsights": "전체 분석 인사이트"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Clean up the response text - remove markdown code blocks if present
    let jsonText = content.text.trim();

    // Remove ```json and ``` markers
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }

    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }

    jsonText = jsonText.trim();

    // Try to extract JSON from the response if it's wrapped in other text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      // If JSON parsing fails, return a default response structure
      console.error('Failed to parse JSON, returning default structure. Raw response:', content.text.substring(0, 500));
      parsed = {
        top10Keywords: [],
        analysisInsights: '데이터 분석 중 오류가 발생했습니다. 다시 시도해 주세요.',
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}
