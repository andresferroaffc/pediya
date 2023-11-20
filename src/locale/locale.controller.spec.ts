import { Test, TestingModule } from '@nestjs/testing';
import { LocaleController } from './locale.controller';

describe('LocaleController', () => {
  let controller: LocaleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocaleController],
    }).compile();

    controller = module.get<LocaleController>(LocaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
