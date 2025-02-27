import { Controller, Get } from '@nestjs/common';

@Controller('watchlist')
export class WatchlistController {
  @Get('')
  async watchlist() {
    return '<html><body><h2><strong>This is the watchlist!!!</strong></h2></body></html>';
  }
}
