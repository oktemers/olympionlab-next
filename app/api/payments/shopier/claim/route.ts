import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyVerifiedShopierOrder, loadShopierOrder, validateShopierPaidOrder } from "@/lib/shopier/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const respond = (status: number, message: string) =>
    NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
  if (!process.env.SHOPIER_ACCESS_TOKEN || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return respond(503, "Ödeme kontrolü henüz etkin değil.");
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && (!host || new URL(origin).host !== host))
    return respond(403, "Bu istek kabul edilmedi.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email || !user.email_confirmed_at)
    return respond(401, "Önce e-posta adresi doğrulanmış bir Olympionlab hesabına giriş yap.");

  let body: unknown;
  try { body = await request.json(); }
  catch { return respond(400, "Geçersiz istek."); }
  const orderId = body && typeof body === "object" && "orderId" in body
    && typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(orderId))
    return respond(400, "Sipariş numarasını kontrol et.");

  const db = createAdminClient();
  const { error: limitError } = await db.rpc("shopier_limit_claims", { p_user_id: user.id });
  if (limitError) return respond(429, "Çok fazla deneme yapıldı. Daha sonra tekrar dene.");

  try {
    const apiOrder = await loadShopierOrder(orderId);
    const validated = validateShopierPaidOrder(apiOrder, orderId);
    if (!validated || validated.email !== user.email.toLowerCase().trim())
      return respond(422, "Sipariş doğrulanamadı. Shopier ve Olympionlab e-postalarının aynı olduğundan emin ol.");

    const result = await applyVerifiedShopierOrder(validated, user.id);
    if (result === "activated" || result === "already_processed")
      return respond(200, "Ödemen doğrulandı. Üyeliğin tanımlandı veya daha önce tanımlanmıştı.");
    return respond(422, "Sipariş otomatik eşleştirilemedi. Destek ekibine sipariş numaranı ilet.");
  } catch (error) {
    console.error("Shopier claim failed", error instanceof Error ? error.message : "Unknown");
    return respond(503, "Shopier kontrolü şu an tamamlanamadı. Daha sonra tekrar dene.");
  }
}
