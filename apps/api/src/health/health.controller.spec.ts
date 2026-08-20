import { HttpException } from "@nestjs/common";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  const prismaMock = { client: { $queryRaw: jest.fn() } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns ok when the database responds", async () => {
    prismaMock.client.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    const controller = new HealthController(prismaMock as any);

    const result = await controller.check();

    expect(result.status).toBe("ok");
    expect(result.db).toBe("up");
    expect(typeof result.uptime).toBe("number");
    expect(typeof result.timestamp).toBe("string");
  });

  it("returns 503 degraded when the database is unreachable", async () => {
    prismaMock.client.$queryRaw.mockRejectedValue(new Error("connection refused"));
    const controller = new HealthController(prismaMock as any);

    const error = await controller.check().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(503);
    expect((error as HttpException).getResponse()).toMatchObject({
      status: "degraded",
      db: "down",
    });
  });

  it("returns 503 degraded when the database check times out", async () => {
    prismaMock.client.$queryRaw.mockImplementation(
      () =>
        new Promise((_resolve) => {
          /* never settles */
        }),
    );
    const controller = new HealthController(prismaMock as any);

    const error = await controller.check().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(503);
    expect((error as HttpException).getResponse()).toMatchObject({
      db: "down",
    });
  });
});