import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ type: 'decimal' })
  amount: number;

  @CreateDateColumn()
  ts: Date;
}
