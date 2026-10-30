import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== request.nextUrl.origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({error:"Geçersiz istek kaynağı."},{status:403});
  }
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/giris", request.url), {
      status: 303,
    });
  }

  const contentLength=Number(request.headers.get("content-length")||0);
  if (contentLength>8192) return NextResponse.json({error:"Çok büyük form isteği."},{status:413});
  const formData = await request.formData().catch(()=>null);
  if (!formData) return NextResponse.json({error:"Geçersiz form."},{status:400});
  const redirectToStepTwo = formData.get("next") === "/rota/adim/2";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(
      new URL(
        redirectToStepTwo ? "/rota/adim/1?error=Sunucu%20yap%C4%B1land%C4%B1rmas%C4%B1%20eksik." : "/dashboard?setup_error=Sunucu%20yap%C4%B1land%C4%B1rmas%C4%B1%20eksik.",
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



  const branch = String(formData.get("branch") || "");
  const level = String(formData.get("level") || "beginner");
  const goal = String(
    formData.get("goal") || "Bilim olimpiyatlarına düzenli hazırlanmak"
  );

  // Only the trusted roadmap step-2 destination can override the default dashboard redirect.

  const failureDestination = redirectToStepTwo ? "/rota/adim/1" : "/dashboard";
  const allowedBranches = ["math", "physics", "chemistry", "biology"];
  const allowedLevels = ["beginner", "intermediate", "advanced"];

  if (!allowedBranches.includes(branch) || !allowedLevels.includes(level) || goal.length>160 || !goal.trim()) {
    const destination=redirectToStepTwo?"/rota/adim/1":"/dashboard";
    return NextResponse.redirect(new URL(destination+(redirectToStepTwo?"?error=":"?setup_error=")+encodeURIComponent("Lütfen geçerli branş, seviye ve hedef seç."),request.url),{status:303});
  }
  const safeBranch=branch;
  const safeLevel=level;

  const fallbackName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Öğrenci";

  const { data: existingProfile } = await adminSupabase
    .from("profiles")
    .select("id,email,full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error: profileError } = await adminSupabase.from("profiles").upsert(
    {
      id: user.id,
      email: existingProfile?.email || user.email || "",
      full_name: existingProfile?.full_name || fallbackName,
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
        `${failureDestination}?${redirectToStepTwo ? "error" : "setup_error"}=${encodeURIComponent("Profil kaydedilemedi.")}`,
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
        `${failureDestination}?${redirectToStepTwo ? "error" : "setup_error"}=${encodeURIComponent("Çalışma rotası kaydedilemedi.")}`,
        request.url
      ),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL(redirectToStepTwo ? "/rota/adim/2?saved=1" : "/dashboard?setup=success", request.url), {
    status: 303,
  });
}
