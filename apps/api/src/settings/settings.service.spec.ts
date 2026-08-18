import { SettingsService } from "./settings.service";

describe("SettingsService", () => {
  const delayThreshold = {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  };
  const prisma = { client: { delayThreshold } };
  const service = new SettingsService(prisma as any);

  beforeEach(() => jest.clearAllMocks());

  it("returns the stored thresholds when they exist", async () => {
    const row = {
      id: 1,
      lowDays: 40,
      mediumDays: 20,
      highDays: 10,
      updatedAt: new Date(),
    };
    delayThreshold.findUnique.mockResolvedValue(row);

    await expect(service.getDelayThresholds()).resolves.toBe(row);
    expect(delayThreshold.create).not.toHaveBeenCalled();
  });

  it("creates default thresholds when none are stored yet", async () => {
    delayThreshold.findUnique.mockResolvedValue(null);
    delayThreshold.create.mockResolvedValue({ id: 1, lowDays: 45, mediumDays: 30, highDays: 15, updatedAt: new Date() });

    await service.getDelayThresholds();

    expect(delayThreshold.create).toHaveBeenCalledWith({
      data: { id: 1, lowDays: 45, mediumDays: 30, highDays: 15 },
    });
  });

  it("upserts the new thresholds", async () => {
    const dto = { lowDays: 60, mediumDays: 30, highDays: 10 };
    const updated = { id: 1, ...dto, updatedAt: new Date() };
    delayThreshold.upsert.mockResolvedValue(updated);

    await expect(service.updateDelayThresholds(dto)).resolves.toBe(updated);
    expect(delayThreshold.upsert).toHaveBeenCalledWith({
      where: { id: 1 },
      create: { id: 1, ...dto },
      update: dto,
    });
  });
});
