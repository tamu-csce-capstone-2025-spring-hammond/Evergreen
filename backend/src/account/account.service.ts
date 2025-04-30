import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PortfolioService } from '../portfolio/portfolio.service';
import { PrismaService } from '../prisma.service';
import { AlpacaService } from '../stock-apis/alpaca.service';
import { Stats } from './account.types';

@Injectable()
export class AccountService {
  private logger = new Logger(AccountService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly alpacaService: AlpacaService,
    private portfolioService: PortfolioService,
  ) {}

  async getStats(userID: number): Promise<Stats> {
    const user = await this.prismaService.users.findUnique({
      where: { user_id: userID },
    });
    const portfolios = await this.portfolioService.findByUserId(userID);
    let totalValue = new Decimal(0);
    let totalDeposit = new Decimal(0);
    portfolios.forEach((portfolio) => {
      totalValue = totalValue.add(portfolio.current_value);
      totalDeposit = totalDeposit.add(portfolio.total_deposited);
    });
    this.logger.debug(totalDeposit);
    this.logger.debug(totalValue);
    const percentChange = totalValue
      .minus(totalDeposit)
      .dividedBy(totalDeposit)
      .times(100);
    return {
      created_date: user.created_at,
      total_account_value: totalValue,
      percent_change: percentChange,
    };
  }
}
