import { asc, desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { trackingCounters, trackingEvents, shipments, type ShipmentStatus } from "../drizzle/schema";
import { getDb } from "./db";

export function formatTrackingId(year: number, sequence: number): string {
  return `LOG-${year}-${String(sequence).padStart(6, "0")}`;
}

function unavailableDatabase(): never {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Shipment data is temporarily unavailable.",
  });
}

export async function findShipmentForTracking(trackingId: string) {
  const db = await getDb();
  if (!db) return unavailableDatabase();

  const [shipment] = await db
    .select({
      id: shipments.id,
      trackingId: shipments.trackingId,
      status: shipments.status,
      latestLocation: shipments.latestLocation,
      dispatchDate: shipments.dispatchDate,
      estimatedDelivery: shipments.estimatedDelivery,
      updatedAt: shipments.updatedAt,
    })
    .from(shipments)
    .where(eq(shipments.trackingId, trackingId))
    .limit(1);

  if (!shipment) return null;

  const events = await db
    .select({
      status: trackingEvents.status,
      location: trackingEvents.location,
      note: trackingEvents.note,
      occurredAt: trackingEvents.occurredAt,
    })
    .from(trackingEvents)
    .where(eq(trackingEvents.shipmentId, shipment.id))
    .orderBy(asc(trackingEvents.occurredAt), asc(trackingEvents.id));

  return {
    trackingId: shipment.trackingId,
    status: shipment.status,
    latestLocation: shipment.latestLocation,
    dispatchDate: shipment.dispatchDate,
    estimatedDelivery: shipment.estimatedDelivery,
    updatedAt: shipment.updatedAt,
    events,
  };
}

export async function listShipmentsForAdmin() {
  const db = await getDb();
  if (!db) return unavailableDatabase();

  return db.select().from(shipments).orderBy(desc(shipments.updatedAt)).limit(60);
}

export async function registerShipment(input: {
  recipientName: string;
  destinationCity: string;
  parcelDescription: string;
  initialLocation?: string;
  assignedDriver?: string;
  estimatedDelivery?: string;
}) {
  const db = await getDb();
  if (!db) return unavailableDatabase();

  const year = new Date().getFullYear();
  const estimate = input.estimatedDelivery ? new Date(`${input.estimatedDelivery}T12:00:00`) : null;
  if (estimate && Number.isNaN(estimate.getTime())) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid estimated delivery date." });
  }
  const initialLocation = input.initialLocation?.trim() || null;
  const assignedDriver = input.assignedDriver?.trim() || null;
  const now = new Date();

  return db.transaction(async (tx) => {
    await tx
      .insert(trackingCounters)
      .values({ year, lastValue: 1 })
      .onDuplicateKeyUpdate({
        set: { lastValue: sql`${trackingCounters.lastValue} + 1` },
      });
    const [counter] = await tx
      .select({ lastValue: trackingCounters.lastValue })
      .from(trackingCounters)
      .where(eq(trackingCounters.year, year))
      .limit(1);
    if (!counter) return unavailableDatabase();

    const trackingId = formatTrackingId(year, counter.lastValue);
    await tx.insert(shipments).values({
      trackingId,
      recipientName: input.recipientName.trim(),
      destinationCity: input.destinationCity.trim(),
      parcelDescription: input.parcelDescription.trim(),
      assignedDriver,
      status: "registered",
      latestLocation: initialLocation,
      estimatedDelivery: estimate,
      createdAt: now,
      updatedAt: now,
    });
    const [shipment] = await tx
      .select({ id: shipments.id })
      .from(shipments)
      .where(eq(shipments.trackingId, trackingId))
      .limit(1);
    if (!shipment) return unavailableDatabase();

    await tx.insert(trackingEvents).values({
      shipmentId: shipment.id,
      status: "registered",
      location: initialLocation,
      note: "Shipment registered.",
      occurredAt: now,
    });

    return { trackingId };
  });
}

export async function recordShipmentUpdate(input: {
  shipmentId: number;
  status: ShipmentStatus;
  location: string;
  note?: string;
  assignedDriver?: string;
}) {
  const db = await getDb();
  if (!db) return unavailableDatabase();
  const now = new Date();
  const location = input.location.trim();
  const assignedDriver = input.assignedDriver?.trim() || null;

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ dispatchDate: shipments.dispatchDate })
      .from(shipments)
      .where(eq(shipments.id, input.shipmentId))
      .limit(1);
    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Shipment could not be found." });
    }

    const impliesDispatch = ["dispatched", "in_transit", "out_for_delivery", "delivered"].includes(
      input.status,
    );
    await tx
      .update(shipments)
      .set({
        status: input.status,
        latestLocation: location,
        ...(input.assignedDriver !== undefined ? { assignedDriver } : {}),
        dispatchDate: existing.dispatchDate ?? (impliesDispatch ? now : null),
        updatedAt: now,
      })
      .where(eq(shipments.id, input.shipmentId));
    await tx.insert(trackingEvents).values({
      shipmentId: input.shipmentId,
      status: input.status,
      location,
      note: input.note?.trim() || null,
      occurredAt: now,
    });
    return { success: true } as const;
  });
}
