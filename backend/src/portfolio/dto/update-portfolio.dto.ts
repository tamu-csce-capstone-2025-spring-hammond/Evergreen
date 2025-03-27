import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsDate } from 'class-validator';
import { PortfolioDto } from './create-portfolio.dto';

export class UpdatePortfolioDto extends PartialType(PortfolioDto) {
    @ApiPropertyOptional({
        example: 'Retirement Growth',
        description: 'The updated name of the portfolio',
    })
    @IsOptional()
    @IsString()
    portfolioName?: string;

    @ApiPropertyOptional({
        example: '1-1-2055',
        description: 'The updated target date of the portfolio',
    })
    @IsOptional()
    @IsDate()
    targetDate?: Date;

    @ApiPropertyOptional({
        example: 1500000,
        description: 'The updated amount of cash inside the portfolio',
    })
    @IsOptional()
    @IsNumber()
    cash?: number;
}
