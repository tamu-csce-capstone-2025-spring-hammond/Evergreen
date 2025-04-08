import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('stats')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Fetch latest account information' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'stats returned',
    schema: {
      example: {
        account_creation_date: '2021-12-31T11:08:42Z',
        total_account_value: 123456,
        percent_change: 23.34,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid JWT Token in Bearer Auth Field (it may have expired, be blank, or be otherwise incorrect)',
    schema: {
      example: {
        message: 'Invalid Bearer Token',
        error: 'Unauthorized',
      },
    },
  })
  async getStats(@Request() request: { userid: number }) {
    const { userid: userID } = request;
    return this.accountService.getStats(userID);
  }
}
