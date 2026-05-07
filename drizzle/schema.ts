import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Customers table - 가망 고객 정보
 * 
 * 필드:
 * - id: 고객 ID (PK)
 * - userId: 사용자 ID (FK)
 * - name: 고객 이름
 * - phone: 전화번호
 * - occupation: 직업
 * - company: 회사명
 * - status: 상담 상태 (1차상담, 2차, 소비자, 사업자)
 * - nextContactDate: 다음 연락일
 * - purchaseItem: 구매 상품명
 * - purchaseQuantity: 구매 수량
 * - purchasePrice: 구매 가격
 * - createdAt: 생성 일시
 * - updatedAt: 수정 일시
 */
import { decimal, boolean, json } from "drizzle-orm/mysql-core";

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  occupation: varchar("occupation", { length: 255 }),
  company: varchar("company", { length: 255 }),
  status: mysqlEnum("status", ["1차상담", "2차", "소비자", "사업자"])
    .default("1차상담")
    .notNull(),
  nextContactDate: timestamp("nextContactDate"),
  purchaseItem: varchar("purchaseItem", { length: 255 }),
  purchaseQuantity: int("purchaseQuantity"),
  purchasePrice: decimal("purchasePrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ConsultationMemos table - 상담 메모
 * 
 * 필드:
 * - id: 메모 ID (PK)
 * - customerId: 고객 ID (FK)
 * - userId: 사용자 ID (FK)
 * - content: 메모 내용 (사용자가 입력한 원본 메모)
 * - aiSummary: AI 생성 요약 (프리미엄 기능)
 * - aiActions: AI 생성 다음 액션 (프리미엄 기능, JSON 배열)
 * - consultationDate: 상담 일시
 * - createdAt: 생성 일시
 * - updatedAt: 수정 일시
 */
export const consultationMemos = mysqlTable("consultationMemos", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  aiSummary: text("aiSummary"),
  aiActions: json("aiActions"),
  consultationDate: timestamp("consultationDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Statistics table - 월별 통계 (캐시용)
 * 
 * 필드:
 * - id: 통계 ID (PK)
 * - userId: 사용자 ID (FK)
 * - month: 통계 월 (예: 2026-05-01)
 * - consultationCount: 상담 건수
 * - conversionRate: 전환율 (%)
 * - topKeywords: 상위 메모 키워드 (JSON 배열)
 * - createdAt: 생성 일시
 * - updatedAt: 수정 일시
 */
export const statistics = mysqlTable("statistics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  month: timestamp("month").notNull(),
  consultationCount: int("consultationCount").default(0).notNull(),
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }).default("0").notNull(),
  topKeywords: json("topKeywords"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * UserSubscriptions table - 사용자 구독 정보 (프리미엄)
 * 
 * 필드:
 * - id: 구독 ID (PK)
 * - userId: 사용자 ID (FK)
 * - plan: 구독 플랜 (free, premium)
 * - isActive: 활성 여부
 * - startDate: 구독 시작일
 * - endDate: 구독 종료일
 * - createdAt: 생성 일시
 * - updatedAt: 수정 일시
 */
export const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["free", "premium"]).default("free").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export type ConsultationMemo = typeof consultationMemos.$inferSelect;
export type InsertConsultationMemo = typeof consultationMemos.$inferInsert;

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = typeof statistics.$inferInsert;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
