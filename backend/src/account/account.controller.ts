import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('account')
export class AccountController {

    @Get("stats")
    @UseGuards(JwtGuard)
    @ApiOperation({summary: 'Fetch latest account information'})
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'stats returned',
        schema: {
            example: {
                {
                    account_creation_date: '2021-12-31T11:08:42Z',
                    total_account_value: 123456,
                    percent_change,
                }
            }
        }
    })
}
