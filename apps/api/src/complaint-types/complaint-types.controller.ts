import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateComplaintTypeDto } from './dto/create-complaint-type.dto';
import { UpdateComplaintTypeDto } from './dto/update-complaint-type.dto';
import { ComplaintTypesService } from './complaint-types.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('complaint-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class ComplaintTypesController {
  constructor(private readonly complaintTypesService: ComplaintTypesService) {}

  @Post()
  create(@Body() createComplaintTypeDto: CreateComplaintTypeDto) {
    return this.complaintTypesService.create(createComplaintTypeDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.complaintTypesService.findAll(search, sortBy, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.complaintTypesService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComplaintTypeDto: UpdateComplaintTypeDto,
  ) {
    return this.complaintTypesService.update(id, updateComplaintTypeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.complaintTypesService.remove(id);
  }
}
