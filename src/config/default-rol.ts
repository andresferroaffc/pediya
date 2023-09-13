import { Injectable } from '@nestjs/common';

// crear rol de administrador por defecto
@Injectable()
export class DefaultRole {
  /*constructor(@Inject('ROLE_MODEL') private roleModel: Model<RoleInterface>) {}
  async create() {
    let role: Roledto[] = [];
    const ROLE_DEFAULT: Roledto[] = [
      {
        name: 'ADMIN',
        code: 'ADMIN',
      },
    ];
    const roles = await this.roleModel.find({
      $or: [{ code: 'ADMIN' }],
    });

    if (roles.length > 0) {
      for (let value of ROLE_DEFAULT) {
        const a = roles.find((fruit) => fruit.code === value.code);
        if (!a) {
          role.push(value);
        }
      }
    } else {
      role = ROLE_DEFAULT;
    }

    if (role.length > 0) {
      role.forEach((data) => {
        const as = new this.roleModel(data);
        return as.save();
      });
    }
  }*/
}
