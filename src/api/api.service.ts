import { Injectable } from '@nestjs/common';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { BatchService } from '../batch/batch.service';

@Injectable()
export class ApiService {
  constructor(private batchService: BatchService) {}

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

  async lottoWinInfoCrawling(drwNo: string) {
    try {
      //await this.batchService.lottoCrawling(drwNo);
      for (let i = 100; i < 200; i++) {
        await this.batchService.lottoCrawling(i.toString());
      }
    } catch (e) {}
  }
}
