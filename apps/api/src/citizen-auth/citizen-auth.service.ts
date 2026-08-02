import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CitizenAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const { email, password, nationalId, fullName, mobileNumber, address, village, district } = dto;

    // 1. Check if email is already in use by any CitizenAccount
    const existingEmail = await this.prisma.client.citizenAccount.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Find existing Citizen by National ID
    let citizen = await this.prisma.client.citizen.findUnique({
      where: { nationalId },
      include: { account: true },
    });

    if (citizen) {
      // 4. If found, check if a CitizenAccount is already linked
      if (citizen.account) {
        throw new ConflictException('An account already exists for this National ID — try logging in or resetting your password');
      }

      // 5. Link the new CitizenAccount to the existing Citizen
      await this.prisma.client.citizenAccount.create({
        data: {
          citizenId: citizen.id,
          email,
          password: hashedPassword,
        },
      });
    } else {
      // 6. If not found, create a new Citizen and a linked CitizenAccount in a transaction
      await this.prisma.client.$transaction(async (tx: any) => {
        citizen = await tx.citizen.create({
          data: {
            fullName,
            nationalId,
            mobileNumber,
            address,
            village,
            district,
          },
        });

        await tx.citizenAccount.create({
          data: {
            citizenId: citizen!.id,
            email,
            password: hashedPassword,
          },
        });
      });
    }

    return { message: 'Registration successful' };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const account = await this.prisma.client.citizenAccount.findUnique({
      where: { email },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: account.citizenId, email: account.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(citizenId: string) {
    const citizen = await this.prisma.client.citizen.findUnique({
      where: { id: citizenId },
      include: {
        account: {
          select: {
            email: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });

    return citizen;
  }
}
