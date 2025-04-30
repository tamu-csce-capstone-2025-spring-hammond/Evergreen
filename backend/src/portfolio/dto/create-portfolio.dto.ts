import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  Matches,
  IsDate,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PortfolioDto {
  @ApiProperty({
    example: 'Retirement',
    description: 'The name of the portfolio',
    required: true,
  })
  @IsString()
  portfolioName: string;

  @ApiProperty({
    example: '#4CAF50',
    description: 'The color of the portfolio',
    required: true,
  })
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'Color must be a valid hex code (e.g., #RRGGBB or #RGB)',
  })
  color: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: 'The date the portfolio was created',
    required: true,
  })
  @Type(() => Date) // Ensures transformation from string to Date
  @IsDate()
  createdDate: Date;

  @ApiProperty({
    example: '2050-01-01T00:00:00.000Z',
    description: 'The target date of the portfolio',
    required: true,
  })
  @Type(() => Date)
  @IsDate()
  targetDate: Date;

  @ApiProperty({
    example: '1000000',
    description: 'Initial Deposit',
    required: true,
  })
  @IsNumber()
  initial_deposit: number;

  @ApiPropertyOptional({
    example: true,
    description:
      'If portfolio will have a bitcoin focus (if no value is passed it will be assumed to be false)',
  })
  @IsOptional()
  @IsBoolean()
  bitcoin_focus: boolean = false;

  @ApiPropertyOptional({
    example: true,
    description:
      'If portfolio will have a small-cap focus (if no value is passed it will be assumed to be false)',
  })
  @IsOptional()
  @IsBoolean()
  smallcap_focus: boolean = false;

  @ApiPropertyOptional({
    example: true,
    description:
      'If portfolio will have a value focus (if no value is passed it will be assumed to be false)',
  })
  @IsOptional()
  @IsBoolean()
  value_focus: boolean = false;

  @ApiPropertyOptional({
    example: true,
    description:
      'If portfolio will have a momentum focus (if no value is passed it will be assumed to be false)',
  })
  @IsOptional()
  @IsBoolean()
  momentum_focus: boolean = false;

  @ApiProperty({
    example: 3,
    description: 'Risk aptitude of the user (1–5). Required.',
  })
  @IsNumber()
  risk_aptitude: number;
}
