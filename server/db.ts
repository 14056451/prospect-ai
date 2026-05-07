import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import {
  customers,
  consultationMemos,
  statistics,
  userSubscriptions,
  InsertCustomer,
  InsertConsultationMemo,
  InsertStatistic,
  InsertUserSubscription,
  Customer,
  ConsultationMemo,
  Statistic,
  UserSubscription,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Customer (가망 고객) 관련 함수
// ============================================================================

/**
 * 사용자의 모든 고객 조회
 */
export async function getUserCustomers(userId: number): Promise<Customer[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(desc(customers.createdAt));
}

/**
 * विশ단 고객 조회
 */
export async function getCustomer(id: number): Promise<Customer | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id));

  return result[0];
}

/**
 * 고객 추가
 */
export async function createCustomer(data: InsertCustomer): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(customers).values(data);
  return (result as any).insertId || 0;
}

/**
 * 고객 정보 수정
 */
export async function updateCustomer(
  id: number,
  data: Partial<InsertCustomer>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(customers).set(data).where(eq(customers.id, id));
}

/**
 * 고객 삭제
 */
export async function deleteCustomer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(customers).where(eq(customers.id, id));
}

/**
 * 사용자의 고객 수 조회 (프리미엄 제한 확인용)
 */
export async function getUserCustomerCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: customers.id })
    .from(customers)
    .where(eq(customers.userId, userId));

  return result.length;
}

/**
 * 다음 연락일이 지정된 고객 조회 (알림용)
 */
export async function getCustomersWithNextContact(
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<Customer[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.userId, userId),
        gte(customers.nextContactDate, startDate),
        lte(customers.nextContactDate, endDate)
      )
    )
    .orderBy(customers.nextContactDate);
}

// ============================================================================
// ConsultationMemo (상담 메모) 관련 함수
// ============================================================================

/**
 * 단정 고객의 모든 상담 메모 조회
 */
export async function getCustomerMemos(customerId: number): Promise<ConsultationMemo[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(consultationMemos)
    .where(eq(consultationMemos.customerId, customerId))
    .orderBy(desc(consultationMemos.consultationDate));
}

/**
 * 단정 상담 메모 조회
 */
export async function getMemo(id: number): Promise<ConsultationMemo | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(consultationMemos)
    .where(eq(consultationMemos.id, id));

  return result[0];
}

/**
 * 상담 메모 추가
 */
export async function createMemo(data: InsertConsultationMemo): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(consultationMemos).values(data);
  return (result as any).insertId || 0;
}

/**
 * 상담 메모 수정
 */
export async function updateMemo(
  id: number,
  data: Partial<InsertConsultationMemo>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(consultationMemos).set(data).where(eq(consultationMemos.id, id));
}

/**
 * 상담 메모 삭제
 */
export async function deleteMemo(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(consultationMemos).where(eq(consultationMemos.id, id));
}

/**
 * 사용자의 메모 수 조회 (프리미엄 제한 확인용)
 */
export async function getUserMemoCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: consultationMemos.id })
    .from(consultationMemos)
    .where(eq(consultationMemos.userId, userId));

  return result.length;
}

/**
 * 월별 사용자 메모 조회 (통계용)
 */
export async function getUserMemosByMonth(
  userId: number,
  month: Date
): Promise<ConsultationMemo[]> {
  const db = await getDb();
  if (!db) return [];

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

  return db
    .select()
    .from(consultationMemos)
    .where(
      and(
        eq(consultationMemos.userId, userId),
        gte(consultationMemos.consultationDate, startOfMonth),
        lte(consultationMemos.consultationDate, endOfMonth)
      )
    )
    .orderBy(desc(consultationMemos.consultationDate));
}

// ============================================================================
// Statistics (통계) 관련 함수
// ============================================================================

/**
 * 월별 통계 조회
 */
export async function getStatistic(
  userId: number,
  month: Date
): Promise<Statistic | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);

  const result = await db
    .select()
    .from(statistics)
    .where(and(eq(statistics.userId, userId), eq(statistics.month, monthStart)));

  return result[0];
}

/**
 * 월별 통계 생성 또는 업데이트
 */
export async function upsertStatistic(data: InsertStatistic): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getStatistic(data.userId, data.month as Date);

  if (existing) {
    await db
      .update(statistics)
      .set(data)
      .where(eq(statistics.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(statistics).values(data);
    return (result as any).insertId || 0;
  }
}

/**
 * 사용자의 모든 월별 통계 조회
 */
export async function getUserStatistics(userId: number): Promise<Statistic[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(statistics)
    .where(eq(statistics.userId, userId))
    .orderBy(desc(statistics.month));
}

// ============================================================================
// UserSubscription (사용자 구독) 관련 함수
// ============================================================================

/**
 * 사용자의 구독 정보 조회
 */
export async function getUserSubscription(userId: number): Promise<UserSubscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId));

  return result[0];
}

/**
 * 사용자 구독 생성
 */
export async function createSubscription(
  data: InsertUserSubscription
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userSubscriptions).values(data);
  return (result as any).insertId || 0;
}

/**
 * 사용자 구독 업데이트
 */
export async function updateSubscription(
  userId: number,
  data: Partial<InsertUserSubscription>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userSubscriptions)
    .set(data)
    .where(eq(userSubscriptions.userId, userId));
}

/**
 * 사용자가 프리미엄 플랜인지 확인
 */
export async function isPremiumUser(userId: number): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return false;
  }

  return subscription.plan === "premium" && subscription.isActive;
}
