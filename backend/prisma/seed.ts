// seed.ts or wherever you're writing this standalone script
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';
import { AlpacaService } from '../src/stock-apis/alpaca.service';
import * as dotenv from 'dotenv';
import { kMaxLength } from 'buffer';

// Load the .env file manually
dotenv.config();

// Initialize ConfigService with manually loaded env
const config = new ConfigService();

// Optionally, you can extend ConfigService to provide defaults or structure:
config.get = (key: string) => process.env[key] || null;

const prisma = new PrismaClient();
const alpaca = new AlpacaService(config);

// Now you can use config.get('SOME_ENV_VAR') like in your main app

async function main() {
  await prisma.portfolioTemplate.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.users.deleteMany();
  const riskyPortfolio = [
    { ticker: 'VTI', percent: Decimal(0.6) },
    { ticker: 'BND', percent: Decimal(0.18) },
    { ticker: 'QQQM', percent: Decimal(0.22) },
  ];
  const safePortfolio = [
    { ticker: 'VTI', percent: Decimal(0.4) },
    { ticker: 'BND', percent: Decimal(0.38) },
    { ticker: 'QQQM', percent: Decimal(0.22) },
  ];
  const superSafePortfolio = [
    { ticker: 'VTI', percent: Decimal(0.2) },
    { ticker: 'BNDX', percent: Decimal(0.29) },
    { ticker: 'BND', percent: Decimal(0.51) },
  ];
  const riskySim = await alpaca.seedSim(
    riskyPortfolio,
    Decimal(10000),
    new Date('2024-03-31'),
  );
  const safeSim = await alpaca.seedSim(
    safePortfolio,
    Decimal(20000),
    new Date('2024-03-31'),
  );
  const superSafeSim = await alpaca.seedSim(
    superSafePortfolio,
    Decimal(12000),
    new Date('2024-03-31'),
  );
  const password_hash = await argon2.hash('Password12!');
  await prisma.users.create({
    data: {
      email: 'bob3@c.com',
      password_hash: password_hash,
      user_name: 'Bob3',
      portfolio: {
        create: [
          {
            target_date: new Date('2035-06-15'),
            created_at: new Date('2024-03-31'),
            portfolio_name: 'retirement',
            uninvested_cash: 0,
            color: '#33ff33',
            total_deposited: 10000,
            momentum_focus: true,
            holdings: {
              create: riskySim.investments,
            },
            portfolio_snapshot: { create: riskySim.backtestResult.graph },
            trades: { create: riskySim.trades },
          },
          {
            target_date: new Date('2030-06-15'),
            created_at: new Date('2024-03-31'),
            portfolio_name: 'home',
            uninvested_cash: 0,
            color: '#ff9933',
            total_deposited: 20000,
            momentum_focus: false,
            holdings: {
              create: safeSim.investments,
            },
            portfolio_snapshot: { create: safeSim.backtestResult.graph },
            trades: {
              create: safeSim.trades,
            },
          },
          // {
          //   target_date: new Date('2028-06-15'),
          //   created_at: new Date('2024-03-31'),
          //   portfolio_name: 'masters degree',
          //   uninvested_cash: 0,
          //   color: '#3366ff',
          //   total_deposited: 12000,
          //   momentum_focus: false,
          //   holdings: {
          //     create: superSafeSim.investments,
          //   },
          //   portfolio_snapshot: { create: superSafeSim.backtestResult.graph },
          //   trades: {
          //     create: superSafeSim.trades,
          //   },
          // },
        ],
      },
      watchlist: {
        create: [
          { ticker: 'VTI', ticker_name: 'Total US Stock Market' },
          { ticker: 'VXUS', ticker_name: 'Total International Stock Market' },
          { ticker: 'USO', ticker_name: 'US Oil' },
          { ticker: 'VGT', ticker_name: 'Tech' },
          { ticker: 'GLD', ticker_name: 'Gold' },
          { ticker: 'AAPL', ticker_name: 'Apple Inc' },
          { ticker: 'TSLA', ticker_name: 'Tesla Inc' },
          { ticker: 'MSFT', ticker_name: 'Microsoft Corp' },
          { ticker: 'BND', ticker_name: 'Total Bond Market' },
          { ticker: 'TLT', ticker_name: 'US Treasury' },
        ],
      },
    },
  });
  const fs = require('fs');
  const rawData = fs.readFileSync('./prisma/computedWeights.json');
  const portfolioTemplates = JSON.parse(rawData);
  for (const template of portfolioTemplates) {
    const createdTemplate = await prisma.portfolioTemplate.create({
      data: {
        years_to_expiration: template.years_to_expiration,
        risk_aptitude: template.risk_aptitude,
        bitcoin_focus: template.bitcoin_focus,
        smallcap_focus: template.smallcap_focus,
        value_focus: template.value_focus,
        momentum_focus: template.momentum_focus,
        sample_portfolio_name: null, // Or provide a string if needed
        sample_portfolio_asset_allocation: {
          create: template.holdings.map((h) => ({
            ticker: h.ticker,
            percentage: h.percentage,
          })),
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const createSnapshots = (endingAmount: number, numberOfDays: number) => {
  const arr = [];
  const hist = generatePortfolioHistory(
    endingAmount,
    numberOfDays,
    0.0001,
    0.012,
  );
  hist.forEach((pt) => {
    arr.push({
      snapshot_time: pt.date,
      snapshot_value: pt.value,
    });
  });
  return arr;
};

interface PortfolioPoint {
  date: Date;
  value: number;
}

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

function generatePortfolioHistory(
  currentValue: number,
  days: number,
  drift: number = 0.0001,
  volatility: number = 0.012,
): PortfolioPoint[] {
  const history: PortfolioPoint[] = [];
  let value = currentValue;

  for (let i = 0; i < days; i++) {
    value *= Math.exp(drift + volatility * gaussianRandom(0, 1));
    history.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      value,
    });
  }

  return history.reverse();
}
