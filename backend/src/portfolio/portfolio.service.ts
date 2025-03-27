import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(portfolioDto: PortfolioDto) {
    return this.prisma.portfolio.create({
      data: {
        user_id: portfolioDto.userId,
        portfolio_name: portfolioDto.portfolioName,
        target_date: portfolioDto.targetDate,
        cash: portfolioDto.cash,
      },
    });
  }

  async findOne(id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { portfolio_id: id },
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }
    
    return portfolio;
  }

  async findByUserId(userId: number) {
    const portfolios = await this.prisma.portfolio.findMany({
      where: {
        user_id: userId,
      },
    });

    if (!portfolios || portfolios.length === 0) {
      throw new NotFoundException(`No portfolios found for user with ID ${userId}`);
    }

    return portfolios;
  }

  async update(id: number, updatePortfolioDto: UpdatePortfolioDto) {
    return this.prisma.portfolio.update({
      where: { portfolio_id: id },
      data: {
        portfolio_name: updatePortfolioDto.portfolioName,
        target_date: updatePortfolioDto.targetDate,
        cash: updatePortfolioDto.cash,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.portfolio.delete({
      where: { portfolio_id: id },
    });
  }
}
