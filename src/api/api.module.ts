import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { BatchModule } from '../batch/batch.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinNumberEntity } from './entities/winNumber.entity';

@Module({
  imports: [BatchModule, TypeOrmModule.forFeature([WinNumberEntity])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
