import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service';
import { CreateComplaintTypeDto } from './dto/create-complaint-type.dto';
import { UpdateComplaintTypeDto } from './dto/update-complaint-type.dto';

@Injectable()
export class ComplaintTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateComplaintTypeDto) {
    const existing = await this.prisma.complaintType.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('اسم الفئة موجود مسبقاً');
    }
    return this.prisma.complaintType.create({
      data: { name: data.name },
    });
  }

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    const validSortFields = ["id", "name"];
    const orderBy: Prisma.ComplaintTypeOrderByWithRelationInput =
      sortBy && validSortFields.includes(sortBy)
        ? { [sortBy]: sortOrder === "desc" ? "desc" : "asc" }
        : { id: "asc" };

    return this.prisma.complaintType.findMany({
      where: search
        ? { name: { contains: search } }
        : undefined,
      orderBy,
    });
  }

  async findById(id: number) {
    const complaintType = await this.prisma.complaintType.findUnique({
      where: { id },
    });
    if (!complaintType) {
      throw new NotFoundException('الفئة غير موجودة');
    }
    return complaintType;
  }

  async update(id: number, data: UpdateComplaintTypeDto) {
    await this.findById(id);

    if (data.name) {
      const existing = await this.prisma.complaintType.findUnique({
        where: { name: data.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('اسم الفئة موجود مسبقاً');
      }
    }

    return this.prisma.complaintType.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findById(id);

    const usageCount = await this.prisma.complaint.count({
      where: { complaintTypeId: id },
    });
    if (usageCount > 0) {
      throw new ConflictException(
        `لا يمكن حذف الفئة لأنها مستخدمة في ${usageCount} شكوى`,
      );
    }

    await this.prisma.complaintType.delete({ where: { id } });
    return { success: true };
  }
}
