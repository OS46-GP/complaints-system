import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        name: data.name,
        subAuthority: data.subAuthority ?? null,
      },
    });
  }

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
    const validSortFields = ['name', 'subAuthority', 'createdAt'];
    const orderBy: Prisma.DepartmentOrderByWithRelationInput =
      sortBy && validSortFields.includes(sortBy)
        ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' }
        : { name: 'asc' };

    return this.prisma.department.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { subAuthority: { contains: search } },
            ],
          }
        : undefined,
      orderBy,
    });
  }

  async findById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('الجهة غير موجودة');
    }
    return department;
  }

  async update(id: string, data: UpdateDepartmentDto) {
    await this.findById(id);

    const updateData: Prisma.DepartmentUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.subAuthority !== undefined) {
      updateData.subAuthority = data.subAuthority || null;
    }

    return this.prisma.department.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findById(id);

    const usageCount = await this.prisma.complaint.count({
      where: { departmentId: id },
    });
    if (usageCount > 0) {
      throw new ConflictException(
        `لا يمكن حذف الجهة لأنها مستخدمة في ${usageCount} شكوى`,
      );
    }

    await this.prisma.department.delete({ where: { id } });
    return { success: true };
  }
}
