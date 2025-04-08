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
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtGuard } from '../auth/jwt.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DepositDto, WithdrawDto } from './dto/deposit-withdraw.dto';
import { ErrorCodes, ErrorMessages } from '../error-codes.enum';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new portfolio',
    description:
      'Creates a new investment portfolio for the authenticated user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Portfolio successfully created.',
    schema: {
      example: {
        id: 1,
        portfolioName: 'Retirement',
        color: '#4CAF50',
        createdDate: '2025-01-01T00:00:00.000Z',
        targetDate: '2050-01-01T00:00:00.000Z',
        inital_deposit: 1000000,
        bitcoin_focus: true,
        smallcap_focus: true,
        value_focus: true,
        momentum_focus: true,
        userID: 123,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error. Check the request body format.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid JWT Token in Bearer Auth Field (it may have expired, be blank, or be otherwise incorrect)',
    schema: {
      example: {
        message: 'Invalid Bearer Token',
        error: 'Unauthorized',
      },
    },
  })
  async create(
    @Body() portfolioDto: PortfolioDto,
    @Request() request: { userid: number },
  ) {
    const { userid: userID } = request;
    return this.portfolioService.create(portfolioDto, userID);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth() // Requires authentication
  @ApiOperation({
    summary: 'Retrieve detailed portfolio information',
    description:
      'Fetches full portfolio details including performance data, investments, and other key metrics.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The unique ID of the portfolio',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio details retrieved successfully.',
    schema: {
      example: {
        portfolio_id: 1,
        portfolio_name: 'retirement',
        created_at: '2024-03-31T00:00:00.000Z',
        target_date: '2035-06-15T00:00:00.000Z',
        uninvested_cash: '3000',
        current_value: '13016.24',
        percent_change: '30.1624',
        amount_change: '3016.24',
        bitcoin_focus: false,
        smallcap_focus: false,
        value_focus: false,
        momentum_focus: true,
        investments: [
          {
            ticker: 'BND',
            name: 'Stock name',
            quantity_owned: '20',
            average_cost_basis: '105',
            current_price: '105',
            percent_change: '0',
          },
          {
            ticker: 'VTI',
            name: 'Stock name',
            quantity_owned: '25',
            average_cost_basis: '220',
            current_price: '220',
            percent_change: '0',
          },
        ],
        performance_graph: [
          {
            snapshot_time: '2024-02-26T17:04:57.081Z',
            snapshot_value: '16127.67',
          },
          {
            snapshot_time: '2024-02-27T17:04:57.081Z',
            snapshot_value: '16395.11',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or missing parameter.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid JWT Token in Bearer Auth Field (it may have expired, be blank, or be otherwise incorrect)',
    schema: {
      example: {
        message: 'Invalid Bearer Token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Portfolio with ID ${id} not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: { userid: number },
  ) {
    const { userid: userID } = request;
    return this.portfolioService.getFullPortfolioInfo(id, userID);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth() // Indicates authentication is required
  @ApiOperation({
    summary: 'Retrieve portfolios by user ID',
    description:
      'Fetches all portfolios associated with the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the list of portfolios for the user.',
    schema: {
      example: [
        {
          portfolio_id: 5,
          portfolio_name: 'Retirement',
          created_at: '2025-01-01T00:00:00.000Z',
          target_date: '2050-01-01T00:00:00.000Z',
          uninvested_cash: '1000000',
          current_value: '1000000',
          percent_change: '0',
          amount_change: '0',
          bitcoin_focus: true,
          smallcap_focus: true,
          value_focus: true,
          momentum_focus: false,
          investments: [],
          performance_graph: [],
        },
        {
          portfolio_id: 1,
          portfolio_name: 'Retirement Growth 2',
          created_at: '2024-03-31T00:00:00.000Z',
          target_date: '2055-01-01T00:00:00.000Z',
          uninvested_cash: '2000',
          current_value: '15016.24',
          percent_change: '66.847111111111111111',
          amount_change: '6016.24',
          bitcoin_focus: true,
          smallcap_focus: true,
          value_focus: false,
          momentum_focus: true,
          investments: [
            {
              ticker: 'BND',
              name: 'Total Bond Market',
              quantity_owned: '20',
              average_cost_basis: '105',
              current_price: '73.76',
              percent_change: '-29.752380952380952381',
            },
            {
              ticker: 'VTI',
              name: 'Vanguard Total Market',
              quantity_owned: '25',
              average_cost_basis: '220',
              current_price: '248.065',
              percent_change: '12.756818181818181818',
            },
          ],
          performance_graph: [],
        },
      ],
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'Alpaca or Polygon is down, not working, or over used',
    schema: {
      example: {
        error: ErrorCodes.EXTERNAL_API_FAILURE,
        message: ErrorMessages.EXTERNAL_API_FAILURE,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid JWT Token in Bearer Auth Field (it may have expired, be blank, or be otherwise incorrect)',
    schema: {
      example: {
        message: 'Invalid Bearer Token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No portfolios found for the given user ID.',
  })
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
  @ApiOperation({ summary: 'Update a portfolio by its ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the portfolio to update',
    type: String,
  })
  @ApiBody({
    description: 'The portfolio data to update',
    type: UpdatePortfolioDto,
  })
  @ApiResponse({
    status: 200,
    description: 'The portfolio was successfully updated',
    schema: {
      example: {
        portfolio_id: 1,
        user_id: 2,
        portfolio_name: 'Retirement Growth 2',
        created_at: '2024-03-31T00:00:00.000Z',
        target_date: '2055-01-01T00:00:00.000Z',
        color: '#FF5732',
        uninvested_cash: '3000',
        total_deposited: '10000',
        risk_aptitude: null,
        bitcoin_focus: true,
        smallcap_focus: true,
        value_focus: false,
        momentum_focus: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or missing parameter.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid JWT Token in Bearer Auth Field (it may have expired, be blank, or be otherwise incorrect)',
    schema: {
      example: {
        message: 'Invalid Bearer Token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Portfolio with ID ${id} not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @Request() request: { userid: number },
  ) {
    const { userid: userID } = request;
    return this.portfolioService.update(id, updatePortfolioDto, userID);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete portfolio by ID' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 204, description: 'Portfolio successfully deleted' })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or missing parameter.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid JWT Token in Bearer Auth Field (it may have expired, be blank, or be otherwise incorrect)',
    schema: {
      example: {
        message: 'Invalid Bearer Token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Portfolio with ID ${id} not found',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: { userid: number },
  ): Promise<void> {
    const { userid: userID } = request;
    const deleted = await this.portfolioService.remove(id, userID);

    if (!deleted) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    return;
  }

  @Post(':id/deposit')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Deposit funds into a specific portfolio',
    description:
      'Allows a user to deposit a specified amount of money into a portfolio. Requires a valid JWT token.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the portfolio to deposit into',
    required: true,
    type: String,
  })
  @ApiBody({
    type: DepositDto,
    description: 'Deposit request containing the amount to deposit',
  })
  @ApiResponse({
    status: 200,
    description: 'Deposit was successful',
    schema: {
      example: {
        message: 'Successfully deposited 1000',
        portfolioId: 1,
        portfolioName: 'Retirement Growth 2',
        currentBalance: '1000',
        totalDeposited: '8000',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Deposit amount must be positive and portfolio id must be a integer',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid JWT Token in Bearer Auth Field (it may have expired, be blank, or be otherwise incorrect)',
    schema: {
      example: {
        message: 'Invalid Bearer Token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Portfolio with ID ${id} not found',
  })
  async deposit(
    @Param('id', ParseIntPipe) id: number,
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
        id,
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
  @ApiOperation({
    summary: 'Withdraw funds from a specific portfolio',
    description:
      'Allows a user to withdraw a specified amount of money from a portfolio. Requires a valid JWT token.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the portfolio to withdraw from',
    required: true,
    type: String,
  })
  @ApiBody({
    type: WithdrawDto,
    description: 'Withdraw request containing the amount to withdraw',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal was successful',
    schema: {
      example: {
        message: 'Successfully withdrew 1000',
        portfolioId: 1,
        portfolioName: 'Retirement Growth 2',
        currentBalance: '2000',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient funds or invalid withdrawal amount',
    schema: {
      example: {
        message: 'Insufficient funds. Available: 0, Requested: 1000',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid JWT Token in Bearer Auth Field (it may have expired, be blank, or be otherwise incorrect)',
    schema: {
      example: {
        message: 'Invalid Bearer Token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Portfolio with ID ${id} not found',
  })
  async withdraw(
    @Param('id', ParseIntPipe) id: number,
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
