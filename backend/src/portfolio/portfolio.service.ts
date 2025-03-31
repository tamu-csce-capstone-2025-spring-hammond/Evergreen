import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { GraphPoint, Investment, PortfolioType } from './portfolio.types';
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
        uninvested_cash: portfolioDto.cash,
        color: portfolioDto.color,
      },
    });
  }

  async getFullPortfolioInfo(
    id: number,
    userId: number,
  ): Promise<PortfolioType> {
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
    const initial_value =
      graphData.length > 0
        ? new Decimal(graphData[0].snapshot_value)
        : new Decimal(0);
    const amount_change = current_value.minus(initial_value);
    const percent_change = initial_value.gt(0)
      ? amount_change.div(initial_value).times(100)
      : new Decimal(0);

    // Map investments
    const investments: Investment[] = holdings.map(
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
      investments,
      performance_graph,
    };
  }

  async findByUserId(userId: number) {
    const portfolios = await this.prisma.portfolio.findMany({
      where: {
        user_id: userId,
      },
    });

    if (!portfolios || portfolios.length === 0) {
      throw new NotFoundException(
        `No portfolios found for user with ID ${userId}`,
      );
    }

    return portfolios;
  }

  async update(id: number, updatePortfolioDto: UpdatePortfolioDto) {
    return this.prisma.portfolio.update({
      where: { portfolio_id: id },
      data: {
        portfolio_name: updatePortfolioDto.portfolioName,
        target_date: updatePortfolioDto.targetDate,
        uninvested_cash: updatePortfolioDto.cash,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.portfolio.delete({
      where: { portfolio_id: id },
    });
  }
}
