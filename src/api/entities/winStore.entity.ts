import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('winStore')
export class WinStoreEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  sNo: number;

  @Index()
  @Column({ unsigned: true })
  drwNo: number;

  @Column({ unsigned: true })
  level: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 256 })
  address: string;

  @Column({ enum: ['auto', 'manual'] })
  type: string;

  @Column({ length: 20 })
  latitude: string;

  @Column({ length: 20 })
  longitude: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
