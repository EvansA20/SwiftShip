import {
  getSessionCookieName,
  getSessionCookieOptions,
} from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { shipmentStatuses } from "../drizzle/schema";
import {
  findShipmentForTracking,
  listShipmentsForAdmin,
  recordShipmentUpdate,
  registerShipment,
} from "./logistics";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(getSessionCookieName(ctx.req), {
        ...cookieOptions,
        maxAge: -1,
      });
      return {
        success: true,
      } as const;
    }),
  }),
  logistics: router({
    track: publicProcedure
      .input(
        z.object({
          trackingId: z.string().trim().min(1).max(32).transform((value) => value.toUpperCase()),
        }),
      )
      .query(({ input }) => findShipmentForTracking(input.trackingId)),
    dashboard: adminProcedure.query(() => listShipmentsForAdmin()),
    register: adminProcedure
      .input(
        z.object({
          recipientName: z.string().trim().min(2).max(160),
          destinationCity: z.string().trim().min(2).max(160),
          parcelDescription: z.string().trim().min(2).max(180),
          initialLocation: z.string().trim().max(180).optional(),
          assignedDriver: z.string().trim().max(120).optional(),
          estimatedDelivery: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        }),
      )
      .mutation(({ input }) => registerShipment(input)),
    update: adminProcedure
      .input(
        z.object({
          shipmentId: z.number().int().positive(),
          status: z.enum(shipmentStatuses),
          location: z.string().trim().min(2).max(180),
          note: z.string().trim().max(240).optional(),
          assignedDriver: z.string().trim().max(120).optional(),
        }),
      )
      .mutation(({ input }) => recordShipmentUpdate(input)),
  }),
});

export type AppRouter = typeof appRouter;
