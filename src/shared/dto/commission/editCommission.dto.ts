import { PartialType} from '@nestjs/mapped-types';
import { CommissionDto } from './commission.dto';

export class EditCommissionDto extends PartialType(CommissionDto) {}
