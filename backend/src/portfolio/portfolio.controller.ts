import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtGuard } from 'src/auth/jwt.guard';

// Create DTOs for deposit and withdraw operations
class DepositDto {
  depositAmount: number;
}

class WithdrawDto {
  withdrawAmount: number;
}

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(
    @Body() portfolioDto: PortfolioDto,
    @Request() request: { userid: number },
  ) {
    const { userid: userID } = request;
    return this.portfolioService.create(portfolioDto, userID);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(
    @Param('id') id: string,
    @Request() request: { userid: number },
  ) {
    const { userid: userID } = request;
    return this.portfolioService.getFullPortfolioInfo(+id, userID);
  }

  @Get()
  @UseGuards(JwtGuard)
  async getPortfoliosByUserId(@Request() request: { userid: number }) {
    const { userid: userID } = request;
    try {
      return await this.portfolioService.findByUserId(userID);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @Request() request: { userid: number },
  ) {
    const { userid: userID } = request;
    return this.portfolioService.update(+id, updatePortfolioDto, userID);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(
    @Param('id') id: string,
    @Request() request: { userid: number },
  ) {
    const { userid: userID } = request;
    const deleted = await this.portfolioService.remove(+id, userID);
    if (!deleted) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }
    return new HttpException(
      'Portfolio deleted successfully',
      HttpStatus.NO_CONTENT,
    );
  }

  @Post(':id/deposit')
  @UseGuards(JwtGuard)
  async deposit(
    @Param('id') id: string,
    @Body() depositDto: DepositDto,
    @Request() request: { userid: number },
  ) {
    const { userid: userID } = request;
    const { depositAmount } = depositDto;

    if (!depositAmount || depositAmount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }

    try {
      const result = await this.portfolioService.deposit(
        userID,
        +id,
        depositAmount,
      );
      return {
        message: `Successfully deposited ${depositAmount}`,
        portfolioId: result.portfolio_id,
        portfolioName: result.portfolio_name,
        currentBalance: result.uninvested_cash,
        totalDeposited: result.total_deposited,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Failed to process deposit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/withdraw')
  @UseGuards(JwtGuard)
  async withdraw(
    @Param('id') id: string,
    @Body() withdrawDto: WithdrawDto,
    @Request() request: { userid: number },
  ) {
    const { userid: userID } = request;
    const { withdrawAmount } = withdrawDto;

    if (!withdrawAmount || withdrawAmount <= 0) {
      throw new BadRequestException('Withdraw amount must be positive');
    }

    try {
      const result = await this.portfolioService.withdraw(
        userID,
        +id,
        withdrawAmount,
      );
      return {
        message: `Successfully withdrew ${withdrawAmount}`,
        portfolioId: result.portfolio_id,
        portfolioName: result.portfolio_name,
        currentBalance: result.uninvested_cash,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Failed to process withdrawal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
