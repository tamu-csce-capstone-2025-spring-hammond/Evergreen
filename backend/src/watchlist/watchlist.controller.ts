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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StockWatchlistItemDto, TickerDTO } from './dto/watchlist.dto';
import { ErrorCodes, ErrorMessages } from '../error-codes.enum';
import { error } from 'console';

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
          name: 'SPDR S&P 500 ETF Trust',
        },
        {
          ticker: 'APPL',
          last_price: 300.33,
          day_percent_change: -0.5,
          name: 'Apple Inc',
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

  @Post('')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: "Add a Ticker to Current User's Watchlist" })
  @ApiBody({ type: TickerDTO, description: 'new ticker' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Watchlist updated successfully',
    schema: {
      example: [
        {
          ticker: 'SPY',
          last_price: 30.33,
          day_percent_change: 3,
          name: 'SPDR S&P 500 ETF Trust',
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Max watchlist limit reached',
    schema: {
      example: {
        error: ErrorCodes.MAX_WATCHLIST_LIMIT_REACHED,
        message: ErrorMessages.MAX_WATCHLIST_LIMIT_REACHED,
      },
    },
  })
  @ApiConflictResponse({
    description: 'Ticker already exists in watchlist',
    schema: {
      example: {
        error: ErrorCodes.DUPLICATE_WATCHLIST_TICKER,
        message: ErrorMessages.DUPLICATE_WATCHLIST_TICKER,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Ticker not found',
    schema: {
      example: {
        error: ErrorCodes.TICKER_NOT_FOUND,
        message: ErrorMessages.TICKER_NOT_FOUND,
      },
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
  async addToWatchlist(
    @Request() request: { userid: number },
    @Body() tickerDTO: TickerDTO,
  ) {
    const { userid: userID } = request;
    console.log(`User:${userID}, Ticker:${tickerDTO.ticker}`);
    try {
      return await this.watchlistService.addToWatchList(
        userID,
        tickerDTO.ticker,
      );
    } catch (error) {
      switch (error.message) {
        case ErrorCodes.MAX_WATCHLIST_LIMIT_REACHED:
          return new HttpException(
            {
              error: error.message,
              message: ErrorMessages.MAX_WATCHLIST_LIMIT_REACHED,
            },
            HttpStatus.BAD_REQUEST,
          );
        case ErrorCodes.TICKER_NOT_FOUND:
          return new HttpException(
            { error: error.message, message: ErrorMessages.TICKER_NOT_FOUND },
            HttpStatus.NOT_FOUND,
          );
        case ErrorCodes.DUPLICATE_WATCHLIST_TICKER:
          throw new HttpException(
            {
              error: error.message,
              message: ErrorMessages.DUPLICATE_WATCHLIST_TICKER,
            },
            HttpStatus.CONFLICT,
          );
        case ErrorCodes.EXTERNAL_API_FAILURE:
          throw new HttpException(
            {
              error: error.message,
              message: ErrorMessages.EXTERNAL_API_FAILURE,
            },
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        default:
          return new HttpException(
            { error: 'Failure', message: error.message },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

  @Delete('')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Remove a ticker from the watchlist' })
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'ticker deleted',
  })
  @ApiNotFoundResponse({
    description: 'Ticker not found',
    schema: {
      example: {
        error: ErrorCodes.TICKER_NOT_FOUND,
        message: ErrorMessages.TICKER_NOT_FOUND,
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
  @ApiServiceUnavailableResponse({
    description: 'Alpaca or Polygon is down, not working, or over used',
    schema: {
      example: {
        error: ErrorCodes.EXTERNAL_API_FAILURE,
        message: ErrorMessages.EXTERNAL_API_FAILURE,
      },
    },
  })
  async removeTicker(
    @Request() request: { userid: number },
    @Body() tickerDTO: TickerDTO,
  ) {
    const { userid: userID } = request;
    console.log(`User:${userID}, Ticker:${tickerDTO.ticker}`);
    try {
      await this.watchlistService.deleteWatchListItem(userID, tickerDTO.ticker);
      return null;
    } catch (error) {
      switch (error.message) {
        case ErrorCodes.MAX_WATCHLIST_LIMIT_REACHED:
          return new HttpException(
            {
              error: error.message,
              message: ErrorMessages.MAX_WATCHLIST_LIMIT_REACHED,
            },
            HttpStatus.BAD_REQUEST,
          );
        case ErrorCodes.TICKER_NOT_FOUND:
          return new HttpException(
            { error: error.message, message: ErrorMessages.TICKER_NOT_FOUND },
            HttpStatus.NOT_FOUND,
          );
        case ErrorCodes.EXTERNAL_API_FAILURE:
          throw new HttpException(
            {
              error: error.message,
              message: ErrorMessages.EXTERNAL_API_FAILURE,
            },
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        default:
          return new HttpException(
            { error: 'Failure', message: error.message },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }
}
