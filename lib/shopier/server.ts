import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Only server code may import this module. Shopier prices and product IDs are
 * rechecked here and inside the Supabase transaction; browser values are not trusted.
 */
type JsonRecord = Record<string, unknown>;
export type VerifiedOrder = {
  id: string;
  productId: "52427384" | "52427721";
  email: string;
  amountCents: 34900 | 64900;
  paidAt: string;
};

const PRODUCT_PRICES = { "52427384": 34900, "52427721": 64900 } as const;
const ORDER_ID = /^[a-zA-Z0-9_-]{4,64}$/;

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function moneyInCents(value: unknown): number | null {
  // Shopier REST monetary values are decimal TRY strings, e.g. "349.00".
  const s = typeof value === "number" && Number.isFinite(value) ? String(value) : text(value);
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(s)) return null;
  const [whole, cents = ""] = s.split(".");
  const n = Number(whole) * 100 + Number(cents.padEnd(2, "0"));
  return Number.isSafeInteger(n) ? n : null;
}

export function checkShopierSignature(rawBody: string, signatureHeader: string | null, token: string): boolean {
  if (!signatureHeader || !token) return false;
  const signature = signatureHeader.trim().replace(/^sha256=/i, "");
  const digest = createHmac("sha256", token).update(rawBody, "utf8").digest();
  const expectedHex = Buffer.from(digest.toString("hex"), "utf8");
  const expectedB64 = Buffer.from(digest.toString("base64"), "utf8");
  const received = Buffer.from(signature, "utf8");
  return (received.length === expectedHex.length && timingSafeEqual(received, expectedHex))
    || (received.length === expectedB64.length && timingSafeEqual(received, expectedB64));
}

export function extractShopierOrderId(payload: unknown): string | null {
  const root = record(payload);
  if (!root) return null;
  const order = record(root.order) ?? record(root.data) ?? root;
  const id = text(order.id) || text(order.orderId) || text(order.order_id);
  return ORDER_ID.test(id) ? id : null;
}

export async function loadShopierOrder(orderId: string): Promise<unknown> {
  const token = process.env.SHOPIER_ACCESS_TOKEN;
  if (!token) throw new Error("SHOPIER_ACCESS_TOKEN is not configured");
  if (!ORDER_ID.test(orderId)) throw new Error("Invalid order reference");

  const response = await fetch(`https://api.shopier.com/v1/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`Shopier order lookup failed (${response.status})`);
  return response.json();
}

export function validateShopierPaidOrder(input: unknown, expectedId: string): VerifiedOrder | null {
  const order = record(input);
  if (!order || text(order.id) !== expectedId) return null;
  if (text(order.paymentStatus).toLowerCase() !== "paid" || text(order.currency) !== "TRY") return null;

  const items = order.lineItems;
  if (!Array.isArray(items) || items.length !== 1) return null;
  const item = record(items[0]);
  if (!item || Number(item.quantity) !== 1) return null;
  const productId = text(item.productId);
  if (productId !== "52427384" && productId !== "52427721") return null;

  const totals = record(order.totals);
  const cents = totals && moneyInCents(totals.total);
  if (cents !== PRODUCT_PRICES[productId]) return null;

  const email = text(record(order.shippingInfo)?.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return null;
  const paidAt = text(order.dateCreated);
  const ms = Date.parse(paidAt);
  if (!paidAt || !Number.isFinite(ms) || ms < Date.parse("2026-10-30T21:00:00Z")
      || ms > Date.now() + 5 * 60 * 1000) return null;

  // Refund/return processing needs manual review until its complete semantics are tested.
  if ((Array.isArray(order.refunds) && order.refunds.length > 0)
      || (Array.isArray(order.returns) && order.returns.length > 0)) return null;

  return { id: expectedId, productId, email, amountCents: cents, paidAt: new Date(ms).toISOString() };
}

export async function applyVerifiedShopierOrder(order: VerifiedOrder, expectedUserId?: string): Promise<string> {
  const db = createAdminClient();
  const { data, error } = await db.rpc("shopier_apply_verified_order", {
    p_order_id: order.id,
    p_product_id: order.productId,
    p_buyer_email: order.email,
    p_amount_cents: order.amountCents,
    p_paid_at: order.paidAt,
    p_expected_user_id: expectedUserId ?? null,
  });
  if (error) throw new Error(`Shopier fulfilment database error: ${error.code ?? "UNKNOWN"}`);
  return String(data);
}
