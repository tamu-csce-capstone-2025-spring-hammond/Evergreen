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
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtGuard } from 'src/auth/jwt.guard';

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
  ) {
    return this.portfolioService.update(+id, updatePortfolioDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Param('id') id: string) {
    return this.portfolioService.remove(+id);
  }
}
