import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(
      new URL(
        "/dashboard?setup_error=SUPABASE_SERVICE_ROLE_KEY%20veya%20NEXT_PUBLIC_SUPABASE_URL%20eksik.",
        request.url
      ),
      { status: 303 }
    );
  }

  const adminSupabase = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

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

  const fallbackName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Öğrenci";

  const { data: existingProfile } = await adminSupabase
    .from("profiles")
    .select("id,email,full_name,role,plan")
    .eq("id", user.id)
    .maybeSingle();

  const { error: profileError } = await adminSupabase.from("profiles").upsert(
    {
      id: user.id,
      email: existingProfile?.email || user.email || "",
      full_name: existingProfile?.full_name || fallbackName,
      role: existingProfile?.role || "student",
      plan: existingProfile?.plan || "free",
      branch: safeBranch,
      level: safeLevel,
      goal,
    },
    {
      onConflict: "id",
    }
  );

  if (profileError) {
    return NextResponse.redirect(
      new URL(
        `/dashboard?setup_error=${encodeURIComponent(profileError.message)}`,
        request.url
      ),
      { status: 303 }
    );
  }

  const { data: firstModule } = await adminSupabase
    .from("learning_modules")
    .select("id")
    .eq("is_active", true)
    .or(`branch.eq.all,branch.eq.${safeBranch}`)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { error: routeError } = await adminSupabase.from("user_route_state").upsert(
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

  if (routeError) {
    return NextResponse.redirect(
      new URL(
        `/dashboard?setup_error=${encodeURIComponent(routeError.message)}`,
        request.url
      ),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL("/dashboard?setup=success", request.url), {
    status: 303,
  });
}
