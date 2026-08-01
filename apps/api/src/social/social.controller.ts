import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
} from "@nestjs/common";
import { Request } from "express";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { SocialService } from "./social.service";
import { SocialMonitorService } from "./social-monitor.service";

@Controller("social")
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly monitorService: SocialMonitorService,
  ) {}

  @Post("poll")
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async triggerPoll() {
    return this.monitorService.poll();
  }

  @Get("drafts")
  listDrafts(
    @Query("status") status?: "Pending" | "Approved" | "Rejected",
  ) {
    return this.socialService.listDrafts(status);
  }

  @Post("drafts/:id/approve")
  approveDraft(@Param("id") id: string, @Req() req: Request) {
    return this.socialService.approveDraft(
      id,
      (req.user as { id: string }).id,
    );
  }

  @Post("drafts/:id/reject")
  rejectDraft(
    @Param("id") id: string,
    @Body("notes") notes?: string,
  ) {
    return this.socialService.rejectDraft(id, notes);
  }

  @Get("groups")
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  listGroups() {
    return this.socialService.listMonitoredGroups();
  }

  @Post("groups")
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  addGroup(
    @Body() data: { groupId: string; name: string; type: "Group" | "Page" },
  ) {
    return this.socialService.addMonitoredGroup(data);
  }

  @Post("groups/:id/toggle")
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  toggleGroup(
    @Param("id") id: string,
    @Body("isActive") isActive: boolean,
  ) {
    return this.socialService.toggleMonitoredGroup(id, isActive);
  }

  @Post("groups/:id/remove")
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  removeGroup(@Param("id") id: string) {
    return this.socialService.removeMonitoredGroup(id);
  }
}