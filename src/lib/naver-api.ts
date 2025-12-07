import axios from 'axios';
import type { NaverTrendRequest, NaverTrendResponse } from '@/types';
import { getCategoryName } from './naver-categories';

const NAVER_DATALAB_CATEGORY_URL = 'https://openapi.naver.com/v1/datalab/shopping/categories';
const NAVER_DATALAB_KEYWORD_URL = 'https://openapi.naver.com/v1/datalab/shopping/category/keywords';

export async function fetchNaverTrend(
  params: NaverTrendRequest
): Promise<NaverTrendResponse> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Naver API credentials not configured');
  }

  try {
    const response = await axios.post(
      NAVER_DATALAB_CATEGORY_URL,
      {
        startDate: params.startDate,
        endDate: params.endDate,
        timeUnit: params.timeUnit,
        category: params.category.map((cat) => ({
          name: getCategoryName(cat), // 카테고리 코드를 이름으로 변환
          param: [cat]
        })),
        device: params.device || '',
        gender: params.gender || '',
        ages: params.ages || [],
      },
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json',
        },
      }
    );

    // 결과에서도 카테고리 코드를 이름으로 변환
    const transformedData = response.data.results.map((result: { title: string; keywords?: string[]; data: { period: string; ratio: number }[] }) => ({
      ...result,
      title: getCategoryName(result.title) || result.title,
      keywords: result.keywords?.map((kw: string) => getCategoryName(kw) || kw) || [],
    }));

    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.errorMessage || error.message,
      };
    }
    throw error;
  }
}

// 카테고리 내 인기 키워드 검색
export interface KeywordTrendRequest {
  startDate: string;
  endDate: string;
  timeUnit: 'date' | 'week' | 'month';
  category: string; // 카테고리 코드
  device?: 'pc' | 'mo' | '';
  gender?: 'm' | 'f' | '';
  ages?: string[];
}

export interface KeywordTrendResponse {
  success: boolean;
  data: {
    title: string;
    keyword: string[];
    data: {
      period: string;
      ratio: number;
    }[];
  }[];
  error?: string;
}

export async function fetchKeywordTrend(
  params: KeywordTrendRequest
): Promise<KeywordTrendResponse> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Naver API credentials not configured');
  }

  try {
    const response = await axios.post(
      NAVER_DATALAB_KEYWORD_URL,
      {
        startDate: params.startDate,
        endDate: params.endDate,
        timeUnit: params.timeUnit,
        category: params.category,
        device: params.device || '',
        gender: params.gender || '',
        ages: params.ages || [],
      },
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data.results,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.errorMessage || error.message,
      };
    }
    throw error;
  }
}

// 쇼핑 키워드별 트렌드 (실제 검색어 기반)
export interface ShoppingKeywordRequest {
  startDate: string;
  endDate: string;
  timeUnit: 'date' | 'week' | 'month';
  keyword: { name: string; param: string[] }[]; // 실제 키워드 (예: "블루투스 이어폰")
  device?: 'pc' | 'mo' | '';
  gender?: 'm' | 'f' | '';
  ages?: string[];
}

export async function fetchShoppingKeywordTrend(
  params: ShoppingKeywordRequest
): Promise<NaverTrendResponse> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Naver API credentials not configured');
  }

  const NAVER_SEARCH_KEYWORD_URL = 'https://openapi.naver.com/v1/datalab/shopping/category/keyword/age';

  try {
    const response = await axios.post(
      NAVER_SEARCH_KEYWORD_URL,
      {
        startDate: params.startDate,
        endDate: params.endDate,
        timeUnit: params.timeUnit,
        keyword: params.keyword,
        device: params.device || '',
        gender: params.gender || '',
        ages: params.ages || [],
      },
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data.results,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.errorMessage || error.message,
      };
    }
    throw error;
  }
}
