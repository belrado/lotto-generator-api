import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import axios from 'axios';
import { StoreRowStatus, WinNumberInfoStatus, WinNumberStatus } from './type';
import { InjectRepository } from '@nestjs/typeorm';
import { WinNumberEntity } from '../api/entities/winNumber.entity';
import { Repository } from 'typeorm';
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
  ) {}

  private readonly logger = new Logger(BatchService.name);

  @Cron('45 * * * * *')
  async handleCron() {
    //await this.lottoCrawling();
  }

  private async puppeteerInit(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: false,
    });

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

  async lottoCrawling(drwNo: string) {
    const data = await axios.get(
      'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=' +
        drwNo,
    );

    if (data.data && data.data.returnValue === 'success') {
      const winNumber: WinNumberStatus = data.data;

      const url = `https://dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${drwNo}`;

      const content = await this.puppeteerInit(url);
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
          'winUsers',
          'winTotAmnt',
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

      console.log(winNumber, winNumberInfo);

      await this.storeCrawling(drwNo);
    }
  }

  async storeCrawling(drwNo: string) {
    const crawlingUrl = `https://dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&drwNo=${drwNo}`;
    const content = await this.puppeteerInit(crawlingUrl);
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
    if (pageListNum > 1) {
      for (let i = 1; i <= pageListNum; i++) {
        const more = await this.secondStoreMoreCrawling(drwNo, i.toString());
        secondStore.push(...more);
      }
    }

    console.log('1등 상점', firstStore);
    console.log('2등 상점', secondStore);
  }

  async secondStoreMoreCrawling(
    drwNo: string,
    pageNo: string,
  ): Promise<object[]> {
    const crawlingUrl = `https://dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&drwNo=${drwNo}&nowPage=${pageNo}`;
    const content = await this.puppeteerInit(crawlingUrl);
    const $ = cheerio.load(content);

    const lists = $('.group_content').eq(1).find('table > tbody > tr');

    const secondStore: object[] = [];
    secondStore.push(
      ...this.storeDataInit(lists, $, ['continue', 'name', 'address']),
    );

    return secondStore;
  }
}
