import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { BatchService } from '../batch/batch.service';
import { InjectRepository } from '@nestjs/typeorm';
import { WinNumberEntity } from './entities/winNumber.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(WinNumberEntity)
    private winNumberRepository: Repository<WinNumberEntity>,
    private batchService: BatchService,
  ) {}

  create(createApiDto: CreateApiDto) {
    return 'This action adds a new api';
  }

  findAll() {
    return `This action returns all api`;
  }

  findOne(id: number) {
    return `This action returns a #${id} api`;
  }

  update(id: number, updateApiDto: UpdateApiDto) {
    return `This action updates a #${id} api`;
  }

  remove(id: number) {
    return `This action removes a #${id} api`;
  }

  /////////////-----------

  async lottoWinInfoCrawling(drwNo: number) {
    const check = await this.winNumberRepository.findOne({
      where: { drwNo },
    });
    if (check) {
      throw new NotFoundException('해당 회차는 이미 등록되어있습니다.');
    }
    //await this.batchService.lottoCrawling(drwNo.toString());
    for (let i = 700; i < 1073; i++) {
      await this.batchService.lottoCrawling(i.toString());
    }
  }
}
