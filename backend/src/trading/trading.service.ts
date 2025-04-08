import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { TradeQ } from '@prisma/client';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async setupForTesting() {
    this.prisma.tradeQ.createMany({
      data: [
        {
          portfolio_id: 1,
          ticker: 'T',
          time_added_to_q: new Date(),
          trade_is_buy: true,
          dollar_amount_to_trade: 3000,
        },
        {
          portfolio_id: 1,
          ticker: 'VTI',
          time_added_to_q: new Date(),
          trade_is_buy: true,
          dollar_amount_to_trade: 3000,
        },
        {
          portfolio_id: 1,
          ticker: 'AAPL',
          time_added_to_q: new Date(),
          trade_is_buy: true,
          dollar_amount_to_trade: 3000,
        },
        {
          portfolio_id: 1,
          ticker: 'TSLA',
          time_added_to_q: new Date(),
          trade_is_buy: true,
          dollar_amount_to_trade: 3000,
        },
      ],
    });
  }
  // @Cron(CronExpression.EVERY_MINUTE)
  async handleQueue() {
    this.logger.log('Starting to process trade queue...');
    try {
      let processingComplete = false;

      while (!processingComplete) {
        await this.prisma.$transaction(async (tx) => {
          // Lock the oldest trade with a raw query to simulate "FOR UPDATE SKIP LOCKED"
          const trade = await tx.$queryRaw<TradeQ[]>`
            SELECT *
            FROM trade_q
            ORDER BY time_added_to_q
            LIMIT 1
            FOR UPDATE SKIP LOCKED
          `;

          if (trade.length === 0) {
            this.logger.log('No more trades to process. Queue is empty.');
            processingComplete = true;
            return;
          }

          const selectedTrade = trade[0];
          this.logger.log(`Processing trade: ${JSON.stringify(selectedTrade)}`);

          // Simulate processing (printing it here)

          // Remove it from the queue
          await tx.tradeQ.delete({
            where: { trade_q_id: selectedTrade.trade_q_id },
          });

          this.logger.log(
            `Trade ${selectedTrade.trade_q_id} processed and removed from queue.`,
          );
        });
      }

      this.logger.log('Trade queue processing completed.');
    } catch (error) {
      this.logger.error('Failed to process trade queue', error);
      throw error; // Re-throw to allow caller to handle if needed
    }
  }
}
