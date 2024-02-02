import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import axios from 'axios';
import { StoreRowStatus, WinNumberInfoStatus, WinNumberStatus } from './type';
import { InjectRepository } from '@nestjs/typeorm';
import { WinNumberEntity } from '../api/entities/winNumber.entity';
import { DataSource, Repository } from 'typeorm';
import { WinnerInfoEntity } from '../api/entities/winnerInfo.entity';
import { WinStoreEntity } from '../api/entities/winStore.entity';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(WinNumberEntity)
    private winNumberRepository: Repository<WinNumberEntity>,
    @InjectRepository(WinnerInfoEntity)
    private winnerInfoRepository: Repository<WinnerInfoEntity>,
    @InjectRepository(WinStoreEntity)
    private winStoreRepository: Repository<WinStoreEntity>,
    private dataSource: DataSource,
  ) {}

  private readonly logger = new Logger(BatchService.name);

  @Cron('0 */40 20-21 * * 6')
  async handleCron() {
    const dbLastData: WinNumberEntity[] = await this.winNumberRepository.find({
      select: { drwNo: true },
      order: { drwNo: 'desc' },
      take: 1,
    });
    const lastDrwNo = await this.getLottoLastDrwNo();
    for (let i = dbLastData[0].drwNo + 1; i <= lastDrwNo; i++) {
      await this.lottoCrawling(i.toString());
    }
  }

  private async puppeteerInit(url: string, browser): Promise<string> {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle2',
    });

    return await page.content();
  }

  private storeDataInit(elem: cheerio.Cheerio, $: cheerio.Root, key: string[]) {
    const storeData: object[] = [];

    elem.each(function () {
      const line = $(this).find('td');
      const row: StoreRowStatus = {
        name: '',
        type: '',
        address: '',
      };
      for (let i = 0; i < key.length; i++) {
        if (key[i] === 'continue') continue;
        row[key[i]] = line.eq(i).text().trim();
      }
      storeData.push(row);
    });

    return storeData;
  }

  private async insertInNumber(winNumber, queryRunner) {
    return await this.winNumberRepository
      .createQueryBuilder('winNumber', queryRunner)
      .insert()
      .into(WinNumberEntity)
      .values([winNumber])
      .execute();
  }

  private async inertWinnerInfo(winNumberInfo, queryRunner) {
    return await this.winnerInfoRepository
      .createQueryBuilder('winnerInfo', queryRunner)
      .insert()
      .into(WinnerInfoEntity)
      .values([...winNumberInfo])
      .execute();
  }

  private async insertWinStore(winStore, queryRunner) {
    return await this.winnerInfoRepository
      .createQueryBuilder('winStore', queryRunner)
      .insert()
      .into(WinStoreEntity)
      .values([...winStore])
      .execute();
  }

  private async getLottoLastDrwNo() {
    const url = `https://dhlottery.co.kr/gameResult.do?method=byWin`;
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: 'networkidle2',
      });

      const content = await page.content();
      const $ = cheerio.load(content);
      const drwNo = $('.content_winnum_645 > .win_result > h4 > strong');
      await browser.close();

      return parseInt(drwNo.text());
    } catch (e) {
      console.log('error', e);
    }
  }

  async lottoCrawling(drwNo: string) {
    const data = await axios.get(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`,
    );

    if (data.data && data.data.returnValue === 'success') {
      const winNumber = data.data;

      console.log(`= ${drwNo} = start Crawling =====================`);

      const url = `https://dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${drwNo}`;

      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.goto(url, {
          waitUntil: 'networkidle2',
        });

        const content = await page.content();
        const $ = cheerio.load(content);

        const lists = $('.content_winnum_645 > table > tbody > tr');

        const winNumberInfo: object[] = [];

        lists.each(function () {
          const line = $(this).find('td');
          const row: WinNumberInfoStatus = {
            drwNo: drwNo,
            level: '',
            winUsers: '',
            winTotAmnt: '',
            winAmnt: '',
            winTypeText: '',
          };
          const key: string[] = [
            'level',
            'winTotAmnt',
            'winUsers',
            'winAmnt',
            'continue',
            'winTypeText',
          ];

          for (let i = 0; i < key.length; i++) {
            if (key[i] === 'continue') continue;
            if (key[i] === 'winTypeText') {
              row[key[i]] = line
                .eq(i)
                .text()
                .replace(/\s/gi, '')
                .replace(/1등/gi, '');
            } else {
              row[key[i]] = line
                .eq(i)
                .text()
                .replace(/\s/gi, '')
                .replace(/,|원|등/gi, '');
            }
          }

          winNumberInfo.push(row);
        });

        await browser.close();

        const winStore = await this.storeCrawling(drwNo);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          await this.insertInNumber(winNumber, queryRunner);
          await this.inertWinnerInfo(winNumberInfo, queryRunner);
          if (winStore.length > 0) {
            await this.insertWinStore(winStore, queryRunner);
          }

          await queryRunner.commitTransaction();
          console.log('data insert success');
        } catch (e) {
          console.log(e);
          await queryRunner.rollbackTransaction();
          console.log('data insert error rollback');
        } finally {
          await queryRunner.release();
          console.log(`= ${drwNo} = end Crawling =====================`);
        }
      } catch (e) {
        console.log('error', e);
      }
    } else {
      throw new NotFoundException('회차정보를 불러오지 못했습니다.');
    }
  }

  async storeCrawling(drwNo: string): Promise<object[]> {
    const crawlingUrl = `https://dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&drwNo=${drwNo}`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(crawlingUrl, {
      waitUntil: 'networkidle2',
    });

    const content = await page.content();

    const $ = cheerio.load(content);

    const first = $('.group_content').eq(0).find('table > tbody > tr');
    const firstStore: object[] = [];
    firstStore.push(
      ...this.storeDataInit(first, $, ['continue', 'name', 'type', 'address']),
    );

    const second = $('.group_content').eq(1).find('table > tbody > tr');
    const secondStore: object[] = [];
    secondStore.push(
      ...this.storeDataInit(second, $, ['continue', 'name', 'address']),
    );

    const pageListNum = $('#page_box > a').length;

    await browser.close();

    if (pageListNum > 1) {
      for (let i = 1; i <= pageListNum; i++) {
        const more = await this.secondStoreMoreCrawling(drwNo, i.toString());
        secondStore.push(...more);
      }
    }

    const clearFirstStore = firstStore.filter(
      (v: StoreRowStatus) => v.name !== '',
    );
    const newFirst = clearFirstStore.map((v: StoreRowStatus) => ({
      drwNo: drwNo,
      level: 1,
      name: v.name,
      address: v.address,
      type: v.type,
      latitude: '',
      longitude: '',
    }));
    const clearSecondStore = secondStore.filter(
      (v: StoreRowStatus) => v.name !== '',
    );
    const newSecond = clearSecondStore.map((v: StoreRowStatus) => ({
      drwNo: drwNo,
      level: 2,
      name: v.name,
      address: v.address,
      type: v.type,
      latitude: '',
      longitude: '',
    }));

    return newFirst.concat(newSecond);
  }

  async secondStoreMoreCrawling(
    drwNo: string,
    pageNo: string,
  ): Promise<object[]> {
    const crawlingUrl = `https://dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&drwNo=${drwNo}&nowPage=${pageNo}`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(crawlingUrl, {
      waitUntil: 'networkidle2',
    });

    const content = await page.content();

    const $ = cheerio.load(content);

    const lists = $('.group_content').eq(1).find('table > tbody > tr');

    const secondStore: object[] = [];
    secondStore.push(
      ...this.storeDataInit(lists, $, ['continue', 'name', 'address']),
    );

    await browser.close();

    return secondStore;
  }
}
