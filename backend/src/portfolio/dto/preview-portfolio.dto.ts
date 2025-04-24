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

export class PortfolioPreviewDto {
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
  value: number;

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
