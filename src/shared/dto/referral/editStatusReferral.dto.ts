import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusReferralEnum } from '../../../common/enum/status_referral';

export class EditStatusReferralDto {
  @ApiProperty()
  @IsEnum(StatusReferralEnum)
  @IsNotEmpty()
  status_referral: StatusReferralEnum;
}
