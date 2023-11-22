import { Test, TestingModule } from '@nestjs/testing';
import { CommissionHistoryController } from './commission-history.controller';

describe('CommissionHistoryController', () => {
  let controller: CommissionHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionHistoryController],
    }).compile();

    controller = module.get<CommissionHistoryController>(CommissionHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
