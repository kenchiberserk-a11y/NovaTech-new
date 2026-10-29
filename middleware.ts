import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.redirect(new URL("/", request.url));
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => items.forEach(({ name, value, options }) => {
        request.cookies.set(name, value);
        response.cookies.set(name, value, options);
      })
    }
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (!user) return NextResponse.redirect(new URL("/", request.url));
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (path.startsWith("/admin") && profile?.role !== "admin") return NextResponse.redirect(new URL("/workspace?denied=1", request.url));
  if (path.startsWith("/workspace") && profile?.role !== "employee" && profile?.role !== "admin") return NextResponse.redirect(new URL("/", request.url));
  return response;
}
export const config = { matcher: ["/admin/:path*", "/workspace/:path*"] };
