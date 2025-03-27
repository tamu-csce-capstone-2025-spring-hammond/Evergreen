import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post() 
  async create(@Body() portfolioDto: PortfolioDto) {
    return this.portfolioService.create(portfolioDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.portfolioService.findOne(+id);
  }

  @Get('user/:userId')
  async getPortfoliosByUserId(@Param('userId') userId: number) {
    try {
      return await this.portfolioService.findByUserId(userId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePortfolioDto: UpdatePortfolioDto) {
    return this.portfolioService.update(+id, updatePortfolioDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.portfolioService.remove(+id);
  }
}
