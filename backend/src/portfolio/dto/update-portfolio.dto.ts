import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
  Matches,
} from 'class-validator';

export class UpdatePortfolioDto {
  @ApiPropertyOptional({
    example: 'Retirement Growth',
    description: 'The updated name of the portfolio',
  })
  @IsOptional()
  @IsString()
  portfolioName?: string;

  @ApiPropertyOptional({
    example: '#FF5733',
    description: 'The updated color of the portfolio',
  })
  @IsOptional()
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'Color must be a valid hex code (e.g., #RRGGBB or #RGB)',
  })
  color?: string;

  @ApiPropertyOptional({
    example: '1-1-2055',
    description: 'The updated target date of the portfolio',
  })
  @IsOptional()
  @Type(() => Date) // Ensures transformation from string to Date
  @IsDate()
  targetDate?: Date;

  @ApiPropertyOptional({
    example: true,
    description: 'If portfolio will have a bitcoin focus',
  })
  @IsOptional()
  @IsBoolean()
  bitcoin_focus?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'If portfolio will have a small-cap focus',
  })
  @IsOptional()
  @IsBoolean()
  smallcap_focus?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'If portfolio will have a value focus',
  })
  @IsOptional()
  @IsBoolean()
  value_focus?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'If portfolio will have a momentum focus',
  })
  @IsOptional()
  @IsBoolean()
  momentum_focus?: boolean;
}
