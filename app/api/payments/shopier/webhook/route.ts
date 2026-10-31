import { NextResponse, type NextRequest } from "next/server";
import {
  applyVerifiedShopierOrder, checkShopierSignature, extractShopierOrderId,
  loadShopierOrder, validateShopierPaidOrder
} from "@/lib/shopier/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reply = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  const token = process.env.SHOPIER_WEBHOOK_TOKEN;
  if (!token || !process.env.SHOPIER_ACCESS_TOKEN || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return reply({ error: "Payment verification is not configured" }, 503);
  }

  let rawBody: string;
  try { rawBody = await request.text(); }
  catch { return reply({ error: "Unreadable event" }, 400); }
  if (rawBody.length > 256_000) return reply({ error: "Payload too large" }, 413);
  if (!checkShopierSignature(rawBody, request.headers.get("Shopier-Signature"), token)) {
    return reply({ error: "Invalid signature" }, 401);
  }

  const event = request.headers.get("Shopier-Event");
  if (event !== "order.created") {
    // Refund events require their own reconciliation and are not paid-order proofs.
    return reply({ ok: true, ignored: true });
  }

  let payload: unknown;
  try { payload = JSON.parse(rawBody); }
  catch { return reply({ error: "Invalid JSON" }, 400); }
  const orderId = extractShopierOrderId(payload);
  if (!orderId) return reply({ error: "Missing order ID" }, 400);

  try {
    const apiOrder = await loadShopierOrder(orderId);
    const validated = validateShopierPaidOrder(apiOrder, orderId);
    if (!validated) return reply({ ok: true, status: "manual_review" });

    const result = await applyVerifiedShopierOrder(validated);
    if (!["activated", "already_processed", "no_matching_verified_user"].includes(result)) {
      return reply({ ok: true, status: "manual_review" });
    }
    return reply({ ok: true, status: result });
  } catch (error) {
    console.error("Shopier webhook processing failed", error instanceof Error ? error.message : "Unknown");
    return reply({ error: "Temporary processing failure" }, 503);
  }
}
