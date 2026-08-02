import { PartialType } from '@nestjs/mapped-types';
import { CreateReceptionMethodDto } from './create-reception-method.dto';

export class UpdateReceptionMethodDto extends PartialType(CreateReceptionMethodDto) {}
