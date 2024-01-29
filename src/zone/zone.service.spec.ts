import { Test, TestingModule } from '@nestjs/testing';
import { ZoneService } from './zone.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Commission, Discount, Zone } from '../shared/entity';
import { TypeCommission, TypeDiscount } from '../common/enum';
import { SelectQueryBuilder } from 'typeorm';

describe('ZoneService', () => {
  let service: ZoneService;

  const mockZoneRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    getMany: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    let mockZoneQueryBuilder: SelectQueryBuilder<Zone>;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZoneService,
        {
          provide: getRepositoryToken(Zone),
          useValue: mockZoneRepository,
        },
        {
          provide: getRepositoryToken(Commission),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Discount),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ZoneService>(ZoneService);
    mockZoneQueryBuilder = mockZoneRepository.createQueryBuilder();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Servicio de zona', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('Consultar zonas', async () => {
      const zonesData: Zone[] = [
        {
          id: 1,
          name: 'comision 78%',
          departament_code: '32',
          city_code: '42',
          description: 'preuba',
          discount_id: {
            id: 1,
            name: 'Descuento cliente del mes',
            percentage: 10,
            description:
              'Descuento al cliente que mas productos ha adquirido en el mes',
            minimum_amount: 100000,
            type: TypeDiscount.PRODUCTO,
            zone: [],
            product: [],
          },
          commission_id: {
            id: 3,
            name: 'comision 58%',
            description: 'preuba',
            percentage: 100,
            minimum_amount: 500.0,
            type: TypeCommission.GENERAL,
            zone: [],
            product: [],
          },
          referral: [],
        },
      ];
      mockZoneRepository.createQueryBuilder.mockReturnValue(
        mockZoneQueryBuilder,
      );
      mockZoneQueryBuilder.getMany.mockResolvedValue(zonesData);

      const result = await service.findAll();

      expect(result).toEqual(zonesData);
      expect(mockZoneRepository.createQueryBuilder).toHaveBeenCalledWith(
        'zone',
      );
      expect(mockZoneQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'zone.commission_id',
        'commission',
      );
      expect(mockZoneQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'zone.discount_id',
        'discount',
      );
      expect(mockZoneQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('Consultar una zona', async () => {
      const data = { id: 1 };
      mockZoneRepository.findOneBy.mockResolvedValue(data);

      const result = await service.findOne(1);

      expect(result).toEqual(data);
      expect(mockZoneRepository.findOneBy).toHaveBeenCalledWith({
        id: 1,
      });
    });
  });
});
