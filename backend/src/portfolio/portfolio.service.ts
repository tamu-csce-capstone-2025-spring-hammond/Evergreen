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
      },
    });
  }

  async getFullPortfolioInfo(id: number, userId: number) {
    const portfolioData = await this.prisma.portfolio.findUnique({
      where: { portfolio_id: id },
    });

    if (!portfolioData) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    if (portfolioData.user_id != userId) {
      throw new UnauthorizedException(
        "User trying to access portfolio they don't own",
      );
    }
    const holdings = await this.prisma.holdings.findMany({
      where: { portfolio_id: id },
    });

    const graphData = await this.prisma.portfolio_snapshot.findMany({
      where: { portfolio_id: id },
      orderBy: {
        snapshot_time: 'asc',
      },
    });

    const graph: GraphPoint[] = graphData.map((pt) => {
      const point: GraphPoint = {
        snapshot_time: pt.snapshot_time,
        snapshot_value: pt.snapshot_value,
      };
      return point;
    });

    const investments: Investment[] = holdings.map((holding) => {
      const investment: Investment = {
        ticker: holding.ticker,
        name: 'Stock name', //placeholder
        quantity_owned: holding.quantity,
        average_cost_basis: holding.average_cost_basis,
        current_price: holding.average_cost_basis,
        percent_change: Decimal(0),
      };
      return investment;
    });
    // const value = 0.0
    // investments.forEach

    const portfolio: PortfolioType = {
      portfolio_id: portfolioData.portfolio_id,
      portfolio_name: portfolioData.portfolio_name,
      created_at: portfolioData.created_at,
      target_date: portfolioData.target_date,
      uninvested_cash: portfolioData.uninvested_cash,
      current_value: graph[graph.length - 1].snapshot_value,
      percent_change: Decimal(0.015),
      amount_change: Decimal(500),
      investments: investments,
      performance_graph: graph,
    };
    return portfolio;
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
