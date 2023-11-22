import { Test, TestingModule } from '@nestjs/testing';
import { CommissionHistoryService } from './commission-history.service';

describe('CommissionHistoryService', () => {
  let service: CommissionHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionHistoryService],
    }).compile();

    service = module.get<CommissionHistoryService>(CommissionHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
