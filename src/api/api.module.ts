import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { BatchModule } from '../batch/batch.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinNumberEntity } from './entities/winNumber.entity';
import { WinStoreEntity } from './entities/winStore.entity';
import { WinnerInfoEntity } from './entities/winnerInfo.entity';

@Module({
  imports: [
    BatchModule,
    TypeOrmModule.forFeature([
      WinNumberEntity,
      WinStoreEntity,
      WinnerInfoEntity,
    ]),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
