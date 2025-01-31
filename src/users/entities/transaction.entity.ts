import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

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

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  user: UserEntity;
}
