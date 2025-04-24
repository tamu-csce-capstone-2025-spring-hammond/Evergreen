import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import {
  GraphPoint,
  investmentAllocation,
  InvestmentOutput,
  PortfolioOutput,
} from './portfolio.types';
import { Decimal } from '@prisma/client/runtime/library';
import { AlpacaService } from '../stock-apis/alpaca.service';
import { Prisma } from '@prisma/client';
import { PortfolioPreviewDto } from './dto/preview-portfolio.dto';
import { PortfolioAllocation } from 'src/stock-apis/alpaca-types';
import { differenceInDays } from 'date-fns'; // date-fns is great for this kind of manipulation

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prisma: PrismaService,
    private alpacaService: AlpacaService,
  ) {}

  async create(portfolioDto: PortfolioDto, userId: number) {
    const previewDTO: PortfolioPreviewDto = {
      targetDate: portfolioDto.targetDate,
      value: portfolioDto.initial_deposit,
      bitcoin_focus: portfolioDto.bitcoin_focus,
      smallcap_focus: portfolioDto.smallcap_focus,
      value_focus: portfolioDto.value_focus,
      momentum_focus: portfolioDto.momentum_focus,
      risk_aptitude: portfolioDto.risk_aptitude,
    };
    const allocations = await this.getAllocations(previewDTO);
    const portfolioAllocations: PortfolioAllocation[] = allocations.map((a) => {
      return {
        ticker: a.ticker,
        percent: a.percent_of_portfolio,
      };
    });
    const sim = await this.alpacaService.tradeSim(
      portfolioAllocations,
      Decimal(portfolioDto.initial_deposit),
    );
    return this.prisma.portfolio.create({
      data: {
        user_id: userId,
        portfolio_name: portfolioDto.portfolioName,
        target_date: portfolioDto.targetDate,
        created_at: portfolioDto.createdDate,
        total_deposited: portfolioDto.initial_deposit,
        uninvested_cash: 0,
        color: portfolioDto.color,
        bitcoin_focus: portfolioDto.bitcoin_focus ?? false,
        smallcap_focus: portfolioDto.smallcap_focus ?? false,
        value_focus: portfolioDto.value_focus ?? false,
        momentum_focus: portfolioDto.momentum_focus ?? false,
        risk_aptitude: portfolioDto.risk_aptitude,
        holdings: {
          create: sim.investments,
        },
      },
    });
  }

  async reallocate(
    id: number,
    userId: number,
    newPortfolioValue: Decimal = null,
  ) {
    const portfolioData = await this.prisma.portfolio.findUnique({
      where: { portfolio_id: id, user_id: userId },
    });

    if (!portfolioData || portfolioData.user_id !== userId) {
      throw portfolioData
        ? new UnauthorizedException(
            "User trying to access portfolio they don't own",
          )
        : new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    const holdings = await this.prisma.holdings.findMany({
      where: { portfolio_id: id },
    });

    const holdingsSnapshot = holdings.map((holding) => ({
      ticker: holding.ticker,
      quantity: holding.quantity.toNumber(),
    }));

    let portfolioValue: Decimal = newPortfolioValue;
    if (!newPortfolioValue) {
      if (holdings.length > 0) {
        const portfolioInfo =
          await this.alpacaService.getCurrentPortfolioInfo(holdingsSnapshot);
        portfolioValue = Decimal(portfolioInfo.total_portfolio_value).add(
          portfolioData.uninvested_cash,
        );
      } else {
        portfolioValue = Decimal(portfolioData.uninvested_cash);
      }
    }

    const previewDTO: PortfolioPreviewDto = {
      targetDate: portfolioData.target_date,
      value: portfolioValue.toNumber(),
      bitcoin_focus: portfolioData.bitcoin_focus,
      smallcap_focus: portfolioData.smallcap_focus,
      value_focus: portfolioData.value_focus,
      momentum_focus: portfolioData.momentum_focus,
      risk_aptitude: portfolioData.risk_aptitude,
    };
    const allocations = await this.getAllocations(previewDTO);
    const portfolioAllocations: PortfolioAllocation[] = allocations.map((a) => {
      return {
        ticker: a.ticker,
        percent: a.percent_of_portfolio,
      };
    });

    const sim = await this.alpacaService.tradeSim(
      portfolioAllocations,
      portfolioValue,
    );

    const holdingsValues = sim.investments.map((i) => ({
      portfolio_id: portfolioData.portfolio_id,
      ticker: i.ticker,
      ticker_name: i.ticker_name,
      quantity: i.quantity.toDecimalPlaces(5),
      average_cost_basis: i.average_cost_basis.toDecimalPlaces(3),
      last_updated: i.last_updated,
    }));

    await Promise.all([
      this.prisma.holdings.deleteMany({
        where: { portfolio_id: portfolioData.portfolio_id },
      }),
      // console.log(JSON.stringify(holdingsValues, null, 2)),
      this.prisma.holdings.createMany({
        data: holdingsValues,
      }),
      await this.prisma.portfolio.update({
        where: {
          portfolio_id: id,
          user_id: userId,
        },
        data: {
          uninvested_cash: 0,
        },
      }),
    ]);
  }

  async getFullPortfolioInfo(
    id: number,
    userId: number,
  ): Promise<PortfolioOutput> {
    const portfolioData = await this.prisma.portfolio.findUnique({
      where: { portfolio_id: id, user_id: userId },
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
    let investments: InvestmentOutput[] = [];
    if (holdings.length > 0) {
      const snapshotTime = new Date();

      const holdingsSnapshot = holdings.map((holding) => ({
        ticker: holding.ticker,
        quantity: holding.quantity.toNumber(),
      }));

      const portfolioInfo =
        await this.alpacaService.getCurrentPortfolioInfo(holdingsSnapshot);

      performance_graph.push({
        snapshot_time: snapshotTime,
        snapshot_value: new Decimal(portfolioInfo.total_portfolio_value),
      });

      investments = holdings.map(
        ({ ticker, ticker_name, quantity, average_cost_basis }) => {
          const current_price = new Decimal(portfolioInfo.holdings[ticker]);
          const cost_basis = new Decimal(average_cost_basis);

          const percent_change = current_price
            .minus(cost_basis)
            .dividedBy(cost_basis)
            .times(100);

          return {
            ticker,
            name: ticker_name,
            quantity_owned: quantity,
            average_cost_basis,
            current_price,
            percent_change,
          };
        },
      );
    }

    // Calculate current portfolio value
    const current_value = await this.getPortfolioValue(
      portfolioData.portfolio_id,
    );
    const initial_value = portfolioData.total_deposited;
    const amount_change = current_value.minus(initial_value);
    const percent_change = initial_value.gt(0)
      ? amount_change.div(initial_value).times(100)
      : new Decimal(0);

    // Construct the PortfolioType object
    return {
      portfolio_id: portfolioData.portfolio_id,
      portfolio_name: portfolioData.portfolio_name,
      created_at: portfolioData.created_at,
      target_date: portfolioData.target_date,
      uninvested_cash: portfolioData.uninvested_cash,
      current_value: current_value.toDecimalPlaces(2),
      percent_change,
      amount_change,
      bitcoin_focus: portfolioData.bitcoin_focus,
      smallcap_focus: portfolioData.smallcap_focus,
      value_focus: portfolioData.value_focus,
      momentum_focus: portfolioData.momentum_focus,
      investments,
      performance_graph,
      color: portfolioData.color,
      total_deposited: portfolioData.total_deposited,
    };
  }

  async findByUserId(userId: number): Promise<PortfolioOutput[]> {
    const portfolios = await this.prisma.portfolio.findMany({
      where: { user_id: userId },
      orderBy: {
        portfolio_id: 'asc',
      },
    });

    if (portfolios.length == 0) {
      throw new NotFoundException(`No portfolios found for the given user ID.`);
    }

    const portfolioInfo = await Promise.all(
      portfolios.map((pt) =>
        this.getFullPortfolioInfo(pt.portfolio_id, userId),
      ),
    );
    // portfolioInfo.map((pt) => {
    //   pt.performance_graph = [];
    //   return pt;
    // });
    return portfolioInfo;
  }

  async update(
    id: number,
    updatePortfolioDto: UpdatePortfolioDto,
    userId: number,
  ) {
    try {
      return await this.prisma.portfolio.update({
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Portfolio with ID ${id} not found`);
      }
      throw error;
    }
  }

  private async getPortfolioValue(portfolioId: number) {
    const portfolioData = await this.prisma.portfolio.findUnique({
      where: { portfolio_id: portfolioId },
    });
    const holdings = await this.prisma.holdings.findMany({
      where: { portfolio_id: portfolioId },
    });

    const holdingsSnapshot = holdings.map((holding) => ({
      ticker: holding.ticker,
      quantity: holding.quantity.toNumber(),
    }));

    console.log('Uninvested cash' + portfolioData.uninvested_cash);

    let portfolioValue: Decimal = Decimal(0);
    if (holdings.length > 0) {
      const portfolioInfo =
        await this.alpacaService.getCurrentPortfolioInfo(holdingsSnapshot);
      console.log(portfolioInfo.total_portfolio_value);
      portfolioValue = Decimal(portfolioInfo.total_portfolio_value).add(
        portfolioData.uninvested_cash,
      );
    } else {
      portfolioValue = Decimal(portfolioData.uninvested_cash);
    }
    return portfolioValue;
  }

  async deposit(userId: number, portfolioId: number, depositAmount: number) {
    Logger.debug(userId);
    Logger.debug(portfolioId);
    Logger.debug(depositAmount);
    const portfolioData = await this.prisma.portfolio.findUnique({
      where: {
        portfolio_id: portfolioId,
        user_id: userId,
      },
    });

    if (!portfolioData || portfolioData.user_id !== userId) {
      throw portfolioData
        ? new UnauthorizedException(
            "User trying to access portfolio they don't own",
          )
        : new NotFoundException(`Portfolio with ID ${portfolioId} not found`);
    }
    const value = await this.getPortfolioValue(portfolioData.portfolio_id);
    console.log(value);

    await this.prisma.portfolio.update({
      where: { portfolio_id: portfolioId },
      data: {
        total_deposited: {
          increment: depositAmount,
        },
      },
    });
    await this.reallocate(portfolioId, userId, value.add(depositAmount));
    const portfolioData2 = await this.prisma.portfolio.findUnique({
      where: {
        portfolio_id: portfolioId,
        user_id: userId,
      },
    });
    return {
      ...portfolioData2,
      total_value: await this.getPortfolioValue(portfolioId),
    };
  }

  async withdraw(userId: number, portfolioId: number, withdrawAmount: number) {
    // Validate input
    if (withdrawAmount <= 0) {
      throw new BadRequestException('Withdraw amount must be positive');
    }
    const value = await this.getPortfolioValue(portfolioId);
    if (value.lessThan(withdrawAmount)) {
      throw new BadRequestException(
        `Insufficient funds. Available: ${value}, Requested: ${withdrawAmount}`,
      );
    }
    await this.prisma.portfolio.update({
      where: { portfolio_id: portfolioId },
      data: {
        total_deposited: {
          decrement: withdrawAmount,
        },
      },
    });

    const total = this.prisma.portfolio.findFirst({
      where: { portfolio_id: portfolioId },
      select: {
        total_deposited: true,
      },
    });

    if ((await total).total_deposited.lessThan(0)) {
      await this.prisma.portfolio.update({
        where: { portfolio_id: portfolioId },
        data: {
          total_deposited: 0,
        },
      });
    }

    await this.reallocate(portfolioId, userId, value.minus(withdrawAmount));
    const portfolioData2 = await this.prisma.portfolio.findUnique({
      where: {
        portfolio_id: portfolioId,
        user_id: userId,
      },
    });
    return {
      ...portfolioData2,
      total_value: await this.getPortfolioValue(portfolioId),
    };
  }

  async remove(id: number, userID: number) {
    try {
      return await this.prisma.portfolio.delete({
        where: {
          portfolio_id: id,
          user_id: userID,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Portfolio with ID ${id} not found`);
      }
      throw error;
    }
  }
  async getAllocations(
    portfolioReviewDto: PortfolioPreviewDto,
  ): Promise<investmentAllocation[]> {
    const {
      targetDate,
      risk_aptitude,
      bitcoin_focus,
      smallcap_focus,
      value_focus,
      momentum_focus,
    } = portfolioReviewDto;

    const now = new Date();
    const time_to_expiration = BigInt(differenceInDays(targetDate, now)); // time_to_expiration as BigInt

    const matchingTemplate = await this.prisma.portfolioTemplate.findFirst({
      orderBy: {
        time_to_expiration: 'asc',
      },
      where: {
        risk_aptitude,
        bitcoin_focus,
        smallcap_focus,
        value_focus,
        momentum_focus,
      },
    });

    if (matchingTemplate) {
      const allocations =
        await this.prisma.portfolioTemplateAssetAllocation.findMany({
          where: {
            portfolio_template_id: matchingTemplate.portfolio_template_id,
          },
        });

      return await Promise.all(
        allocations.map(async (a) => ({
          ticker: a.ticker,
          name: await this.alpacaService.getTickerName(a.ticker),
          percent_of_portfolio: a.percentage,
        })),
      );
    }

    // Fallback sample allocation
    return [
      {
        ticker: 'VTI',
        name: 'Vanguard Total US Market',
        percent_of_portfolio: Decimal(34),
      },
      {
        ticker: 'BND',
        name: 'Vanguard Total US Market',
        percent_of_portfolio: Decimal(33),
      },
      {
        ticker: 'VXUS',
        name: 'Vanguard Total US Market',
        percent_of_portfolio: Decimal(33),
      },
    ];
  }

  async preview(
    portfolioReviewDto: PortfolioPreviewDto,
    allocations: investmentAllocation[],
  ) {
    const backtestSim = await this.alpacaService.backtestSim(
      allocations,
      Decimal(portfolioReviewDto.value),
      new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
      portfolioReviewDto.targetDate,
    );
    return {
      createdDate: new Date(),
      targetDate: portfolioReviewDto.targetDate,
      initial_deposit: portfolioReviewDto.value,
      risk_aptitude: portfolioReviewDto.risk_aptitude,
      bitcoin_focus: portfolioReviewDto.bitcoin_focus,
      smallcap_focus: portfolioReviewDto.smallcap_focus,
      value_focus: portfolioReviewDto.value_focus,
      momentum_focus: portfolioReviewDto.momentum_focus,
      investments: allocations,
      historical_graph: backtestSim.historical_graph,
      future_projections: backtestSim.future_projections,
      sharpe_ratio: backtestSim.sharpe_ratio,
    };
  }
}
