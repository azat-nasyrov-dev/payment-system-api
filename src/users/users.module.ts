import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { TransactionEntity } from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TransactionEntity])],
})
export class UsersModule {}
