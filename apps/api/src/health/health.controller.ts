import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const DB_CHECK_TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("db check timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Container/readiness probe: 200 when the API and its database are up,
 *  503 (degraded) when the database is unreachable. Public — no auth. */
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const startedAt = Date.now();
    let db: "up" | "down" = "up";
    try {
      await withTimeout(this.prisma.client.$queryRaw`SELECT 1`, DB_CHECK_TIMEOUT_MS);
    } catch {
      db = "down";
    }

    const payload = {
      status: db === "up" ? "ok" : "degraded",
      db,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      checkMs: Date.now() - startedAt,
    };

    if (db !== "up") {
      throw new HttpException(payload, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return payload;
  }
}