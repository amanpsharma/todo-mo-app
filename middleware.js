import { NextResponse } from "next/server";

const DEFAULT_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // safe with Bearer tokens (no cookies)
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function middleware(req) {
  // Preflight for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: DEFAULT_CORS_HEADERS });
  }
  const res = NextResponse.next();
  Object.entries(DEFAULT_CORS_HEADERS).forEach(([k, v]) =>
    res.headers.set(k, v)
  );
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
