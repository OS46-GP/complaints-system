import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockedHash = bcrypt.hash as jest.Mock;

const prisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  notification: { create: jest.fn(), createMany: jest.fn() },
  passwordResetRequest: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
};

const service = new UsersService(prisma as any);

const official = {
  id: "u1",
  username: "official1",
  fullName: "أحمد محمد",
  email: null,
  nationalId: "12345678901234",
  password: "hashed",
  role: "Official",
  isBlocked: false,
  createdAt: new Date(),
};

const actor = (role: "Official" | "Admin" | "SuperAdmin") => ({
  id: "actor-1",
  username: "actor",
  fullName: null,
  email: null,
  nationalId: null,
  role,
  createdAt: new Date(),
});

describe("UsersService", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("create", () => {
    const dto = { username: "newuser", password: "secret" };

    it("forbids creating a SuperAdmin account by anyone", async () => {
      await expect(
        service.create(actor("SuperAdmin"), { ...dto, role: "SuperAdmin" }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("forbids an Official from creating an Admin account", async () => {
      await expect(
        service.create(actor("Official"), { ...dto, role: "Admin" }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("forbids a duplicate username", async () => {
      prisma.user.findUnique.mockResolvedValue({ username: dto.username });

      await expect(service.create(actor("Admin"), dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("forbids a duplicate national ID", async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // username check
        .mockResolvedValueOnce({ nationalId: "9999" }); // nationalId check

      await expect(
        service.create(actor("Admin"), { ...dto, nationalId: "9999" }),
      ).rejects.toThrow(ConflictException);
    });

    it("creates an Official account with a hashed password", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      mockedHash.mockResolvedValue("hashed-secret");
      prisma.user.create.mockResolvedValue(official);

      const result = await service.create(actor("Admin"), dto);

      expect(mockedHash).toHaveBeenCalledWith("secret", 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: "newuser",
          fullName: null,
          email: null,
          nationalId: null,
          password: "hashed-secret",
          role: "Official",
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(official);
    });
  });

  describe("findAll", () => {
    it("hides SuperAdmin accounts and the actor from non-SuperAdmin results", async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.findAll(actor("Admin"));

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { role: { not: "SuperAdmin" } },
              { id: { not: "actor-1" } },
            ],
          },
        }),
      );
    });

    it("does not apply the visibility filter for SuperAdmin actors", async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.findAll(actor("SuperAdmin"));

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe("findById", () => {
    it("throws when the user does not exist", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById(actor("Admin"), "missing")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("masks the national ID for non-SuperAdmin actors", async () => {
      prisma.user.findUnique.mockResolvedValue(official);

      const result = await service.findById(actor("Admin"), "u1");

      expect(result.nationalId).toBe("****1234");
    });

    it("leaves the national ID unmasked for SuperAdmin actors", async () => {
      prisma.user.findUnique.mockResolvedValue(official);

      const result = await service.findById(actor("SuperAdmin"), "u1");

      expect(result.nationalId).toBe("12345678901234");
    });
  });

  describe("update role permissions", () => {
    it("forbids assigning the SuperAdmin role", async () => {
      prisma.user.findUnique.mockResolvedValue(official);

      await expect(
        service.update(actor("SuperAdmin"), "u1", { role: "SuperAdmin" }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("forbids an Official from promoting a user to Admin", async () => {
      prisma.user.findUnique.mockResolvedValue(official);

      await expect(
        service.update(actor("Official"), "u1", { role: "Admin" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("block / unblock", () => {
    it("forbids blocking your own account", async () => {
      const self = { ...official, id: "actor-1" };
      prisma.user.findUnique.mockResolvedValue(self);

      await expect(service.block(actor("Admin"), "actor-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("blocks the target and notifies them", async () => {
      prisma.user.findUnique.mockResolvedValue(official);
      prisma.user.update.mockResolvedValue(official);

      await service.block(actor("Admin"), "u1");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { isBlocked: true },
        select: expect.any(Object),
      });
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            recipientId: "u1",
            type: "ACCOUNT_BLOCKED",
            title: "تم حظر حسابك",
            body: expect.any(String),
          },
        }),
      );
    });
  });

  describe("remove", () => {
    it("forbids a SuperAdmin from deleting another SuperAdmin account", async () => {
      const otherSuperAdmin = { ...official, id: "sa-2", role: "SuperAdmin" };
      prisma.user.findUnique.mockResolvedValue(otherSuperAdmin);

      await expect(
        service.remove(actor("SuperAdmin"), "sa-2"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("deletes an existing non-self account", async () => {
      prisma.user.findUnique.mockResolvedValue(official);
      prisma.user.delete.mockResolvedValue(official);

      await expect(service.remove(actor("Admin"), "u1")).resolves.toEqual({
        success: true,
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
    });
  });

  describe("requestPasswordReset", () => {
    it("rejects an unknown national ID", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.requestPasswordReset({ nationalId: "00000000000000" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("notifies Admins and SuperAdmins for an Official's request", async () => {
      prisma.user.findUnique.mockResolvedValue(official);
      prisma.passwordResetRequest.create.mockResolvedValue({ id: "req-1" });

      const result = await service.requestPasswordReset({
        nationalId: official.nationalId,
      });

      expect(result).toEqual({
        matched: true,
        username: "official1",
        requestId: "req-1",
      });
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          { recipientRole: "Admin", type: "PASSWORD_RESET_REQUEST", title: expect.any(String), body: expect.any(String), resourceId: "req-1" },
          { recipientRole: "SuperAdmin", type: "PASSWORD_RESET_REQUEST", title: expect.any(String), body: expect.any(String), resourceId: "req-1" },
        ],
      });
    });
  });
});