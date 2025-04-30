import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { WatchlistService } from './watchlist.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StockWatchlistItemDto, TickerDTO } from './dto/watchlist.dto';
import { ErrorCodes, ErrorMessages } from '../error-codes.enum';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get('')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: "Get current User's watchlist" })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Watchlist returned successfully',
    isArray: true,
    schema: {
      example: [
        {
          ticker: 'SPY',
          last_price: 30.33,
          day_percent_change: 3,
          ticker_name: 'SPDR S&P 500 ETF Trust',
        },
        {
          ticker: 'APPL',
          last_price: 300.33,
          day_percent_change: -0.5,
          ticker_name: 'Apple Inc',
        },
      ],
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'Alpaca or Polygon is down, not working, or over used',
    schema: {
      example: {
        error: ErrorCodes.EXTERNAL_API_FAILURE,
        message: ErrorMessages.EXTERNAL_API_FAILURE,
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
  async watchlist(@Request() request: { userid: number }) {
    const { userid: userID } = request;
    try {
      const watchlist = await this.watchlistService.getWatchlist(userID);
      return watchlist;
    } catch (error) {
      if (error.message == ErrorCodes.EXTERNAL_API_FAILURE) {
        throw new HttpException(
          {
            error: error.message,
            message: ErrorMessages.EXTERNAL_API_FAILURE,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        throw error;
      }
    }
  }
}
