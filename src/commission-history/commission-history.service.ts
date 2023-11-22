import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validatExistException } from '../common/utils';
import { menssageErrorResponse } from '../messages';
import { CommissionHistoryDto } from '../shared/dto';
import { CommissionHistory } from '../shared/entity';
import { Repository } from 'typeorm';
import { RoleEnum } from '../common/enum';

@Injectable()
export class CommissionHistoryService {
  constructor(
    @InjectRepository(CommissionHistory)
    private commissionHistoryRepo: Repository<CommissionHistory>,
  ) {}

  // Consultar todos los historicos de comision
  async findAll(id: number, role: string): Promise<CommissionHistory[]> {
    let where = {};
    if (role === RoleEnum.Vendedor) {
      where = { referral_id: { seller_id: { id: id } } };
    }

    const data = await this.commissionHistoryRepo
      .createQueryBuilder('history')
      .innerJoinAndSelect('history.referral_id', 'referral')
      .leftJoin('referral.seller_id', 'seller')
      .where(where)
      .getMany()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('historicos de comision').getError,
        );
      });
    return data;
  }

  // Consultar un historico de comision
  async findOne(
    id: number,
    role: string,
    idUser?: number,
  ): Promise<CommissionHistory> {
    let where = {};
    where = { id: id };
    if (role === RoleEnum.Vendedor) {
      where = { id: id, referral_id: { seller_id: { id: idUser } } };
    }

    const data = await this.commissionHistoryRepo
      .createQueryBuilder('history')
      .innerJoinAndSelect('history.referral_id', 'referral')
      .leftJoin('referral.seller_id', 'seller')
      .where(where)
      .getOne()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('historico de comision').getOneError,
        );
      });
    validatExistException(data, 'historico de comision', 'ValidateNoexist');
    return data;
  }

  // Modificar historico de comision
  async update(
    id: number,
    dto: CommissionHistoryDto,
  ): Promise<CommissionHistory> {
    const data = await this.findOne(id, RoleEnum.Administrador);
    data.status = dto.status;
    data.description = dto.description;
    return await this.commissionHistoryRepo.save(data).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('historico de comision').putError,
      );
    });
  }
}
