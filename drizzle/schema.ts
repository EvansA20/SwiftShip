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

export const shipmentStatuses = [
  "registered",
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "exception",
] as const;
export type ShipmentStatus = (typeof shipmentStatuses)[number];

/** Private operational shipment record. Public tracking procedures intentionally select a subset. */
export const shipments = mysqlTable("shipments", {
  id: int("id").autoincrement().primaryKey(),
  trackingId: varchar("trackingId", { length: 32 }).notNull().unique(),
  recipientName: varchar("recipientName", { length: 160 }).notNull(),
  destinationCity: varchar("destinationCity", { length: 160 }).notNull(),
  parcelDescription: varchar("parcelDescription", { length: 180 }).notNull(),
  assignedDriver: varchar("assignedDriver", { length: 120 }),
  status: mysqlEnum("status", shipmentStatuses).default("registered").notNull(),
  latestLocation: varchar("latestLocation", { length: 180 }),
  dispatchDate: timestamp("dispatchDate"),
  estimatedDelivery: timestamp("estimatedDelivery"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Shipment = typeof shipments.$inferSelect;
export type NewShipment = typeof shipments.$inferInsert;

/** Customer-facing movement history for each parcel. */
export const trackingEvents = mysqlTable("trackingEvents", {
  id: int("id").autoincrement().primaryKey(),
  shipmentId: int("shipmentId")
    .notNull()
    .references(() => shipments.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", shipmentStatuses).notNull(),
  location: varchar("location", { length: 180 }),
  note: varchar("note", { length: 240 }),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
});
export type TrackingEvent = typeof trackingEvents.$inferSelect;

/** A row per year is incremented atomically when staff register a shipment. */
export const trackingCounters = mysqlTable("trackingCounters", {
  year: int("year").primaryKey(),
  lastValue: int("lastValue").notNull().default(0),
});
