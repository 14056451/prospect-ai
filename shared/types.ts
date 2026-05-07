/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

/**
 * ProspectAI 공유 타입 정의
 */

/**
 * 고객 상태 타입
 */
export type CustomerStatus = "1차상담" | "2차";

/**
 * 고객 정보 (프론트엔드용)
 */
export interface CustomerData {
  id: number;
  userId: number;
  name: string;
  phone: string;
  occupation?: string;
  company?: string;
  status: CustomerStatus;
  nextContactDate?: Date;
  purchaseItem?: string;
  purchaseQuantity?: number;
  purchasePrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 상담 메모 정보 (프론트엔드용)
 */
export interface ConsultationMemoData {
  id: number;
  customerId: number;
  userId: number;
  content: string;
  aiSummary?: string;
  aiActions?: string[];
  consultationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 통계 정보 (프론트엔드용)
 */
export interface StatisticData {
  id: number;
  userId: number;
  month: Date;
  consultationCount: number;
  conversionRate: number;
  topKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 구독 정보 (프론트엔드용)
 */
export interface SubscriptionData {
  id: number;
  userId: number;
  plan: "free" | "premium";
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 프리미엄 제한 설정
 */
export const PREMIUM_LIMITS = {
  free: {
    maxCustomers: 50,
    maxMemos: 100,
  },
  premium: {
    maxCustomers: Infinity,
    maxMemos: Infinity,
  },
} as const;

/**
 * 고객 상태별 색상 매핑
 */
export const STATUS_COLORS = {
  "1차상담": "#3B82F6",
  "2차": "#F59E0B",
} as const;

/**
 * 고객 상태 라벨
 */
export const STATUS_LABELS = {
  "1차상담": "1차 상담",
  "2차": "2차 상담",
} as const;
