import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, IsNumber } from 'class-validator';



export class PortfolioDto {
    // @ApiProperty({
    //     example: '1',
    //     description: 'The id of the portfolio',
    //     required: true,
    // })
    // portfolioId?: number;

    @ApiProperty({
        example: '1',
        description: 'The id of the user',
        required: true,
    })
    user_id: number;

    @ApiProperty({
        example: 'Retirement',
        description: 'The name of the portfolio',
        required: true,
    })
    portfolio_name: string;

    @ApiProperty({
        example: '#4CAF50',
        description: 'The color of the portfolio',
        required: true,
    })
    color: string;

    @ApiProperty({
        example: '2050-01-20',
        description: 'The target date of the portfolio',
        required: true,
    })
    @Transform(({ value }) => new Date(value))
    target_date: Date;

    @ApiProperty({
        example: 3,
        description: 'The amount of risk the user is willing to take for this portfolio',
        required: true,
    })
    risk_aptitude: number;

    @ApiProperty({
        example: 1000000,
        description: 'The amount of cash inside the portfolio',
        required: true,
    })
    cash: number;

    @ApiProperty({
        example: 1000000,
        description: 'The amount of cash inside the portfolio that was deposited',
        required: true,
    })
    deposited_cash: number;
}
