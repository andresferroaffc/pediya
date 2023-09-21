import { Inject, Injectable } from '@nestjs/common';
import { UserDto } from '../shared/dto/user';
import * as bcrypt from 'bcrypt';

// crear usuario administrador por defecto
@Injectable()
export class DefaultUser {
  /*constructor(@Inject('USER_MODEL') private userModel: Model<UserInterface>) {}

  async create() {
    const defaultAdmin = await this.userModel.findOne({ isDefaultAdmin: true });
    if (!defaultAdmin) {
      const adminUser: Userdto = {
        names: 'administrador',
        surnames: 'administrador',
        email: 'administrador@asd.com',
        cell_phone: '23a53',
        password: bcrypt.hashSync('123', 10),
        user: 'admin',
        role: 'ADMIN',
        isDefaultAdmin: true,
        plaque:null,
        vehicle:null,
      };

      const userSave = new this.userModel(adminUser);
      return userSave.save();
    }
  }*/
}
