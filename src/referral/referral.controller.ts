import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { HttpResponse} from '../shared/dto';
import { ReferralService } from './referral.service';
import { menssageSuccessResponse } from 'src/messages';

@Controller('referral')
export class ReferralController {
  constructor(private readonly serviceReferral: ReferralService) {}
  @Post('create-referral')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(@Body() dto: any): Promise<HttpResponse<boolean>> {
    const data = await this.serviceReferral.create(dto);
    return { message: menssageSuccessResponse('remision').post, data };
  }
}
