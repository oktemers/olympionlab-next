import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPlusAccess } from "@/lib/plans";
import { findNote, isFreeNote } from "@/lib/pdf-notes-catalog";
import { renderTopicPdf } from "@/lib/pdf-notes-renderer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return new Response("Not bulunamadı.", { status: 404 });
  const note = findNote(slug);
  if (!note) return new Response("Not bulunamadı.", { status: 404 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/giris", _request.url));
  const { data: profile, error } = await supabase.from("profiles")
    .select("branch,plan,role").eq("id", user.id).maybeSingle();
  if (error || !profile) return new Response("Üyelik bilgisi alınamadı.", { status: 503 });
  const admin = profile.role === "admin";
  if (!admin && profile.branch !== note.branch) {
    return new Response("Bu not seçili branşına ait değil.", { status: 403 });
  }
  if (!admin && !isFreeNote(note) && !hasPlusAccess(profile.plan)) {
    return NextResponse.redirect(new URL("/odeme?plan=plus", _request.url));
  }
  try {
    const buffer = await renderTopicPdf(note);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${note.slug}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (err) {
    console.error("PDF generation failed", err instanceof Error ? err.message : "Unknown");
    return new Response("PDF oluşturulamadı.", { status: 503 });
  }
}
