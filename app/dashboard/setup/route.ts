import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }

  const formData = await request.formData();

  const branch = String(formData.get("branch") || "");
  const level = String(formData.get("level") || "beginner");
  const goal = String(
    formData.get("goal") || "Bilim olimpiyatlarına düzenli hazırlanmak"
  );

  const allowedBranches = ["math", "physics", "chemistry", "biology"];
  const allowedLevels = ["beginner", "intermediate", "advanced"];

  const safeBranch = allowedBranches.includes(branch) ? branch : "chemistry";
  const safeLevel = allowedLevels.includes(level) ? level : "beginner";

  const { data: firstModule } = await supabase
    .from("learning_modules")
    .select("id")
    .eq("is_active", true)
    .or(`branch.eq.all,branch.eq.${safeBranch}`)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      branch: safeBranch,
      level: safeLevel,
      goal,
    })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.redirect(
      new URL(`/dashboard?setup_error=${encodeURIComponent(profileError.message)}`, request.url),
      { status: 303 }
    );
  }

  await supabase.from("user_route_state").upsert(
    {
      user_id: user.id,
      branch: safeBranch,
      level: safeLevel,
      goal,
      current_module_id: firstModule?.id || null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    }
  );

  return NextResponse.redirect(new URL("/dashboard", request.url), {
    status: 303,
  });
}
