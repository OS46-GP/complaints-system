import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockedCompare = bcrypt.compare as jest.Mock;

describe("AuthService", () => {
  const usersService = { findByUsername: jest.fn() };
  const jwtService = { sign: jest.fn() };
  const service = new AuthService(usersService as any, jwtService as any);

  const user = {
    id: "u1",
    username: "official1",
    fullName: "أحمد محمد",
    email: "a@example.com",
    nationalId: "12345678901234",
    password: "hashed-password",
    role: "Official",
    isBlocked: false,
    createdAt: new Date(),
  };

  beforeEach(() => jest.clearAllMocks());

  describe("validateUser", () => {
    it("returns null when the user does not exist", async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(service.validateUser("nobody", "pass")).resolves.toBeNull();
    });

    it("throws when the account is blocked", async () => {
      usersService.findByUsername.mockResolvedValue({ ...user, isBlocked: true });

      await expect(service.validateUser("official1", "pass")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("returns null when the password is wrong", async () => {
      usersService.findByUsername.mockResolvedValue(user);
      mockedCompare.mockResolvedValue(false);

      await expect(service.validateUser("official1", "wrong")).resolves.toBeNull();
    });

    it("returns the user without the password when credentials are valid", async () => {
      usersService.findByUsername.mockResolvedValue(user);
      mockedCompare.mockResolvedValue(true);

      const result = await service.validateUser("official1", "correct");

      expect(mockedCompare).toHaveBeenCalledWith("correct", "hashed-password");
      expect(result).toEqual({
        id: "u1",
        username: "official1",
        fullName: "أحمد محمد",
        email: "a@example.com",
        nationalId: "12345678901234",
        role: "Official",
        isBlocked: false,
        createdAt: user.createdAt,
      });
      expect(result).not.toHaveProperty("password");
    });
  });

  describe("login", () => {
    it("signs a JWT with the user payload and returns the token", async () => {
      jwtService.sign.mockReturnValue("signed-token");

      const result = await service.login({ id: "u1", username: "official1", role: "Official" });

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: "official1",
        sub: "u1",
        role: "Official",
      });
      expect(result).toEqual({ access_token: "signed-token" });
    });
  });
});
