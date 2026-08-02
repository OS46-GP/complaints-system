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
import { CreateReceptionMethodDto } from './dto/create-reception-method.dto';
import { UpdateReceptionMethodDto } from './dto/update-reception-method.dto';
import { ReceptionMethodsService } from './reception-methods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reception-methods')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class ReceptionMethodsController {
  constructor(private readonly receptionMethodsService: ReceptionMethodsService) {}

  @Post()
  create(@Body() createReceptionMethodDto: CreateReceptionMethodDto) {
    return this.receptionMethodsService.create(createReceptionMethodDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.receptionMethodsService.findAll(search, sortBy, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.receptionMethodsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReceptionMethodDto: UpdateReceptionMethodDto,
  ) {
    return this.receptionMethodsService.update(id, updateReceptionMethodDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.receptionMethodsService.remove(id);
  }
}
