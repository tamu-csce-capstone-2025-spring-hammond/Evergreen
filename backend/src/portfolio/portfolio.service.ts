import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import {
  GraphPoint,
  InvestmentOutput,
  PortfolioSummary,
  PortfolioOutput,
} from './portfolio.types';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(portfolioDto: PortfolioDto, userId: number) {
    return this.prisma.portfolio.create({
      data: {
        user_id: userId,
        portfolio_name: portfolioDto.portfolioName,
        target_date: portfolioDto.targetDate,
        created_at: portfolioDto.createdDate,
        total_deposited: portfolioDto.inital_deposit,
        uninvested_cash: portfolioDto.inital_deposit,
        color: portfolioDto.color,
        bitcoin_focus: portfolioDto.bitcoin_focus ?? false,
        smallcap_focus: portfolioDto.smallcap_focus ?? false,
        value_focus: portfolioDto.value_focus ?? false,
        momentum_focus: portfolioDto.momentum_focus ?? false,
      },
    });
  }

  async getFullPortfolioInfo(
    id: number,
    userId: number,
  ): Promise<PortfolioOutput> {
    const portfolioData = await this.prisma.portfolio.findUnique({
      where: { portfolio_id: id },
    });

    if (!portfolioData || portfolioData.user_id !== userId) {
      throw portfolioData
        ? new UnauthorizedException(
            "User trying to access portfolio they don't own",
          )
        : new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    // Run queries concurrently for efficiency
    const [holdings, graphData] = await Promise.all([
      this.prisma.holdings.findMany({ where: { portfolio_id: id } }),
      this.prisma.portfolioSnapshot.findMany({
        where: { portfolio_id: id },
        orderBy: { snapshot_time: 'asc' },
      }),
    ]);

    // Map graph data
    const performance_graph: GraphPoint[] = graphData.map(
      ({ snapshot_time, snapshot_value }) => ({
        snapshot_time,
        snapshot_value,
      }),
    );

    // Calculate current portfolio value
    const current_value =
      graphData.length > 0
        ? new Decimal(graphData[graphData.length - 1].snapshot_value)
        : new Decimal(0);
    const initial_value = portfolioData.total_deposited;
    const amount_change = current_value.minus(initial_value);
    const percent_change = initial_value.gt(0)
      ? amount_change.div(initial_value).times(100)
      : new Decimal(0);

    // Map investments
    const investments: InvestmentOutput[] = holdings.map(
      ({ ticker, quantity, average_cost_basis }) => ({
        ticker,
        name: 'Stock name', // Placeholder
        quantity_owned: quantity,
        average_cost_basis,
        current_price: average_cost_basis, // Placeholder
        percent_change: new Decimal(0), // Placeholder
      }),
    );

    // Construct the PortfolioType object
    return {
      portfolio_id: portfolioData.portfolio_id,
      portfolio_name: portfolioData.portfolio_name,
      created_at: portfolioData.created_at,
      target_date: portfolioData.target_date,
      uninvested_cash: portfolioData.uninvested_cash,
      current_value,
      percent_change,
      amount_change,
      bitcoin_focus: portfolioData.bitcoin_focus,
      smallcap_focus: portfolioData.smallcap_focus,
      value_focus: portfolioData.value_focus,
      momentum_focus: portfolioData.momentum_focus,
      investments,
      performance_graph,
    };
  }

  async findByUserId(userId: number): Promise<PortfolioSummary[]> {
    const portfolios = await this.prisma.portfolio.findMany({
      where: { user_id: userId },
    });

    if (portfolios.length === 0) {
      throw new NotFoundException(`No portfolios found for user ID ${userId}`);
    }

    return portfolios.map(
      ({
        portfolio_id,
        portfolio_name,
        created_at,
        target_date,
        bitcoin_focus,
        smallcap_focus,
        value_focus,
        momentum_focus,
      }) => ({
        portfolio_id,
        portfolio_name,
        created_at,
        target_date,
        bitcoin_focus,
        smallcap_focus,
        value_focus,
        momentum_focus,
      }),
    );
  }

  async update(
    id: number,
    updatePortfolioDto: UpdatePortfolioDto,
    userId: number,
  ) {
    return this.prisma.portfolio.update({
      where: { portfolio_id: id, user_id: userId },
      data: {
        portfolio_name: updatePortfolioDto.portfolioName,
        color: updatePortfolioDto.color,
        target_date: updatePortfolioDto.targetDate,
        bitcoin_focus: updatePortfolioDto.bitcoin_focus,
        smallcap_focus: updatePortfolioDto.smallcap_focus,
        value_focus: updatePortfolioDto.value_focus,
        momentum_focus: updatePortfolioDto.momentum_focus,
      },
    });
  }

  async deposit(userId: number, portfolioId: number, depositAmount: number) {
    // Validate input
    if (depositAmount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedPortfolio = await tx.portfolio.update({
          where: {
            portfolio_id: portfolioId,
            user_id: userId,
          },
          data: {
            total_deposited: { increment: depositAmount },
            uninvested_cash: { increment: depositAmount },
          },
          select: {
            portfolio_id: true,
            portfolio_name: true,
            total_deposited: true,
            uninvested_cash: true,
          },
        });

        return updatedPortfolio;
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Portfolio not found or does not belong to user',
        );
      }
      throw error;
    }
  }

  async withdraw(userId: number, portfolioId: number, withdrawAmount: number) {
    // Validate input
    if (withdrawAmount <= 0) {
      throw new BadRequestException('Withdraw amount must be positive');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // First, get the current portfolio to check available cash
        const portfolio = await tx.portfolio.findUnique({
          where: {
            portfolio_id: portfolioId,
            user_id: userId,
          },
          select: {
            uninvested_cash: true,
          },
        });

        // Ensure the portfolio exists
        if (!portfolio) {
          throw new NotFoundException(
            'Portfolio not found or does not belong to user',
          );
        }

        // Check if there's enough uninvested cash
        if (portfolio.uninvested_cash.lessThan(withdrawAmount)) {
          throw new BadRequestException(
            `Insufficient funds. Available: ${portfolio.uninvested_cash}, Requested: ${withdrawAmount}`,
          );
        }
        const updatedPortfolio = await tx.portfolio.update({
          where: {
            portfolio_id: portfolioId,
            user_id: userId,
          },
          data: {
            uninvested_cash: { decrement: withdrawAmount },
            total_deposited: { decrement: withdrawAmount },
          },
          select: {
            portfolio_id: true,
            portfolio_name: true,
            uninvested_cash: true,
          },
        });

        return updatedPortfolio;
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Portfolio not found or does not belong to user',
        );
      }
      throw error;
    }
  }

  async remove(id: number, userID: number) {
    return this.prisma.portfolio.delete({
      where: { portfolio_id: id, user_id: userID },
    });
  }
}
