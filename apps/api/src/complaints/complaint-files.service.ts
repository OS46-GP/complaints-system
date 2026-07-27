import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as path from "path";
import * as fs from "fs";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF.]/g, "_");
}

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
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });
    if (!complaint) {
      throw new NotFoundException("Complaint not found");
    }

    const safeName = sanitizeFilename(file.originalname);
    const storageKey = `${complaintId}/${Date.now()}-${safeName}`;
    const dir = path.join(this.uploadDir, complaintId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(path.join(this.uploadDir, storageKey), file.buffer);

    return this.prisma.complaintFile.create({
      data: {
        complaintId,
        fileType,
        storageKey,
      },
    });
  }

  async findAll(complaintId: string) {
    const files = await this.prisma.complaintFile.findMany({
      where: { complaintId },
      orderBy: { uploadedAt: "desc" },
    });

    return files.map((f) => ({
      ...f,
      downloadUrl: `/api/complaints/${complaintId}/files/${f.id}/download`,
    }));
  }

  async getFile(fileId: string) {
    const fileRecord = await this.prisma.complaintFile.findUnique({
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
