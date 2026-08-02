import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service';
import { CreateReceptionMethodDto } from './dto/create-reception-method.dto';
import { UpdateReceptionMethodDto } from './dto/update-reception-method.dto';

@Injectable()
export class ReceptionMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReceptionMethodDto) {
    const existing = await this.prisma.receptionMethod.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('اسم طريقة الاستلام موجود مسبقاً');
    }
    return this.prisma.receptionMethod.create({
      data: { name: data.name },
    });
  }

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
    const validSortFields = ['id', 'name'];
    const orderBy: Prisma.ReceptionMethodOrderByWithRelationInput =
      sortBy && validSortFields.includes(sortBy)
        ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' }
        : { id: 'asc' };

    return this.prisma.receptionMethod.findMany({
      where: search
        ? { name: { contains: search } }
        : undefined,
      orderBy,
    });
  }

  async findById(id: number) {
    const receptionMethod = await this.prisma.receptionMethod.findUnique({
      where: { id },
    });
    if (!receptionMethod) {
      throw new NotFoundException('طريقة الاستلام غير موجودة');
    }
    return receptionMethod;
  }

  async update(id: number, data: UpdateReceptionMethodDto) {
    await this.findById(id);

    if (data.name) {
      const existing = await this.prisma.receptionMethod.findUnique({
        where: { name: data.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('اسم طريقة الاستلام موجود مسبقاً');
      }
    }

    return this.prisma.receptionMethod.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findById(id);

    const usageCount = await this.prisma.complaint.count({
      where: { receptionMethodId: id },
    });
    if (usageCount > 0) {
      throw new ConflictException(
        `لا يمكن حذف طريقة الاستلام لأنها مستخدمة في ${usageCount} شكوى`,
      );
    }

    await this.prisma.receptionMethod.delete({ where: { id } });
    return { success: true };
  }
}
