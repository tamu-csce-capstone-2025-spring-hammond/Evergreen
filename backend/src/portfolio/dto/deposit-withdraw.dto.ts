import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DepositDto {
  @ApiProperty({
    example: '5000',
    description: 'Amount of money to deposit',
    required: true,
  })
  @IsNumber()
  depositAmount: number;
}

export class WithdrawDto {
  @ApiProperty({
    example: '5000',
    description:
      'Amount of money to withdraw (must be less than total balance)',
    required: true,
  })
  @IsNumber()
  withdrawAmount: number;
}
