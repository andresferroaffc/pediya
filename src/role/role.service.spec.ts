import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../shared/entity';

describe('RoleService', () => {
  let service: RoleService;

  const mockRoleRepository = {
    find: jest
      .fn()
      .mockImplementation(() => Promise.resolve([{ id: Date.now(), ...Role }])),
    findOneBy: jest
      .fn()
      .mockImplementation(() => ({ id: Date.now(), ...Role })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
      controllers: [RoleController],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('Servicico de rol', () => {
    expect(service).toBeDefined();
  });

  it('Consultar roles', async () => {
    expect(await service.findAll()).toEqual([
      {
        id: expect.any(Number),
        ...Role,
      },
    ]);
  });

  it('Consultar un rol', async () => {
    expect(await service.findOne('ADMIN')).toEqual({
      id: expect.any(Number),
      ...Role,
    });
  });
});
