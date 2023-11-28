import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditParameterDto } from '../shared/dto';
import { Parameter } from '../shared/entity';
import { Repository } from 'typeorm';
import { menssageErrorResponse } from '../messages';

@Injectable()
export class ParameterService {
  constructor(
    @InjectRepository(Parameter)
    private parameterRepo: Repository<Parameter>,
  ) {}

  // Consultar parametros
  async findAll(): Promise<Parameter> {
    const data = await this.parameterRepo.find();
    return data[0];
  }

  // Modificar parametros
  async update(dto: EditParameterDto): Promise<Parameter> {
    const data = await this.findAll();
    return await this.parameterRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('parametro').putError,
        );
      });
  }
}
