import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { BatchService } from '../batch/batch.service';
import { InjectRepository } from '@nestjs/typeorm';
import { WinNumberEntity } from './entities/winNumber.entity';
import { Repository } from 'typeorm';
import { WinStoreEntity } from './entities/winStore.entity';
import { WinnerInfoEntity } from './entities/winnerInfo.entity';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(WinNumberEntity)
    private winNumberRepository: Repository<WinNumberEntity>,
    @InjectRepository(WinStoreEntity)
    private winStoreRepository: Repository<WinStoreEntity>,
    @InjectRepository(WinnerInfoEntity)
    private winnerInfoRepository: Repository<WinnerInfoEntity>,
    private batchService: BatchService,
  ) {}

  create(createApiDto: CreateApiDto) {
    return 'This action adds a new api';
  }

  async findAll() {
    const allNumber = await this.winNumberRepository.find();
    const allStore = await this.winStoreRepository.find();
    const allInfo = await this.winnerInfoRepository.find();
    const allData = {
      number: allNumber,
      store: allStore,
      info: allInfo,
    };
    return allData;

    return `This action returns all api`;
  }

  async findOne(drwNo: number) {
    return await this.winNumberRepository.findOne({
      where: { drwNo },
    });
  }

  update(id: number, updateApiDto: UpdateApiDto) {
    return `This action updates a #${id} api`;
  }

  remove(id: number) {
    return `This action removes a #${id} api`;
  }

  /////////////-----------

  async lottoWinInfoCrawling(drwNo: number) {
    const check = this.findOne(drwNo);
    if (check) {
      throw new NotFoundException('해당 회차는 이미 등록되어있습니다?.');
    }
    await this.batchService.lottoCrawling(drwNo.toString());
  }
}
