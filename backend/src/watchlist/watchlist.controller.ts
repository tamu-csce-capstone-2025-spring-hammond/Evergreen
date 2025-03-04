import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { PrismaService } from '../prisma.service';
import { WatchlistService } from './watchlist.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StockWatchlistItemDto, TickerDTO } from './dto/watchlist.dto';

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
    // type: StockWatchlistItemDto,
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
          name: 'Apple',
        },
      ],
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
    const watchlist = await this.watchlistService.getWatchlist(userID);
    return watchlist;
  }

  @Post('')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: "Add a Ticker to Current User's Watchlist" })
  @ApiBody({ type: TickerDTO, description: 'new ticker' })
  @ApiBearerAuth()
  // @ApiResponse({
  //   status: 200,
  //   description: 'Watchlist returned successfully',
  //   // type: StockWatchlistItemDto,
  //   isArray: true,
  //   schema: {
  //     example: [
  //       {
  //         ticker: 'SPY',
  //         last_price: 30.33,
  //         day_percent_change: 3,
  //         name: 'SPDR S&P 500 ETF Trust',
  //       },
  //       {
  //         ticker: 'APPL',
  //         last_price: 300.33,
  //         day_percent_change: -0.5,
  //         name: 'Apple',
  //       },
  //     ],
  //   },
  // })
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
    console.log(`User:${userID}, Ticker:${tickerDTO.ticker}`)
    const watchlist = await this.watchlistService.getWatchlist(userID);
    return watchlist;
  }
}
