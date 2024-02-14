import {
  Body,
  Controller,
  Post,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { Roles, user } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import {
  EditStatusReferralDto,
  HttpResponse,
  ReferralDto,
} from '../shared/dto';
import { ReferralService } from './referral.service';
import { menssageSuccessResponse } from '../messages';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('referral')
export class ReferralController {
  constructor(private readonly serviceReferral: ReferralService) {}
  @Post('create-referral')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(
    @user('id') idUser: number,
    @user('role') role: string,
    @user('dropshipping') dropshipping: boolean,
    @Body() dto: ReferralDto,
  ): Promise<HttpResponse<Object>> {
    const data = await this.serviceReferral.create(
      idUser,
      role,
      dropshipping,
      dto,
    );
    return { message: menssageSuccessResponse('remision').post, data };
  }

  // Modificar estado de la remsion
  @Patch('update-status-referral/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditStatusReferralDto,
  ): Promise<HttpResponse<object>> {
    const data = await this.serviceReferral.updateStatusReferral(id, dto);
    return { message: menssageSuccessResponse('remision').put, data };
  }

  // Consultar una remison
  @Get('find/:id')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @user('id') idUser: number,
    @user('role') role: string,
  ): Promise<HttpResponse<object>> {
    const data = await this.serviceReferral.findOne(id, idUser, role);
    return { message: menssageSuccessResponse('remision').getOne, data };
  }

  // Consultar todas las remisiones
  @Get('all')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(
    @user('id') idUser: number,
    @user('role') role: string,
  ): Promise<HttpResponse<object>> {
    const data = await this.serviceReferral.findAll(idUser, role);
    return { message: menssageSuccessResponse('remisiones').get, data };
  }

  
  // Generar excel de remisiones por fecha
  @Post('excel-referral/:date')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async generateExcelReferral(
    @Param('date') date: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.serviceReferral.generateExcelReferral(date);

      // Configurar las cabeceras HTTP para la descarga
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Modelo_de_importacion_de_facturas_${date}.xlsx`,
      );

      // Crear un stream de lectura del archivo Excel y enviarlo como respuesta
      if (typeof data === 'string') {
        const fileStream = fs.createReadStream(data);
        fileStream.pipe(res);

        // Eliminar el archivo después de enviarlo para evitar acumulación de archivos
        fileStream.on('end', () => {
          fs.unlinkSync(data);
        });

        // Manejar errores
        fileStream.on('error', (err) => {
          console.error(err);
          res.status(500).send('Error al descargar el archivo');
        });
      } else {
        console.error('Error: El tipo de data no es una cadena (string).');
        res.status(500).send('Error al descargar el archivo');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al generar el archivo Excel');
    }
  }

  // Consultar  remisiones por intervalo de tiempo
  @Get('reports-date')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findReportsDate(
    @Query('date-init') dateInit: string,
    @Query('date-end') dateEnd: string,
  ): Promise<HttpResponse<object>> {
    const data = await this.serviceReferral.findReportsDate(dateInit, dateEnd);
    return {
      message: menssageSuccessResponse('remisiones por fecha').get,
      data,
    };
  }

  // Consultar  remisiones por vendedor
  @Get('reports-seller/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findReportSeller(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<object>> {
    const data = await this.serviceReferral.findReportsSeller(id);
    return {
      message: menssageSuccessResponse('remisiones por vendedor').get,
      data,
    };
  }

  // Consultar  remisiones por cliente
  @Get('reports-customer/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findReportCustomer(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<object>> {
    const data = await this.serviceReferral.findReportsCustomer(id);
    return {
      message: menssageSuccessResponse('remisiones por cliente').get,
      data,
    };
  }

  // Descargar excel de reporte por fechas
  @Post('excel-referral-download-date')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async generateExcelReferraldownloadDate(
    @Query('date-init') dateInit: string,
    @Query('date-end') dateEnd: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.serviceReferral.generateExcelReferralDownloadDate(
        dateInit,
        dateEnd,
      );

      // Configurar las cabeceras HTTP para la descarga
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte_fechas_${dateInit}_x_${dateEnd}.xlsx`,
      );

      // Crear un stream de lectura del archivo Excel y enviarlo como respuesta
      if (typeof data === 'string') {
        const fileStream = fs.createReadStream(data);
        fileStream.pipe(res);

        // Eliminar el archivo después de enviarlo para evitar acumulación de archivos
        fileStream.on('end', () => {
          fs.unlinkSync(data);
        });

        // Manejar errores
        fileStream.on('error', (err) => {
          console.error(err);
          res.status(500).send('Error al descargar el archivo');
        });
      } else {
        console.error('Error: El tipo de data no es una cadena (string).');
        res.status(500).send('Error al descargar el archivo');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al generar el archivo Excel');
    }
  }

  // Descargar excel de reporte por vendedor
  @Post('excel-referral-download-seller/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async generateExcelReferraldownloadSeller(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const data =
        await this.serviceReferral.generateExcelReferralDownloadSeller(id);

      // Configurar las cabeceras HTTP para la descarga
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte_vendedor_${id}.xlsx`,
      );

      // Crear un stream de lectura del archivo Excel y enviarlo como respuesta
      if (typeof data === 'string') {
        const fileStream = fs.createReadStream(data);
        fileStream.pipe(res);

        // Eliminar el archivo después de enviarlo para evitar acumulación de archivos
        fileStream.on('end', () => {
          fs.unlinkSync(data);
        });

        // Manejar errores
        fileStream.on('error', (err) => {
          console.error(err);
          res.status(500).send('Error al descargar el archivo');
        });
      } else {
        console.error('Error: El tipo de data no es una cadena (string).');
        res.status(500).send('Error al descargar el archivo');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al generar el archivo Excel');
    }
  }

  // Descargar excel de reporte por cliente
  @Post('excel-referral-download-customer/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async generateExcelReferraldownloadCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const data =
        await this.serviceReferral.generateExcelReferralDownloadCustomer(id);

      // Configurar las cabeceras HTTP para la descarga
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte_customer_${id}.xlsx`,
      );

      // Crear un stream de lectura del archivo Excel y enviarlo como respuesta
      if (typeof data === 'string') {
        const fileStream = fs.createReadStream(data);
        fileStream.pipe(res);

        // Eliminar el archivo después de enviarlo para evitar acumulación de archivos
        fileStream.on('end', () => {
          fs.unlinkSync(data);
        });

        // Manejar errores
        fileStream.on('error', (err) => {
          console.error(err);
          res.status(500).send('Error al descargar el archivo');
        });
      } else {
        console.error('Error: El tipo de data no es una cadena (string).');
        res.status(500).send('Error al descargar el archivo');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al generar el archivo Excel');
    }
  }

  // Consultar fecha minima y maxima pra los reportes
  @Get('date-min-max')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findDateMInMax(): Promise<HttpResponse<object>> {
    const data = await this.serviceReferral.findDateMInMax();
    return { message: menssageSuccessResponse('rango de fechas').getOne, data };
  }
}
