import { computeCaseStatus } from "./case-status.config";

describe("computeCaseStatus", () => {
  it("maps finished examination statuses to FINISHED", () => {
    expect(computeCaseStatus("تم الفحص")).toBe("FINISHED");
    expect(computeCaseStatus("مستوفي")).toBe("FINISHED");
    expect(computeCaseStatus("غير مستوفي")).toBe("FINISHED");
    expect(computeCaseStatus("منتهي")).toBe("FINISHED");
  });

  it("maps in-progress examination statuses to NOT_FINISHED", () => {
    expect(computeCaseStatus("قيد الفحص")).toBe("NOT_FINISHED");
    expect(computeCaseStatus("غير منتهي")).toBe("NOT_FINISHED");
  });

  it("defaults unknown, null, and empty values to NOT_FINISHED", () => {
    expect(computeCaseStatus("حالة غير معروفة")).toBe("NOT_FINISHED");
    expect(computeCaseStatus(null)).toBe("NOT_FINISHED");
    expect(computeCaseStatus(undefined)).toBe("NOT_FINISHED");
    expect(computeCaseStatus("")).toBe("NOT_FINISHED");
  });
});
