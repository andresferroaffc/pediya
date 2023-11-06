import { Injectable } from '@nestjs/common';
import { ReferralDto } from 'src/shared/dto';
import { Referral } from '../shared/entity';

@Injectable()
export class ReferralService {
  constructor() {}

  async create(dto: ReferralDto) {
    return true;
  }
}
