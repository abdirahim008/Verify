import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes the matcher protects/handles. Extending protection to new routes
// means adding to BOTH the matcher below AND the logic here.
const PUBLIC_PATHS = new Set(["/login", "/signup", "/auth/callback"]);

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Public marketing root, /u/[id] public profiles, and auth pages stay
  // accessible. /home and beyond require auth.
  const isPublic =
    path === "/" ||
    PUBLIC_PATHS.has(path) ||
    path.startsWith("/_next") ||
    path.startsWith("/u/");
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  // Logged-in users hitting auth pages bounce to /home.
  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets + favicon. Internal API routes are
    // still guarded inline.
    "/((?!_next/static|_next/image|favicon.ico|fonts/|images/).*)",
  ],
};
