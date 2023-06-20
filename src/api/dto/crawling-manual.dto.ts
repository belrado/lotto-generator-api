import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CrawlingManualDto {
  @Transform((params) => params.value.trim())
  @IsString()
  drwNo: string;
}
