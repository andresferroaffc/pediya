import { Test, TestingModule } from '@nestjs/testing';
import { SendemailService } from './sendemail.service';

describe('SendemailService', () => {
  let service: SendemailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendemailService],
    }).compile();

    service = module.get<SendemailService>(SendemailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
