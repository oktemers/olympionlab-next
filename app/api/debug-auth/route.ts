import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const result: any = {
    hasSupabaseUrl: Boolean(url),
    supabaseUrl: url,
    hasAnonKey: Boolean(anon),
    anonKeyPrefix: anon ? anon.slice(0, 12) : null,
    anonKeyLength: anon ? anon.length : 0,
    siteUrl,
  };

  try {
    if (!url) {
      result.health = "missing url";
    } else {
      const res = await fetch(`${url}/auth/v1/health`, {
        cache: "no-store",
      });

      result.healthStatus = res.status;
      result.healthOk = res.ok;
      result.healthText = await res.text();
    }
  } catch (err: any) {
    result.fetchError = err?.message || String(err);
  }

  return NextResponse.json(result);
}
