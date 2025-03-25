import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class StockWatchlistItemDto {
  @ApiProperty({
    description: 'Stock ticker symbol',
    example: 'APPL',
    type: 'string',
  })
  ticker: string;

  @ApiProperty({
    description: 'Last traded price of the stock',
    example: 300.33,
    type: 'number',
    format: 'float',
  })
  last_price: number;

  @ApiProperty({
    description: 'Percentage change in stock price for the day',
    example: -0.5,
    type: 'number',
    format: 'float',
  })
  day_percent_change: number;

  @ApiProperty({
    description: 'Full name of the company',
    example: 'Apple Inc',
    type: 'string',
  })
  name: string;
}

export class TickerDTO {
  @ApiProperty({
    description: 'Stock ticker symbol',
    example: 'SPY',
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: 'Ticker is required' })
  @MaxLength(10, { message: 'Ticker provided is too long' })
  @IsString({ message: 'Ticker must be a string' })
  ticker: string;
}
// Example Swagger decorator for the endpoint
