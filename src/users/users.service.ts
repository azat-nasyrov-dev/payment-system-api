import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { MAX_DEBIT_AMOUNT } from './users.constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * General method for transactional execution of operations
   */
  private async executeTransaction<T>(
    operation: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Transaction error:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Write-off of user balance with checks and logging
   */
  public async debitBalance(
    userId: number,
    amount: number,
  ): Promise<{ message: string; newBalance: number }> {
    if (amount <= 0) {
      throw new HttpException('This amount must be greater than 0', HttpStatus.BAD_REQUEST);
    }
    if (amount > MAX_DEBIT_AMOUNT) {
      throw new HttpException(
        `Write-off exceeds limit: ${MAX_DEBIT_AMOUNT}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.executeTransaction(async (queryRunner) => {
      const userRepository = queryRunner.manager.getRepository(UserEntity);
      const transactionRepository = queryRunner.manager.getRepository(TransactionEntity);

      const user = await userRepository.findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      if (user.balance < amount) {
        throw new HttpException('Insufficient funds', HttpStatus.BAD_REQUEST);
      }

      user.balance -= amount;
      await userRepository.save(user);

      const transaction = transactionRepository.create({
        user,
        action: 'debit',
        amount,
      });

      await transactionRepository.save(transaction);
      this.logger.log(
        `User ${userId}'s balance has been reduced by ${amount}$. New balance: ${user.balance}$`,
      );

      return { message: 'The balance was successfully written off', newBalance: user.balance };
    });
  }
}
