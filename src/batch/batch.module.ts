import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinStoreEntity } from '../api/entities/winStore.entity';
import { WinNumberEntity } from '../api/entities/winNumber.entity';
import { WinnerInfoEntity } from '../api/entities/winnerInfo.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      WinStoreEntity,
      WinNumberEntity,
      WinnerInfoEntity,
    ]),
  ],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
