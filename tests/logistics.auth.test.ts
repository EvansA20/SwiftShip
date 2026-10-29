import { describe, expect, it } from "vitest";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import { formatTrackingId } from "../server/logistics";

function context(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

describe("SwiftShip staff access", () => {
  it("blocks unauthenticated users from the staff dashboard", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.logistics.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks signed-in non-admin users from the staff dashboard", async () => {
    const caller = appRouter.createCaller(
      context({
        id: 7,
        openId: "customer-7",
        name: "Parcel Customer",
        email: null,
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }),
    );
    await expect(caller.logistics.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("formats yearly sequential tracking identifiers consistently", () => {
    expect(formatTrackingId(2026, 124)).toBe("LOG-2026-000124");
    expect(formatTrackingId(2026, 1)).toBe("LOG-2026-000001");
  });
});
