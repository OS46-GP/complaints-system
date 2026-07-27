import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class ComplaintFilesService {
  private readonly uploadDir: string;

  constructor(private readonly prisma: PrismaService) {
    this.uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(complaintId: string, file: Express.Multer.File, fileType: string) {
    const complaint = await this.prisma.client.complaint.findUnique({
      where: { id: complaintId },
    });
    if (!complaint) {
      throw new NotFoundException("Complaint not found");
    }

    const storageKey = `${complaintId}/${Date.now()}-${file.originalname}`;
    const dir = path.join(this.uploadDir, complaintId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(path.join(this.uploadDir, storageKey), file.buffer);

    return this.prisma.client.complaintFile.create({
      data: {
        complaintId,
        fileType,
        storageKey,
      },
    });
  }

  async findAll(complaintId: string) {
    const files = await this.prisma.client.complaintFile.findMany({
      where: { complaintId },
      orderBy: { uploadedAt: "desc" },
    });

    return files.map((f) => ({
      ...f,
      downloadUrl: `/api/complaints/${complaintId}/files/${f.id}/download`,
    }));
  }

  async getFile(fileId: string) {
    const fileRecord = await this.prisma.client.complaintFile.findUnique({
      where: { id: fileId },
    });
    if (!fileRecord) {
      throw new NotFoundException("File not found");
    }

    const filePath = path.join(this.uploadDir, fileRecord.storageKey);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException("File not found on disk");
    }

    const stream = fs.createReadStream(filePath);
    return { stream, fileRecord };
  }
}
