import { Module } from '@nestjs/common';
import { AlpacaService } from './alpaca.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [AlpacaService, PrismaService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class StockApisModule {}
