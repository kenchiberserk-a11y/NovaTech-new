import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Isolated authentication test target. This endpoint never creates a session,
 * never grants an application role, and never exposes real user data.
 * It fails closed unless explicitly enabled and protected by a lab token
 * plus an optional exact source-IP allowlist.
 */
export async function POST(request: NextRequest) {
  if (process.env.LAB_LOGIN_ENABLED !== "true") {
    return NextResponse.json({ result: "LAB_DISABLED" }, { status: 404 });
  }

  const expectedToken = process.env.LAB_ACCESS_TOKEN;
  const suppliedToken = request.headers.get("x-lab-token");
  if (!expectedToken || !suppliedToken || suppliedToken !== expectedToken) {
    return NextResponse.json({ result: "LAB_FORBIDDEN" }, { status: 403 });
  }

  const allowedIp = process.env.LAB_ALLOWED_IP?.trim();
  // Require the allowlist to be configured; never silently run token-only.
  const clientIp = request.headers.get("x-real-ip")?.trim();
  if (!allowedIp || !clientIp || clientIp !== allowedIp) {
    return NextResponse.json({ result: "LAB_FORBIDDEN" }, { status: 403 });
  }

  const username = process.env.LAB_TEST_USERNAME;
  const password = process.env.LAB_TEST_PASSWORD;
  if (!username || !password) {
    return NextResponse.json({ result: "LAB_MISCONFIGURED" }, { status: 503 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let submittedUsername = "";
  let submittedPassword = "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    submittedUsername = String(form.get("username") ?? "");
    submittedPassword = String(form.get("password") ?? "");
  } else if (contentType.includes("application/json")) {
    const body: unknown = await request.json().catch(() => null);
    if (body && typeof body === "object") {
      const values = body as Record<string, unknown>;
      submittedUsername = typeof values.username === "string" ? values.username : "";
      submittedPassword = typeof values.password === "string" ? values.password : "";
    }
  } else {
    return NextResponse.json({ result: "LAB_BAD_REQUEST" }, { status: 415 });
  }

  // Intentionally generic failure marker; success is a test-only signal and
  // does not authenticate the caller into NovaTech or create a session.
  if (submittedUsername === username && submittedPassword === password) {
    return NextResponse.json({ result: "LAB_LOGIN_OK" }, { status: 200 });
  }

  return NextResponse.json({ result: "LAB_LOGIN_FAILED" }, { status: 401 });
}
