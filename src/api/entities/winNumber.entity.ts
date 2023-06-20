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
  drwNo1: number;

  @Column()
  drwNo2: number;

  @Column()
  drwNo3: number;

  @Column()
  drwNo4: number;

  @Column()
  drwNo5: number;

  @Column()
  drwNo6: number;

  @Column()
  bonusNo: number;

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
