import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';

export interface CoupangProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discountRate: number;
  rating: number;
  reviewCount: number;
  isRocketDelivery: boolean;
  isRocketWow: boolean;
  isFreeShipping: boolean;
  imageUrl: string;
  productUrl: string;
  seller: string;
  rank?: number;
}

export interface CoupangSearchResult {
  keyword: string;
  totalProducts: number;
  products: CoupangProduct[];
  priceStats: {
    min: number;
    max: number;
    avg: number;
  };
  rocketDeliveryRatio: number;
}

// 브라우저 인스턴스 재사용을 위한 싱글톤
let browserInstance: Browser | null = null;
let lastBrowserUse = 0;
const BROWSER_TIMEOUT = 5 * 60 * 1000; // 5분 후 브라우저 종료

async function getBrowser(): Promise<Browser> {
  const now = Date.now();

  // 기존 브라우저가 있고 최근에 사용됐으면 재사용
  if (browserInstance && now - lastBrowserUse < BROWSER_TIMEOUT) {
    lastBrowserUse = now;
    return browserInstance;
  }

  // 기존 브라우저 종료
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch {
      // ignore
    }
  }

  // 새 브라우저 시작
  browserInstance = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  lastBrowserUse = now;
  return browserInstance;
}

// 페이지 설정
async function setupPage(page: Page): Promise<void> {
  // User-Agent 설정
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // 뷰포트 설정
  await page.setViewport({ width: 1920, height: 1080 });

  // WebDriver 감지 우회
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['ko-KR', 'ko', 'en-US', 'en'] });
  });

  // 불필요한 리소스 차단 (속도 향상)
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const resourceType = req.resourceType();
    if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
      req.abort();
    } else {
      req.continue();
    }
  });
}

// 가격 문자열을 숫자로 변환
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

// 리뷰 수 문자열을 숫자로 변환
function parseReviewCount(reviewStr: string): number {
  if (!reviewStr) return 0;
  const cleaned = reviewStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

// 평점 문자열을 숫자로 변환
function parseRating(ratingStr: string): number {
  if (!ratingStr) return 0;
  const match = ratingStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// HTML에서 상품 정보 추출
function parseProductsFromHtml(html: string, keyword: string): CoupangSearchResult {
  const $ = cheerio.load(html);
  const products: CoupangProduct[] = [];

  // 상품 리스트 파싱 - 여러 셀렉터 시도
  const productSelectors = [
    'li.search-product',
    'li[class*="search-product"]',
    '.search-product-wrap',
    'ul.search-product-list > li',
  ];

  let foundProducts = false;

  for (const selector of productSelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      elements.each((index, element) => {
        const $el = $(element);

        // 광고 제외
        if ($el.find('.ad-badge').length > 0) return;

        const productId = $el.attr('data-product-id') ||
                         $el.find('a[data-product-id]').attr('data-product-id') ||
                         `cp-${Date.now()}-${index}`;

        const productLink = $el.find('a[href*="/vp/products/"]').attr('href') ||
                           $el.find('a.search-product-link').attr('href') || '';

        // 상품명 추출
        const name = $el.find('.name, .product-name, .title').first().text().trim() ||
                    $el.find('div[class*="name"]').first().text().trim();

        // 가격 정보
        const priceText = $el.find('.price-value, .sale-price, em.sale').first().text().trim() ||
                         $el.find('[class*="price"]').first().text().trim();
        const originalPriceText = $el.find('.base-price, .origin-price, del').first().text().trim();

        const price = parsePrice(priceText);
        const originalPrice = parsePrice(originalPriceText) || price;

        // 할인율
        const discountText = $el.find('.discount-percentage, .discount-rate, .sale-rate').first().text().trim();
        const discountRate = parseInt(discountText.replace(/[^0-9]/g, ''), 10) || 0;

        // 평점 및 리뷰
        const ratingText = $el.find('.rating, .star-rating, [class*="rating"]').first().text().trim();
        const rating = parseRating(ratingText);

        const reviewText = $el.find('.rating-total-count, .count, .review-count').first().text().trim();
        const reviewCount = parseReviewCount(reviewText);

        // 로켓배송 여부
        const htmlContent = $el.html() || '';
        const isRocketDelivery = htmlContent.includes('rocket') ||
                                htmlContent.includes('로켓') ||
                                $el.find('[class*="rocket"]').length > 0 ||
                                $el.find('img[src*="rocket"]').length > 0;

        const isRocketWow = htmlContent.includes('rocket-wow') ||
                           htmlContent.includes('로켓와우');

        const isFreeShipping = htmlContent.includes('무료배송') || isRocketDelivery;

        // 이미지
        const imageUrl = $el.find('img').first().attr('src') ||
                        $el.find('img').first().attr('data-img-src') || '';

        // 판매자
        const seller = $el.find('.merchant, .seller').first().text().trim() || '판매자';

        if (name && price > 0) {
          products.push({
            id: productId,
            name,
            price,
            originalPrice,
            discountRate,
            rating,
            reviewCount,
            isRocketDelivery,
            isRocketWow,
            isFreeShipping,
            imageUrl: imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl,
            productUrl: productLink.startsWith('/') ? `https://www.coupang.com${productLink}` : productLink,
            seller,
            rank: index + 1,
          });
        }
      });

      if (products.length > 0) {
        foundProducts = true;
        break;
      }
    }
  }

  // 가격 통계 계산
  const prices = products.map(p => p.price).filter(p => p > 0);
  const priceStats = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0,
    avg: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
  };

  // 로켓배송 비율
  const rocketCount = products.filter(p => p.isRocketDelivery).length;
  const rocketDeliveryRatio = products.length > 0 ? Math.round((rocketCount / products.length) * 100) : 0;

  // 총 상품 수 추출
  const totalText = $('.search-result-title, .search-count, .result-count').text();
  const totalMatch = totalText.match(/[\d,]+/);
  const totalProducts = totalMatch ? parseInt(totalMatch[0].replace(/,/g, ''), 10) : products.length * 100;

  return {
    keyword,
    totalProducts,
    products,
    priceStats,
    rocketDeliveryRatio,
  };
}

// 쿠팡 검색 결과 스크래핑 (Puppeteer 사용)
export async function scrapeCoupangSearch(
  keyword: string,
  page: number = 1,
  sortType: string = 'scoreDesc'
): Promise<CoupangSearchResult> {
  const encodedKeyword = encodeURIComponent(keyword);
  const url = `https://www.coupang.com/np/search?component=&q=${encodedKeyword}&channel=user&page=${page}&sorter=${sortType}`;

  let browser: Browser | null = null;
  let puppeteerPage: Page | null = null;

  try {
    browser = await getBrowser();
    puppeteerPage = await browser.newPage();
    await setupPage(puppeteerPage);

    // 페이지 이동
    await puppeteerPage.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // 상품 목록 로딩 대기
    await puppeteerPage.waitForSelector('li.search-product, .search-product-wrap, ul.search-product-list', {
      timeout: 10000,
    }).catch(() => {
      // 셀렉터를 찾지 못해도 계속 진행
    });

    // 추가 대기 (동적 로딩)
    await delay(1500);

    // 스크롤하여 더 많은 상품 로드
    await puppeteerPage.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await delay(1000);

    // HTML 가져오기
    const html = await puppeteerPage.content();

    // 페이지 닫기
    await puppeteerPage.close();
    puppeteerPage = null;

    // HTML 파싱
    const result = parseProductsFromHtml(html, keyword);

    // No products found case is handled by returning empty result

    return result;
  } catch (error) {
    console.error('Coupang scraping error:', error);

    // 페이지 정리
    if (puppeteerPage) {
      try {
        await puppeteerPage.close();
      } catch {
        // ignore
      }
    }

    throw new Error(`쿠팡 데이터 수집 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 경쟁 강도 분석
export interface CompetitionAnalysis {
  keyword: string;
  totalProducts: number;
  avgReviewCount: number;
  avgPrice: number;
  priceRange: { min: number; max: number };
  top10Products: CoupangProduct[];
  rocketDeliveryRatio: number;
  competitionScore: number;
  competitionLevel: '낮음' | '중' | '높음' | '매우 높음';
  insights: string;
  factors: {
    reviewFactor: number;
    priceFactor: number;
    rocketFactor: number;
    topSellerFactor: number;
  };
}

export async function analyzeCoupangCompetition(keyword: string): Promise<CompetitionAnalysis> {
  // 첫 페이지 데이터 수집
  const result = await scrapeCoupangSearch(keyword, 1, 'scoreDesc');

  if (result.products.length === 0) {
    return {
      keyword,
      totalProducts: 0,
      avgReviewCount: 0,
      avgPrice: 0,
      priceRange: { min: 0, max: 0 },
      top10Products: [],
      rocketDeliveryRatio: 0,
      competitionScore: 0,
      competitionLevel: '낮음',
      insights: '검색 결과가 없거나 데이터를 수집할 수 없습니다. 다른 키워드를 시도해보세요.',
      factors: {
        reviewFactor: 0,
        priceFactor: 0,
        rocketFactor: 0,
        topSellerFactor: 0,
      },
    };
  }

  const products = result.products;

  // Top 10 상품
  const top10Products = products.slice(0, 10);

  // 통계 계산
  const prices = products.map(p => p.price);
  const reviews = products.map(p => p.reviewCount);

  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const avgReviewCount = Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length);
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };

  // 경쟁 강도 점수 계산
  // 1. 리뷰 수 팩터 (리뷰가 많을수록 경쟁 치열)
  const reviewFactor = Math.min(100, (avgReviewCount / 1000) * 100);

  // 2. 가격 경쟁 팩터
  const priceVariance = priceRange.max > 0 ? ((priceRange.max - priceRange.min) / priceRange.max) * 100 : 0;
  const priceFactor = Math.min(100, priceVariance);

  // 3. 로켓배송 팩터
  const rocketFactor = result.rocketDeliveryRatio;

  // 4. 상위 판매자 팩터
  const top10AvgReview = top10Products.length > 0
    ? top10Products.reduce((a, b) => a + b.reviewCount, 0) / top10Products.length
    : 0;
  const topSellerFactor = Math.min(100, (top10AvgReview / 5000) * 100);

  // 종합 점수
  const competitionScore = Math.round(
    reviewFactor * 0.3 +
    priceFactor * 0.15 +
    rocketFactor * 0.25 +
    topSellerFactor * 0.3
  );

  // 경쟁 레벨 결정
  let competitionLevel: '낮음' | '중' | '높음' | '매우 높음';
  if (competitionScore < 25) {
    competitionLevel = '낮음';
  } else if (competitionScore < 50) {
    competitionLevel = '중';
  } else if (competitionScore < 75) {
    competitionLevel = '높음';
  } else {
    competitionLevel = '매우 높음';
  }

  // 인사이트 생성
  const insights = generateInsights({
    competitionLevel,
    avgReviewCount,
    rocketDeliveryRatio: result.rocketDeliveryRatio,
    top10AvgReview,
    totalProducts: result.totalProducts,
    avgPrice,
  });

  return {
    keyword,
    totalProducts: result.totalProducts,
    avgReviewCount,
    avgPrice,
    priceRange,
    top10Products,
    rocketDeliveryRatio: result.rocketDeliveryRatio,
    competitionScore,
    competitionLevel,
    insights,
    factors: {
      reviewFactor: Math.round(reviewFactor),
      priceFactor: Math.round(priceFactor),
      rocketFactor: result.rocketDeliveryRatio,
      topSellerFactor: Math.round(topSellerFactor),
    },
  };
}

function generateInsights(data: {
  competitionLevel: string;
  avgReviewCount: number;
  rocketDeliveryRatio: number;
  top10AvgReview: number;
  totalProducts: number;
  avgPrice: number;
}): string {
  const lines: string[] = [];

  if (data.competitionLevel === '낮음') {
    lines.push('이 키워드는 경쟁이 낮은 블루오션 시장입니다.');
    lines.push('신규 진입에 적합한 기회가 있습니다.');
  } else if (data.competitionLevel === '중') {
    lines.push('중간 수준의 경쟁이 있는 시장입니다.');
    lines.push('차별화된 상품이나 가격 경쟁력이 필요합니다.');
  } else if (data.competitionLevel === '높음') {
    lines.push('경쟁이 치열한 레드오션 시장입니다.');
    lines.push('강력한 차별화 전략과 마케팅이 필수입니다.');
  } else {
    lines.push('매우 치열한 경쟁 시장입니다.');
    lines.push('대형 셀러들이 장악한 시장으로 진입 장벽이 높습니다.');
  }

  if (data.avgReviewCount > 1000) {
    lines.push(`평균 리뷰 ${data.avgReviewCount.toLocaleString()}개로 이미 검증된 시장입니다.`);
  } else if (data.avgReviewCount > 100) {
    lines.push(`평균 리뷰 ${data.avgReviewCount.toLocaleString()}개로 성장 중인 시장입니다.`);
  } else {
    lines.push(`평균 리뷰 ${data.avgReviewCount.toLocaleString()}개로 초기 시장입니다.`);
  }

  if (data.rocketDeliveryRatio > 70) {
    lines.push(`로켓배송 비율 ${data.rocketDeliveryRatio}%로 쿠팡 직매입 경쟁이 높습니다.`);
  } else if (data.rocketDeliveryRatio > 40) {
    lines.push(`로켓배송 비율 ${data.rocketDeliveryRatio}%로 적절한 수준입니다.`);
  } else {
    lines.push(`로켓배송 비율 ${data.rocketDeliveryRatio}%로 개인 셀러 기회가 있습니다.`);
  }

  lines.push(`평균 판매가 ${data.avgPrice.toLocaleString()}원 수준입니다.`);

  return lines.join(' ');
}

// 지연 함수
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 브라우저 종료 (cleanup)
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch {
      // ignore
    }
    browserInstance = null;
  }
}
