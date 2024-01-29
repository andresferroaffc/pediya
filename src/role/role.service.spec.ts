import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../shared/entity';

describe('RoleService', () => {
  let service: RoleService;

  const mockRoleRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Servicico de rol', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('Consultar roles', async () => {
      const rolesData: Role[] = [
        { id: 1, name: 'admin', description: 'admin', user: [] },
        { id: 2, name: 'cli', description: 'cliente', user: [] },
      ];
      mockRoleRepository.find.mockResolvedValue(rolesData);

      const result = await service.findAll();

      expect(result).toEqual(rolesData);
      expect(mockRoleRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('Consultar un rol', async () => {
      const data = { name: 'ADMIN' };
      mockRoleRepository.findOneBy.mockResolvedValue(data);

      const result = await service.findOne('ADMIN');

      expect(result).toEqual(data);
      expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({
        name: 'ADMIN',
      });
    });
  });
});
