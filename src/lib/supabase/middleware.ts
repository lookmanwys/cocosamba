import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 1. Setup the Rate Limiter
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 100; 
const WINDOW_MS = 60 * 1000; 

export async function updateSession(request: NextRequest) {
  // 2. Apply Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (record) {
    if (now - record.lastReset > WINDOW_MS) {
      record.count = 1;
      record.lastReset = now;
    } else {
      record.count++;
      if (record.count > LIMIT) {
        return new NextResponse("Too many requests. Please try again later.", {
          status: 429,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }
  } else {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
  }

  // 3. Proceed with standard Supabase Auth Middleware
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
      auth: {
        storageKey: "marschain-auth",
        flowType: "pkce",
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 4. Auth & Verification Logic
  if (user) {
    // If a logged-in user tries to go to login/register, push them to dashboard
    if (path === "/login" || path === "/register") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Check verification status (excluding /verify, /api, static files)
    if (path !== "/verify" && !path.startsWith("/api") && !path.startsWith("/_next")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_verified, is_admin")
        .eq("id", user.id)
        .single();

      // 🔥 THE FIX: Only enforce verification if they are NOT an admin
      if (profile && !profile.is_verified && !profile.is_admin) {
        const url = request.nextUrl.clone();
        url.pathname = "/verify";
        return NextResponse.redirect(url);
      }
    }
  } else {
    // If NO user is logged in, protect these routes
    const protectedPaths = ["/dashboard", "/buy", "/admin", "/verify", "/sell"];
    const isProtected = protectedPaths.some((p) => path.startsWith(p));

    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
