import { ConflictException, NotFoundException } from "@nestjs/common";
import { ComplaintTypesService } from "./complaint-types.service";

describe("ComplaintTypesService", () => {
  const complaintType = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const complaint = { count: jest.fn() };
  const prisma = { complaintType, complaint };

  const service = new ComplaintTypesService(prisma as any);

  const category = { id: 1, name: "الطرق", createdAt: new Date(), updatedAt: new Date() };

  beforeEach(() => jest.clearAllMocks());

  describe("create", () => {
    it("forbids a duplicate category name", async () => {
      complaintType.findUnique.mockResolvedValue(category);

      await expect(service.create({ name: "الطرق" })).rejects.toThrow(
        ConflictException,
      );
    });

    it("creates a new category", async () => {
      complaintType.findUnique.mockResolvedValue(null);
      complaintType.create.mockResolvedValue(category);

      await expect(service.create({ name: "الطرق" })).resolves.toEqual(category);
      expect(complaintType.create).toHaveBeenCalledWith({
        data: { name: "الطرق" },
      });
    });
  });

  describe("findAll", () => {
    it("defaults to ascending id order and no filter", async () => {
      complaintType.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(complaintType.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { id: "asc" },
      });
    });

    it("applies a search filter and a whitelisted sort field", async () => {
      complaintType.findMany.mockResolvedValue([]);

      await service.findAll("طرق", "name", "desc");

      expect(complaintType.findMany).toHaveBeenCalledWith({
        where: { name: { contains: "طرق" } },
        orderBy: { name: "desc" },
      });
    });

    it("ignores sort fields that are not whitelisted", async () => {
      complaintType.findMany.mockResolvedValue([]);

      await service.findAll(undefined, "createdAt", "desc");

      expect(complaintType.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { id: "asc" },
      });
    });
  });

  describe("findById", () => {
    it("throws when the category does not exist", async () => {
      complaintType.findUnique.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });

    it("returns the category", async () => {
      complaintType.findUnique.mockResolvedValue(category);

      await expect(service.findById(1)).resolves.toEqual(category);
    });
  });

  describe("update", () => {
    it("forbids renaming to a name used by another category", async () => {
      complaintType.findUnique
        .mockResolvedValueOnce(category) // findById
        .mockResolvedValueOnce({ ...category, id: 2 }); // name conflict check

      await expect(
        service.update(1, { name: "الطرق" }),
      ).rejects.toThrow(ConflictException);
    });

    it("updates the category", async () => {
      complaintType.findUnique
        .mockResolvedValueOnce(category) // findById
        .mockResolvedValueOnce(category); // name check (same id, allowed)
      complaintType.update.mockResolvedValue({ ...category, name: "الطرق الجديدة" });

      await expect(
        service.update(1, { name: "الطرق الجديدة" }),
      ).resolves.toEqual({ ...category, name: "الطرق الجديدة" });
    });
  });

  describe("remove", () => {
    it("forbids deleting a category that is still in use", async () => {
      complaintType.findUnique.mockResolvedValue(category);
      complaint.count.mockResolvedValue(3);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(complaintType.delete).not.toHaveBeenCalled();
    });

    it("deletes an unused category", async () => {
      complaintType.findUnique.mockResolvedValue(category);
      complaint.count.mockResolvedValue(0);
      complaintType.delete.mockResolvedValue(category);

      await expect(service.remove(1)).resolves.toEqual({ success: true });
      expect(complaintType.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});