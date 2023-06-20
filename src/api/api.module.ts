import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { BatchModule } from '../batch/batch.module';

@Module({
  imports: [BatchModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
