import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { PrismaService } from '../prisma.service';

@Controller('watchlist')
export class WatchlistController {
  constructor(private prismaService: PrismaService) {}

  @Get('')
  @UseGuards(JwtGuard)
  async watchlist(@Request() request: { userid: number }) {
    const { userid: userID } = request;
    const watchlist = await this.getWatchlist(userID);
    return watchlist.map((element) => element.ticker);
  }

  private async getWatchlist(userID: number) {
    return this.prismaService.watchlist.findMany({
      where: { user_id: userID },
    });
  }
}
