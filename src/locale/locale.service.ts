import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LocaleService {
  API_URL = `${process.env.API_URL_LOCALE}`;
  config = {
    headers: {
      Authorization: 'Bearer ',
      Accept: 'application/json',
    },
  };

  constructor() {}

  async genrateToken(): Promise<string> {
    const config = {
      headers: {
        Accept: 'application/json',
        'api-token': `${process.env.TOKEN_LOCALE}`,
        'user-email': `${process.env.EMAIL_LOCALE}`,
      },
    };
    return axios
      .get(`${this.API_URL}/getaccesstoken/`, config)
      .then(async (res: any) => {
        return res.data.auth_token;
      });
  }

  async dataStates() {
    const token = await this.genrateToken();
    const dataToken = `Bearer ${token}`;
    this.config.headers.Authorization = dataToken;
    return axios
      .get(`${this.API_URL}/states/Colombia`, this.config)
      .then((res: any) => {
        return res.data;
      })
      .catch(async (Error) => {
        console.log(Error);
        throw new BadRequestException(
          'Error, al cargar los departamentos, comuniquece con el administrador',
        );
      });
  }

  async dataCitys(state_name: string) {
    const token = await this.genrateToken();
    const dataToken = `Bearer ${token}`;
    this.config.headers.Authorization = dataToken;
    return axios
      .get(`${this.API_URL}/cities/${state_name}`, this.config)
      .then((res: any) => {
        return res.data;
      })
      .catch(async (Error) => {
        console.log(Error);
        throw new BadRequestException(
          'Error, al cargar las ciudades, comuniquece con el administrador',
        );
      });
  }
}
