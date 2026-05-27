import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        ok: false,
        error: "Oturum bulunamadı.",
      },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("branch,level,goal")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      {
        ok: false,
        error: profileError.message,
      },
      { status: 500 }
    );
  }

  const branch =
    profile?.branch === "chemistry" || profile?.branch === "physics"
      ? profile.branch
      : "chemistry";

  return NextResponse.json({
    ok: true,
    branch,
    level: profile?.level || "beginner",
    goal: profile?.goal || "",
  });
}
