import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { ApiService } from './api.service'
import { CreateApiDto } from './dto/create-api.dto'
import { CrawlingManualDto } from './dto/crawling-manual.dto'

@Controller('api/lotto')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post()
  create(@Body() createApiDto: CreateApiDto) {
    return this.apiService.create(createApiDto)
  }

  @Get()
  async findAll() {
    //return { response: 'success' };
    try {
      return await this.apiService.findAll()
    } catch (e) {
      return { error: e }
    }
  }

  @Get('/:drwNo')
  async findOne(@Param('drwNo') drwNo: number) {
    const lotto = await this.apiService.findOne(drwNo)
    if (lotto) {
      return {
        resultCode: '0000',
        result: lotto
      }
    } else {
      return {
        resultCode: '0001',
        message: drwNo + ' 회차 정보가 업데이트 되지않았습니다!!'
      }
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

  /*@Post('/manual')
  async crawling(@Body() dto: CrawlingManualDto): Promise<object> {
    const { drwNo } = dto
    try {
      await this.apiService.lottoWinInfoCrawling(drwNo)
      return { status: 'success1' }
    } catch (e) {
      return { status: 'error', message: e.message }
    }
  }
  @Post('/manual/store')
  async crawlingStore(@Body() dto: CrawlingManualDto): Promise<object> {
    const { drwNo } = dto
    try {
      const storeData = await this.apiService.lottoWinStoreCrawling(drwNo)
      return { status: 'success2', storeData: JSON.stringify(storeData) }
    } catch (e) {
      return { status: 'error', message: e.message }
    }
  }*/
}
