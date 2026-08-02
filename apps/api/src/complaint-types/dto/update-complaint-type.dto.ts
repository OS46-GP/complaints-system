import { PartialType } from '@nestjs/mapped-types';
import { CreateComplaintTypeDto } from './create-complaint-type.dto';

export class UpdateComplaintTypeDto extends PartialType(CreateComplaintTypeDto) {}
