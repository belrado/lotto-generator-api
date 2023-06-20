import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { BatchModule } from './batch/batch.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mysqlConfig from './common/config/mysql.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinStoreEntity } from './api/entities/winStore.entity';
import { WinNumberEntity } from './api/entities/winNumber.entity';
import { WinnerInfoEntity } from './api/entities/winnerInfo.entity';

@Module({
  imports: [
    ApiModule,
    BatchModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.production.env'
          : '.development.env',
      load: [mysqlConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(mysqlConfig)],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('mysql.host'),
        port: +config.get<string>('mysql.port'),
        username: config.get<string>('mysql.username'),
        password: config.get<string>('mysql.password'),
        database: config.get<string>('mysql.database'),
        entities: [WinStoreEntity, WinNumberEntity, WinnerInfoEntity],
        synchronize: false,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
