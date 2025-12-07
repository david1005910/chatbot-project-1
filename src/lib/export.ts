/**
 * Data export utilities for CSV, JSON, and Excel formats
 */

export type ExportFormat = 'csv' | 'json' | 'excel';

interface ExportData {
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Export data as CSV file
 */
export function exportToCSV(data: ExportData, filename: string): void {
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map((row) =>
      row.map((cell) => {
        // Escape quotes and wrap in quotes if contains comma
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ),
  ].join('\n');

  // Add BOM for Korean character support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export keyword ranking data
 */
export function exportKeywordRanking(
  keywords: {
    rank: number;
    keyword: string;
    growthPotential: string;
    competitionLevel: string;
    reason: string;
    recommendedTiming: string;
    seasonalPattern: string;
    nicheKeywords: string[];
  }[]
): void {
  const data: ExportData = {
    headers: [
      '순위',
      '키워드',
      '성장 잠재력',
      '경쟁 강도',
      '유망 이유',
      '추천 진입 시기',
      '계절성 패턴',
      '틈새 키워드',
    ],
    rows: keywords.map((k) => [
      k.rank,
      k.keyword,
      k.growthPotential,
      k.competitionLevel,
      k.reason,
      k.recommendedTiming,
      k.seasonalPattern,
      k.nicheKeywords.join(' | '),
    ]),
  };

  exportToCSV(data, `키워드분석_${formatDate(new Date())}`);
}

/**
 * Export margin calculation data
 */
export function exportMarginCalculation(
  calculations: {
    purchasePrice: number;
    sellingPrice: number;
    shippingCost: number;
    coupangFee: number;
    netProfit: number;
    marginRate: number;
  }[]
): void {
  const data: ExportData = {
    headers: ['원가', '판매가', '배송비', '쿠팡 수수료', '순이익', '마진율(%)'],
    rows: calculations.map((c) => [
      c.purchasePrice,
      c.sellingPrice,
      c.shippingCost,
      c.coupangFee,
      c.netProfit,
      c.marginRate,
    ]),
  };

  exportToCSV(data, `마진계산_${formatDate(new Date())}`);
}

/**
 * Export trend data
 */
export function exportTrendData(
  keyword: string,
  trendData: { date: string; value: number; predicted?: number }[]
): void {
  const data: ExportData = {
    headers: ['날짜', '검색량', '예측값'],
    rows: trendData.map((d) => [
      d.date,
      d.value,
      d.predicted ?? '',
    ]),
  };

  exportToCSV(data, `트렌드_${keyword}_${formatDate(new Date())}`);
}

/**
 * Export analysis history
 */
export function exportAnalysisHistory(
  analyses: {
    id: string;
    type: string;
    createdAt: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  }[]
): void {
  const data: ExportData = {
    headers: ['ID', '분석 유형', '생성일', '입력 데이터', '결과 데이터'],
    rows: analyses.map((a) => [
      a.id,
      a.type,
      a.createdAt,
      JSON.stringify(a.input),
      JSON.stringify(a.output),
    ]),
  };

  exportToCSV(data, `분석히스토리_${formatDate(new Date())}`);
}

/**
 * Helper function to download blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for filename
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * Export data as JSON file
 */
export function exportToJSON(data: unknown, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Export data as Excel XML file
 */
export function exportToExcel(data: ExportData, filename: string): void {
  const escapeXML = (str: string): string =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;');

  const headerRow = data.headers.map(h =>
    `<Cell><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`
  ).join('');

  const dataRows = data.rows.map(row =>
    `<Row>${row.map(cell => {
      const type = typeof cell === 'number' ? 'Number' : 'String';
      return `<Cell><Data ss:Type="${type}">${escapeXML(String(cell))}</Data></Cell>`;
    }).join('')}</Row>`
  ).join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Sheet1">
    <Table>
      <Row>${headerRow}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadBlob(blob, `${filename}.xls`);
}

/**
 * Universal export function with format selection
 */
export function exportWithFormat(
  data: ExportData,
  filename: string,
  format: ExportFormat = 'csv'
): void {
  const dateStr = formatDate(new Date());
  const fullFilename = `${filename}_${dateStr}`;

  switch (format) {
    case 'csv':
      exportToCSV(data, fullFilename);
      break;
    case 'json':
      // Convert ExportData to object array for JSON
      const jsonData = data.rows.map(row => {
        const obj: Record<string, string | number> = {};
        data.headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      });
      exportToJSON(jsonData, fullFilename);
      break;
    case 'excel':
      exportToExcel(data, fullFilename);
      break;
  }
}

/**
 * Export sourcing products data
 */
export function exportSourcingProducts(
  products: {
    title: string;
    titleKo: string;
    price: number;
    moq: number;
    salesCount: number;
    rating: number;
    productUrl?: string;
  }[],
  keyword: string,
  format: ExportFormat = 'csv'
): void {
  const data: ExportData = {
    headers: ['번호', '상품명(원문)', '상품명(번역)', '가격(위안)', '최소주문량', '판매량', '평점', 'URL'],
    rows: products.map((p, i) => [
      i + 1,
      p.title,
      p.titleKo,
      p.price,
      p.moq,
      p.salesCount,
      p.rating,
      p.productUrl || '',
    ]),
  };

  exportWithFormat(data, `소싱상품_${keyword}`, format);
}

/**
 * Export competition analysis data
 */
export function exportCompetitionAnalysis(
  analysis: {
    keyword: string;
    totalProducts: number;
    avgReviewCount: number;
    avgPrice: number;
    rocketDeliveryRatio: number;
    competitionLevel: string;
    top10Products: {
      name: string;
      price: number;
      reviewCount: number;
      rating: number;
    }[];
  },
  format: ExportFormat = 'csv'
): void {
  const data: ExportData = {
    headers: ['상품명', '가격', '리뷰수', '평점'],
    rows: analysis.top10Products.map(p => [
      p.name,
      p.price,
      p.reviewCount,
      p.rating,
    ]),
  };

  exportWithFormat(data, `경쟁분석_${analysis.keyword}`, format);
}
