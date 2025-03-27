import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class PortfolioDto {
    @ApiProperty({
        example: '1',
        description: 'The id of the portfolio',
        required: true,
    })
    portfolioId: number;

    @ApiProperty({
        example: '1',
        description: 'The id of the user',
        required: true,
    })
    userId: number;

    @ApiProperty({
        example: 'Retirement',
        description: 'The name of the portfolio',
        required: true,
    })
    portfolioName: string;

    @ApiProperty({
        example: '#4CAF50',
        description: 'The color of the portfolio',
        required: true,
    })
    color: string;

    @ApiProperty({
        example: '1-1-2025',
        description: 'The date the portfolio was created',
        required: true,
    })
    createdDate: Date;

    @ApiProperty({
        example: '1-1-2050',
        description: 'The target date of the portfolio',
        required: true,
    })
    targetDate: Date;

    @ApiProperty({
        example: '1,000,000',
        description: 'The amount of cash inside the portfolio',
        required: true,
    })
    cash: number;
}
