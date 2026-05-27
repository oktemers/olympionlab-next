import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return jsonError(`Oturum okunamadı: ${userError.message}`, 401);
    }

    if (!user) {
      return jsonError("Oturum bulunamadı. Lütfen tekrar giriş yap.", 401);
    }

    const formData = await request.formData();

    const branch = String(formData.get("branch") || "");
    const level = String(formData.get("level") || "beginner");
    const goal = String(
      formData.get("goal") || "Bilim olimpiyatlarına düzenli hazırlanmak"
    );

    const allowedBranches = ["math", "physics", "chemistry", "biology"];
    const allowedLevels = ["beginner", "intermediate", "advanced"];

    const safeBranch = allowedBranches.includes(branch)
      ? branch
      : "chemistry";

    const safeLevel = allowedLevels.includes(level) ? level : "beginner";

    const fallbackName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Öğrenci";

    const { data: existingProfile, error: existingProfileError } =
      await supabase
        .from("profiles")
        .select("id,email,full_name,role,plan")
        .eq("id", user.id)
        .maybeSingle();

    if (existingProfileError) {
      return jsonError(
        `Profil okuma hatası: ${existingProfileError.message}`,
        500
      );
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
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
      return jsonError(`Profil kayıt hatası: ${profileError.message}`, 500);
    }

    const { data: firstModule, error: firstModuleError } = await supabase
      .from("learning_modules")
      .select("id")
      .eq("is_active", true)
      .or(`branch.eq.all,branch.eq.${safeBranch}`)
      .order("order_index", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstModuleError) {
      return jsonError(
        `İlk modül okuma hatası: ${firstModuleError.message}`,
        500
      );
    }

    const { error: routeError } = await supabase.from("user_route_state").upsert(
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
      return jsonError(`Rota kayıt hatası: ${routeError.message}`, 500);
    }

    return NextResponse.json({
      ok: true,
      branch: safeBranch,
      level: safeLevel,
      goal,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? `Beklenmeyen hata: ${error.message}`
        : "Beklenmeyen hata oluştu.",
      500
    );
  }
}
