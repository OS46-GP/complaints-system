import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const existing = await this.prisma.client.user.findUnique({
      where: { username: data.username },
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.client.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: data.role || 'Official',
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findAll(filters?: { search?: string; role?: string }) {
    const where: any = {};
    if (filters?.search) {
      where.username = { contains: filters.search };
    }
    if (filters?.role) {
      where.role = filters.role;
    }
    return this.prisma.client.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.client.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findById(id); // verify existence

    const updateData: any = {};
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.role) {
      updateData.role = data.role;
    }

    return this.prisma.client.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id); // verify existence
    await this.prisma.client.user.delete({
      where: { id },
    });
    return { success: true };
  }
}
