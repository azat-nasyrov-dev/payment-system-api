import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TransactionDto } from './dto/transaction.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(':id/debit')
  @UsePipes(new ValidationPipe())
  public async debitBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() transactionDto: TransactionDto,
  ): Promise<{ message: string; newBalance: number }> {
    const { amount } = transactionDto;
    return await this.usersService.debitBalance(id, amount);
  }
}
