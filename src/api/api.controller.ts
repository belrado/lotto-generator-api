import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateApiDto } from './dto/create-api.dto';
import { CrawlingManualDto } from './dto/crawling-manual.dto';
import axios from 'axios';

@Controller('api/lotto')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post()
  create(@Body() createApiDto: CreateApiDto) {
    return this.apiService.create(createApiDto);
  }

  @Get()
  async findAll() {
    //return { response: 'success' };
    try {
      return await this.apiService.findAll();
    } catch (e) {
      return { error: e };
    }
  }

  @Get('/:drwNo')
  async findOne(@Param('drwNo') drwNo: number) {
    console.log(drwNo);
    const lotto = await this.apiService.findOne(drwNo);
    if (lotto) {
      return lotto;
    } else {
      return {
        status: 'error',
        message: drwNo + ' 회차 정보가 업데이트 되지않았습니다.',
      };
    }
  }
  /*
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.apiService.findOne(+id);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() updateApiDto: UpdateApiDto) {
    return this.apiService.update(+id, updateApiDto);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.apiService.remove(+id);
  }*/

  @Post('/manual')
  async crawling(@Body() dto: CrawlingManualDto): Promise<object> {
    const { drwNo } = dto;
    try {
      await this.apiService.lottoWinInfoCrawling(drwNo);
      return { status: 'success' };
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }
}
