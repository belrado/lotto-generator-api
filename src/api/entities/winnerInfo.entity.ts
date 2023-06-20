import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('winnerInfo')
export class WinnerInfoEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  wiNo: number;

  @Index()
  @Column({ unsigned: true })
  drwNo: number;

  @Column()
  level: number;

  @Column()
  winUsers: number;

  @Column()
  winTotAmnt: number;

  @Column()
  winAmnt: number;

  @Column({ length: 50 })
  winTypeText: string;
}
