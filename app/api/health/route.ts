import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  version: string;
  checks: {
    database: "ok" | "error";
    openai: "configured" | "not_configured";
    stripe: "configured" | "not_configured";
    redis: "configured" | "not_configured";
  };
  uptime: number;
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const start = Date.now();
  let dbStatus: "ok" | "error" = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  const checks = {
    database: dbStatus,
    openai:   process.env.OPENAI_API_KEY   ? "configured" : "not_configured",
    stripe:   process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
    redis:    process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
                ? "configured"
                : "not_configured"
  } as const;

  const allOk = Object.values(checks).every(
    (v) => v === "ok" || v === "configured" || v === "not_configured"
  );
  const overallStatus: "ok" | "degraded" | "error" =
    dbStatus === "error" ? "error" : allOk ? "ok" : "degraded";

  const body: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    checks,
    uptime: Math.round(process.uptime())
  };

  return NextResponse.json(body, {
    status: overallStatus === "error" ? 503 : 200
  });
}
