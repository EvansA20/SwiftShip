import type { ShipmentStatus } from "../drizzle/schema";

export const brand = {
  navy: "#102A43",
  ink: "#1D2F40",
  orange: "#F06432",
  green: "#24845F",
  red: "#BE4D49",
  canvas: "#F7F5F1",
  paper: "#F1ECE5",
  line: "#E5E1DA",
  muted: "#718090",
  white: "#FFFFFF",
};

export const statusOptions: ShipmentStatus[] = [
  "registered",
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "exception",
];

const labels: Record<ShipmentStatus, string> = {
  registered: "Registered",
  dispatched: "Dispatched",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  exception: "Delivery exception",
};

export function statusLabel(status: ShipmentStatus): string {
  return labels[status];
}

export function statusTone(status: ShipmentStatus): "orange" | "green" | "gray" | "red" {
  if (status === "delivered") return "green";
  if (status === "exception") return "red";
  if (status === "registered") return "gray";
  return "orange";
}

export function progressIndex(status: ShipmentStatus): number {
  const index = ["registered", "dispatched", "in_transit", "out_for_delivery", "delivered"].indexOf(status);
  return index >= 0 ? index : 2;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "Not available yet";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available yet";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toLocaleDateString(undefined, { day: "numeric", month: "short" })} · ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}
