import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class TransactionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  readonly amount: number;
}
