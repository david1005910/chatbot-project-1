// 네이버 쇼핑인사이트 카테고리 코드 매핑
// 참고: https://developers.naver.com/docs/serviceapi/datalab/shopping/shopping.md

export interface CategoryInfo {
  code: string;
  name: string;
  parent?: string;
}

// 대분류 카테고리
export const MAIN_CATEGORIES: Record<string, CategoryInfo> = {
  '50000000': { code: '50000000', name: '패션의류' },
  '50000001': { code: '50000001', name: '패션잡화' },
  '50000002': { code: '50000002', name: '화장품/미용' },
  '50000003': { code: '50000003', name: '디지털/가전' },
  '50000004': { code: '50000004', name: '가구/인테리어' },
  '50000005': { code: '50000005', name: '출산/육아' },
  '50000006': { code: '50000006', name: '식품' },
  '50000007': { code: '50000007', name: '스포츠/레저' },
  '50000008': { code: '50000008', name: '생활/건강' },
  '50000009': { code: '50000009', name: '여가/생활편의' },
  '50000010': { code: '50000010', name: '면세점' },
};

// 상세 카테고리 (의류 제외, 부피가 작은 제품 중심)
export const DETAIL_CATEGORIES: Record<string, CategoryInfo> = {
  // 디지털/가전
  '50000151': { code: '50000151', name: '휴대폰', parent: '50000003' },
  '50000152': { code: '50000152', name: '태블릿PC', parent: '50000003' },
  '50000153': { code: '50000153', name: '웨어러블', parent: '50000003' },
  '50000154': { code: '50000154', name: '오디오/음향기기', parent: '50000003' },
  '50000155': { code: '50000155', name: '카메라', parent: '50000003' },
  '50000156': { code: '50000156', name: '게임', parent: '50000003' },
  '50000157': { code: '50000157', name: 'PC/노트북', parent: '50000003' },
  '50000158': { code: '50000158', name: 'PC주변기기', parent: '50000003' },
  '50000159': { code: '50000159', name: '저장장치', parent: '50000003' },
  '50000160': { code: '50000160', name: '모니터', parent: '50000003' },
  '50000161': { code: '50000161', name: '프린터/복합기', parent: '50000003' },
  '50000162': { code: '50000162', name: '네트워크장비', parent: '50000003' },
  '50000163': { code: '50000163', name: '주방가전', parent: '50000003' },
  '50000164': { code: '50000164', name: '생활가전', parent: '50000003' },
  '50000165': { code: '50000165', name: '건강가전', parent: '50000003' },
  '50000166': { code: '50000166', name: '계절가전', parent: '50000003' },
  '50000167': { code: '50000167', name: '이미용가전', parent: '50000003' },

  // 생활/건강
  '50000446': { code: '50000446', name: '욕실용품', parent: '50000008' },
  '50000447': { code: '50000447', name: '청소용품', parent: '50000008' },
  '50000448': { code: '50000448', name: '세탁용품', parent: '50000008' },
  '50000449': { code: '50000449', name: '생활잡화', parent: '50000008' },
  '50000450': { code: '50000450', name: '수납/정리', parent: '50000008' },
  '50000451': { code: '50000451', name: '건강식품', parent: '50000008' },
  '50000452': { code: '50000452', name: '건강용품', parent: '50000008' },
  '50000453': { code: '50000453', name: '의료용품', parent: '50000008' },
  '50000454': { code: '50000454', name: '안전/보호용품', parent: '50000008' },
  '50000455': { code: '50000455', name: '성인용품', parent: '50000008' },

  // 화장품/미용
  '50000100': { code: '50000100', name: '스킨케어', parent: '50000002' },
  '50000101': { code: '50000101', name: '메이크업', parent: '50000002' },
  '50000102': { code: '50000102', name: '바디케어', parent: '50000002' },
  '50000103': { code: '50000103', name: '헤어케어', parent: '50000002' },
  '50000104': { code: '50000104', name: '향수/아로마', parent: '50000002' },
  '50000105': { code: '50000105', name: '네일', parent: '50000002' },
  '50000106': { code: '50000106', name: '뷰티소품', parent: '50000002' },
  '50000107': { code: '50000107', name: '남성화장품', parent: '50000002' },
  '50000108': { code: '50000108', name: '미용기기', parent: '50000002' },

  // 식품
  '50000350': { code: '50000350', name: '과일', parent: '50000006' },
  '50000351': { code: '50000351', name: '채소', parent: '50000006' },
  '50000352': { code: '50000352', name: '쌀/잡곡', parent: '50000006' },
  '50000353': { code: '50000353', name: '축산물', parent: '50000006' },
  '50000354': { code: '50000354', name: '수산물', parent: '50000006' },
  '50000355': { code: '50000355', name: '가공식품', parent: '50000006' },
  '50000356': { code: '50000356', name: '건강식품', parent: '50000006' },
  '50000357': { code: '50000357', name: '커피/음료', parent: '50000006' },
  '50000358': { code: '50000358', name: '간식/과자', parent: '50000006' },
  '50000359': { code: '50000359', name: '반찬/밀키트', parent: '50000006' },

  // 출산/육아
  '50000250': { code: '50000250', name: '분유/이유식', parent: '50000005' },
  '50000251': { code: '50000251', name: '기저귀', parent: '50000005' },
  '50000252': { code: '50000252', name: '수유용품', parent: '50000005' },
  '50000253': { code: '50000253', name: '위생용품', parent: '50000005' },
  '50000254': { code: '50000254', name: '유아동 장난감', parent: '50000005' },
  '50000255': { code: '50000255', name: '유아동 패션', parent: '50000005' },
  '50000256': { code: '50000256', name: '유아동 잡화', parent: '50000005' },

  // 스포츠/레저
  '50000400': { code: '50000400', name: '헬스/요가', parent: '50000007' },
  '50000401': { code: '50000401', name: '골프', parent: '50000007' },
  '50000402': { code: '50000402', name: '등산/아웃도어', parent: '50000007' },
  '50000403': { code: '50000403', name: '캠핑', parent: '50000007' },
  '50000404': { code: '50000404', name: '낚시', parent: '50000007' },
  '50000405': { code: '50000405', name: '자전거', parent: '50000007' },
  '50000406': { code: '50000406', name: '수영/수상스포츠', parent: '50000007' },
  '50000407': { code: '50000407', name: '구기스포츠', parent: '50000007' },
  '50000408': { code: '50000408', name: '겨울스포츠', parent: '50000007' },

  // 가구/인테리어 (소형)
  '50000200': { code: '50000200', name: '홈데코', parent: '50000004' },
  '50000201': { code: '50000201', name: '조명', parent: '50000004' },
  '50000202': { code: '50000202', name: '커튼/블라인드', parent: '50000004' },
  '50000203': { code: '50000203', name: '카펫/러그', parent: '50000004' },
  '50000204': { code: '50000204', name: '수납가구', parent: '50000004' },
  '50000205': { code: '50000205', name: '주방가구', parent: '50000004' },
  '50000206': { code: '50000206', name: '욕실가구', parent: '50000004' },

  // 여가/생활편의
  '50000500': { code: '50000500', name: '도서', parent: '50000009' },
  '50000501': { code: '50000501', name: '음반/DVD', parent: '50000009' },
  '50000502': { code: '50000502', name: '문구/사무용품', parent: '50000009' },
  '50000503': { code: '50000503', name: '취미/DIY', parent: '50000009' },
  '50000504': { code: '50000504', name: '악기', parent: '50000009' },
  '50000505': { code: '50000505', name: '반려동물', parent: '50000009' },
  '50000506': { code: '50000506', name: '꽃/원예', parent: '50000009' },

  // 패션잡화 (소형)
  '50000050': { code: '50000050', name: '가방', parent: '50000001' },
  '50000051': { code: '50000051', name: '지갑', parent: '50000001' },
  '50000052': { code: '50000052', name: '시계', parent: '50000001' },
  '50000053': { code: '50000053', name: '쥬얼리', parent: '50000001' },
  '50000054': { code: '50000054', name: '패션액세서리', parent: '50000001' },
  '50000055': { code: '50000055', name: '선글라스/안경', parent: '50000001' },
  '50000056': { code: '50000056', name: '벨트', parent: '50000001' },
  '50000057': { code: '50000057', name: '모자', parent: '50000001' },
};

// 전체 카테고리 통합
export const ALL_CATEGORIES: Record<string, CategoryInfo> = {
  ...MAIN_CATEGORIES,
  ...DETAIL_CATEGORIES,
};

// 카테고리 코드로 이름 찾기
export function getCategoryName(code: string): string {
  const category = ALL_CATEGORIES[code];
  return category ? category.name : code;
}

// 카테고리 이름으로 코드 찾기
export function getCategoryCode(name: string): string | undefined {
  const entry = Object.entries(ALL_CATEGORIES).find(([, info]) => info.name === name);
  return entry ? entry[0] : undefined;
}

// 부모 카테고리 찾기
export function getParentCategory(code: string): CategoryInfo | undefined {
  const category = ALL_CATEGORIES[code];
  if (category?.parent) {
    return ALL_CATEGORIES[category.parent];
  }
  return undefined;
}

// 의류 카테고리 제외 목록
export const EXCLUDED_CLOTHING_CATEGORIES = [
  '50000000', // 패션의류 대분류
];

// 소싱에 적합한 추천 카테고리 (부피 작고 마진 좋은)
export const RECOMMENDED_SOURCING_CATEGORIES: CategoryInfo[] = [
  ALL_CATEGORIES['50000449'], // 생활잡화
  ALL_CATEGORIES['50000100'], // 스킨케어
  ALL_CATEGORIES['50000101'], // 메이크업
  ALL_CATEGORIES['50000505'], // 반려동물
  ALL_CATEGORIES['50000254'], // 유아동 장난감
  ALL_CATEGORIES['50000400'], // 헬스/요가
  ALL_CATEGORIES['50000502'], // 문구/사무용품
  ALL_CATEGORIES['50000158'], // PC주변기기
  ALL_CATEGORIES['50000053'], // 쥬얼리
  ALL_CATEGORIES['50000054'], // 패션액세서리
].filter(Boolean) as CategoryInfo[];

// 카테고리 그룹 (UI 표시용)
export const CATEGORY_GROUPS = [
  {
    name: '생활/건강',
    code: '50000008',
    children: Object.values(DETAIL_CATEGORIES).filter(c => c.parent === '50000008'),
  },
  {
    name: '화장품/미용',
    code: '50000002',
    children: Object.values(DETAIL_CATEGORIES).filter(c => c.parent === '50000002'),
  },
  {
    name: '디지털/가전',
    code: '50000003',
    children: Object.values(DETAIL_CATEGORIES).filter(c => c.parent === '50000003'),
  },
  {
    name: '식품',
    code: '50000006',
    children: Object.values(DETAIL_CATEGORIES).filter(c => c.parent === '50000006'),
  },
  {
    name: '출산/육아',
    code: '50000005',
    children: Object.values(DETAIL_CATEGORIES).filter(c => c.parent === '50000005'),
  },
  {
    name: '스포츠/레저',
    code: '50000007',
    children: Object.values(DETAIL_CATEGORIES).filter(c => c.parent === '50000007'),
  },
  {
    name: '여가/생활편의',
    code: '50000009',
    children: Object.values(DETAIL_CATEGORIES).filter(c => c.parent === '50000009'),
  },
  {
    name: '패션잡화',
    code: '50000001',
    children: Object.values(DETAIL_CATEGORIES).filter(c => c.parent === '50000001'),
  },
];
