/**
 * CSV 내보내기 유틸리티
 * 
 * 고객 데이터와 구매 내역을 CSV 형식으로 내보냅니다.
 */

interface Customer {
  id: number;
  name: string;
  phone: string;
  occupation?: string | null;
  company?: string | null;
  status: string;
  nextContactDate?: string | Date | null;
  purchaseItem?: string | null;
  purchaseQuantity?: number | null;
  purchasePrice?: string | number | null;
  createdAt: string | Date;
}

/**
 * CSV 헤더와 데이터를 받아 CSV 문자열 생성
 */
function generateCSV(headers: string[], rows: (string | number)[][]): string {
  // 헤더 행
  const headerRow = headers.map(escapeCSVField).join(",");
  
  // 데이터 행
  const dataRows = rows.map((row) =>
    row.map((field) => escapeCSVField(String(field))).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

/**
 * CSV 필드 이스케이프 (쉼표, 줄바꿈, 따옴표 처리)
 */
function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes("\n") || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * 고객 데이터를 CSV로 내보내기
 */
export function exportCustomersToCSV(customers: Customer[]): string {
  const headers = [
    "고객명",
    "전화번호",
    "직업",
    "회사",
    "상태",
    "다음 연락일",
    "등록일",
  ];

  const rows = customers.map((customer) => [
    customer.name,
    customer.phone,
    customer.occupation || "",
    customer.company || "",
    customer.status,
    customer.nextContactDate
      ? new Date(customer.nextContactDate).toLocaleDateString("ko-KR")
      : "",
    new Date(customer.createdAt).toLocaleDateString("ko-KR"),
  ]);

  return generateCSV(headers, rows);
}

/**
 * 구매 내역을 CSV로 내보내기
 */
export function exportPurchaseHistoryToCSV(customers: Customer[]): string {
  const headers = [
    "고객명",
    "제품명",
    "수량",
    "가격",
    "사용기한",
    "등록일",
  ];

  const rows: (string | number)[][] = [];

  customers.forEach((customer) => {
    if (customer.purchaseItem && customer.purchasePrice) {
      rows.push([
        customer.name,
        customer.purchaseItem,
        customer.purchaseQuantity || 1,
        customer.purchasePrice,
        "", // 사용기한은 별도 필드 필요
        new Date(customer.createdAt).toLocaleDateString("ko-KR"),
      ]);
    }
  });

  return generateCSV(headers, rows);
}

/**
 * 통합 데이터를 CSV로 내보내기 (고객 + 구매 내역)
 */
export function exportAllDataToCSV(customers: Customer[]): string {
  const headers = [
    "고객명",
    "전화번호",
    "직업",
    "회사",
    "상태",
    "다음 연락일",
    "제품명",
    "수량",
    "가격",
    "등록일",
  ];

  const rows = customers.map((customer) => [
    customer.name,
    customer.phone,
    customer.occupation || "",
    customer.company || "",
    customer.status,
    customer.nextContactDate
      ? new Date(customer.nextContactDate).toLocaleDateString("ko-KR")
      : "",
    customer.purchaseItem || "",
    customer.purchaseQuantity || "",
    customer.purchasePrice || "",
    new Date(customer.createdAt).toLocaleDateString("ko-KR"),
  ]);

  return generateCSV(headers, rows);
}

/**
 * CSV 파일 다운로드
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // BOM 추가 (Excel에서 한글 인코딩 문제 해결)
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csvContent;

  // Blob 생성
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });

  // 다운로드 링크 생성
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 메모리 해제
  URL.revokeObjectURL(url);
}

/**
 * 날짜 형식 포맷팅
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
