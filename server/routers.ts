import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // Customer (가망 고객) 라우터
  // ============================================================================
  customers: router({
    list: protectedProcedure.query(({ ctx }) => {
      return db.getUserCustomers(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getCustomer(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          phone: z.string().min(1).max(20),
          occupation: z.string().max(255).optional(),
          company: z.string().max(255).optional(),
          status: z
            .enum(["1차상담", "2차", "소비자", "사업자"])
            .default("1차상담"),
          nextContactDate: z.date().optional(),
          purchaseItem: z.string().max(255).optional(),
          purchaseQuantity: z.number().int().optional(),
          purchasePrice: z.number().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createCustomer({
          userId: ctx.user.id,
          name: input.name,
          phone: input.phone,
          occupation: input.occupation,
          company: input.company,
          status: input.status,
          nextContactDate: input.nextContactDate,
          purchaseItem: input.purchaseItem,
          purchaseQuantity: input.purchaseQuantity,
          purchasePrice: input.purchasePrice ? input.purchasePrice.toString() : undefined,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().max(255).optional(),
          phone: z.string().max(20).optional(),
          occupation: z.string().max(255).optional(),
          company: z.string().max(255).optional(),
          status: z.enum(["1차상담", "2차", "소비자", "사업자"]).optional(),
          nextContactDate: z.date().optional(),
          purchaseItem: z.string().max(255).optional(),
          purchaseQuantity: z.number().int().optional(),
          purchasePrice: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.purchasePrice !== undefined) {
          updateData.purchasePrice = data.purchasePrice.toString();
        }
        return db.updateCustomer(id, updateData);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return db.deleteCustomer(input.id);
      }),

    count: protectedProcedure.query(({ ctx }) => {
      return db.getUserCustomerCount(ctx.user.id);
    }),
  }),

  // ============================================================================
  // ConsultationMemo (상담 메모) 라우터
  // ============================================================================
  memos: router({
    listByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(({ input }) => {
        return db.getCustomerMemos(input.customerId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getMemo(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          content: z.string().min(1),
          consultationDate: z.date().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createMemo({
          userId: ctx.user.id,
          customerId: input.customerId,
          content: input.content,
          consultationDate: input.consultationDate,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          content: z.string().optional(),
          aiSummary: z.string().optional(),
          aiActions: z.array(z.string()).optional(),
          consultationDate: z.date().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateMemo(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return db.deleteMemo(input.id);
      }),

    count: protectedProcedure.query(({ ctx }) => {
      return db.getUserMemoCount(ctx.user.id);
    }),
  }),

  // ============================================================================
  // Statistics (통계) 라우터
  // ============================================================================
  statistics: router({
    get: protectedProcedure
      .input(z.object({ month: z.date() }))
      .query(({ ctx, input }) => {
        return db.getStatistic(ctx.user.id, input.month);
      }),

    list: protectedProcedure.query(({ ctx }) => {
      return db.getUserStatistics(ctx.user.id);
    }),
  }),

  // ============================================================================
  // Subscription (구독) 라우터
  // ============================================================================
  subscription: router({
    get: protectedProcedure.query(({ ctx }) => {
      return db.getUserSubscription(ctx.user.id);
    }),

    isPremium: protectedProcedure.query(({ ctx }) => {
      return db.isPremiumUser(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
