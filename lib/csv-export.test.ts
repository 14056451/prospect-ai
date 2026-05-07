import { describe, it, expect } from "vitest";
import {
  exportCustomersToCSV,
  exportPurchaseHistoryToCSV,
  exportAllDataToCSV,
} from "./csv-export";

describe("CSV Export Functions", () => {
  const mockCustomers = [
    {
      id: 1,
      name: "김철수",
      phone: "010-1234-5678",
      occupation: "영업사원",
      company: "ABC회사",
      status: "1차상담",
      nextContactDate: "2026-05-14",
      purchaseItem: "상품A",
      purchaseQuantity: 2,
      purchasePrice: "50000",
      createdAt: "2026-05-07",
      updatedAt: new Date(),
      userId: 1,
    },
    {
      id: 2,
      name: "이영희",
      phone: "010-9876-5432",
      occupation: null,
      company: null,
      status: "2차",
      nextContactDate: null,
      purchaseItem: null,
      purchaseQuantity: null,
      purchasePrice: null,
      createdAt: "2026-05-06",
      updatedAt: new Date(),
      userId: 1,
    },
  ];

  it("exportCustomersToCSV should generate valid CSV with customer data", () => {
    const csv = exportCustomersToCSV(mockCustomers as any);
    
    // CSV 형식 확인
    expect(csv).toContain("고객명");
    expect(csv).toContain("전화번호");
    expect(csv).toContain("김철수");
    expect(csv).toContain("010-1234-5678");
    expect(csv).toContain("이영희");
    
    // 줄 수 확인 (헤더 + 2개 고객)
    const lines = csv.split("\n");
    expect(lines.length).toBe(3);
  });

  it("exportPurchaseHistoryToCSV should generate CSV with purchase data only", () => {
    const csv = exportPurchaseHistoryToCSV(mockCustomers as any);
    
    // CSV 형식 확인
    expect(csv).toContain("고객명");
    expect(csv).toContain("제품명");
    expect(csv).toContain("가격");
    
    // 구매 내역이 있는 고객만 포함
    expect(csv).toContain("김철수");
    expect(csv).toContain("상품A");
    expect(csv).toContain("50000");
    
    // 구매 내역이 없는 고객은 제외
    const lines = csv.split("\n");
    expect(lines.length).toBe(2); // 헤더 + 1개 (구매 내역이 있는 고객만)
  });

  it("exportAllDataToCSV should generate CSV with all data", () => {
    const csv = exportAllDataToCSV(mockCustomers as any);
    
    // CSV 형식 확인
    expect(csv).toContain("고객명");
    expect(csv).toContain("전화번호");
    expect(csv).toContain("제품명");
    expect(csv).toContain("가격");
    
    // 모든 고객 포함
    expect(csv).toContain("김철수");
    expect(csv).toContain("이영희");
    
    // 줄 수 확인 (헤더 + 2개 고객)
    const lines = csv.split("\n");
    expect(lines.length).toBe(3);
  });

  it("should handle special characters in CSV fields", () => {
    const customersWithSpecialChars = [
      {
        id: 1,
        name: "김철수, 이름에쉼표",
        phone: "010-1234-5678",
        occupation: "영업사원",
        company: "ABC\"회사",
        status: "1차상담",
        nextContactDate: "2026-05-14",
        purchaseItem: "상품\n새줄",
        purchaseQuantity: 1,
        purchasePrice: "50000",
        createdAt: "2026-05-07",
        updatedAt: new Date(),
        userId: 1,
      },
    ];

    const csv = exportCustomersToCSV(customersWithSpecialChars as any);
    
    // 특수 문자가 제대로 이스케이프되었는지 확인
    expect(csv).toContain('"김철수, 이름에쉼표"');
    expect(csv).toContain('"ABC""회사"');
  });

  it("should handle empty customer list", () => {
    const csv = exportCustomersToCSV([]);
    
    // 헤더만 있어야 함
    const lines = csv.split("\n");
    expect(lines.length).toBe(1);
    expect(csv).toContain("고객명");
  });

  it("should format dates correctly", () => {
    const csv = exportCustomersToCSV(mockCustomers as any);
    
    // 날짜 형식 확인 (한국 날짜 형식)
    expect(csv).toMatch(/\d{4}\.\s*\d{1,2}\.\s*\d{1,2}/);
  });
});
