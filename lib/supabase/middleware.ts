import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname.replace(/\\/$/, "") || "/";
  const protectedStudentPages = new Set([
    "/student-labs", "/student-labs.html",
    "/uygulama-laboratuvarlari", "/app-labs.html",
    "/yol-haritasi", "/roadmap.html"
  ]);
  const isProtected = protectedStudentPages.has(pathname);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Authentication must fail closed for protected HTML routes.
  if (!url || !anon) {
    if (isProtected) {
      return NextResponse.json(
        { error: "Öğrenci oturumu şu anda doğrulanamıyor." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user && isProtected) {
    const loginUrl = new URL("/giris", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return response;
}
