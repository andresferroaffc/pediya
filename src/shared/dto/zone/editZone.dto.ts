import { PartialType } from '@nestjs/mapped-types';
import { ZoneDto } from './zone.dto';

export class EditZoneDto extends PartialType(ZoneDto) {}
