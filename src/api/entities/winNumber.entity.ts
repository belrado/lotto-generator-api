import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('winNumber')
export class WinNumberEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  wNo: number;

  @Index({ unique: true })
  @Column()
  drwNo: number;

  @Column({ length: 50 })
  drwNoDate: string;

  @Column()
  drwtNo1: number;

  @Column()
  drwtNo2: number;

  @Column()
  drwtNo3: number;

  @Column()
  drwtNo4: number;

  @Column()
  drwtNo5: number;

  @Column()
  drwtNo6: number;

  @Column()
  bnusNo: number;

  @Column()
  totSellamnt: number;

  @Column()
  firstAccumamnt: number;

  @Column()
  firstWinamnt: number;

  @Column()
  firstPrzwnerCo: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
