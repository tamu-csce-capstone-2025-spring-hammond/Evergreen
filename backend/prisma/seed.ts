import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const password_hash = await argon2.hash('Password12!');
  await prisma.users.create({
    data: {
      email: 'bob@c.com',
      password_hash: password_hash,
      user_name: 'Bob',
      portfolio: {
        create: [
          {
            target_date: new Date('2035-06-15'),
            created_at: new Date('2024-03-31'),
            portfolio_name: 'retirement',
            uninvested_cash: 3000,
            color: '#33ff33',
            total_deposited: 10000,
            momentum_focus: true,
            holdings: {
              create: [
                {
                  ticker: 'VTI',
                  ticker_name: 'Vanguard Total Market',
                  quantity: 25,
                  average_cost_basis: 220,
                  last_updated: new Date('2024-03-31'),
                },
                {
                  ticker: 'BND',
                  ticker_name: 'Total Bond Market',
                  quantity: 20,
                  average_cost_basis: 105,
                  last_updated: new Date('2024-03-31'),
                },
              ],
            },
            portfolio_snapshot: { create: createSnapshots(13000, 400) },
            trades: {
              create: [
                {
                  ticker: 'VTI',
                  trade_time: new Date('2024-03-31'),
                  trade_is_buy: true,
                  amount_shares_traded: 25,
                  av_price_paid: 220,
                },
                {
                  ticker: 'BND',
                  trade_time: new Date('2024-03-31'),
                  trade_is_buy: true,
                  amount_shares_traded: 20,
                  av_price_paid: 105,
                },
              ],
            },
          },
          {
            target_date: new Date('2030-06-15'),
            created_at: new Date('2024-03-31'),
            portfolio_name: 'home',
            uninvested_cash: 5000,
            color: '#ff9933',
            total_deposited: 20000,
            momentum_focus: false,
            holdings: {
              create: [
                {
                  ticker: 'BND',
                  ticker_name: 'Total Bond Market',
                  quantity: 50,
                  average_cost_basis: 105,
                  last_updated: new Date('2024-03-31'),
                },
                {
                  ticker: 'VTI',
                  ticker_name: 'Vanguard Total Market',
                  quantity: 10,
                  average_cost_basis: 220,
                  last_updated: new Date('2024-03-31'),
                },
              ],
            },
            portfolio_snapshot: { create: createSnapshots(25000, 400) },
            trades: {
              create: [
                {
                  ticker: 'BND',
                  trade_time: new Date('2024-03-31'),
                  trade_is_buy: true,
                  amount_shares_traded: 50,
                  av_price_paid: 105,
                },
                {
                  ticker: 'VTI',
                  trade_time: new Date('2024-03-31'),
                  trade_is_buy: true,
                  amount_shares_traded: 10,
                  av_price_paid: 220,
                },
              ],
            },
          },
          {
            target_date: new Date('2028-06-15'),
            created_at: new Date('2024-03-31'),
            portfolio_name: 'masters degree',
            uninvested_cash: 2000,
            color: '#3366ff',
            total_deposited: 12000,
            momentum_focus: false,
            holdings: {
              create: [
                {
                  ticker: 'VTI',
                  ticker_name: 'Vanguard Total Market',
                  quantity: 20,
                  average_cost_basis: 220,
                  last_updated: new Date('2024-03-31'),
                },
                {
                  ticker: 'BND',
                  ticker_name: 'Total Bond Market',
                  quantity: 30,
                  average_cost_basis: 105,
                  last_updated: new Date('2024-03-31'),
                },
              ],
            },
            portfolio_snapshot: { create: createSnapshots(14000, 400) },
            trades: {
              create: [
                {
                  ticker: 'VTI',
                  trade_time: new Date('2024-03-31'),
                  trade_is_buy: true,
                  amount_shares_traded: 20,
                  av_price_paid: 220,
                },
                {
                  ticker: 'BND',
                  trade_time: new Date('2024-03-31'),
                  trade_is_buy: true,
                  amount_shares_traded: 30,
                  av_price_paid: 105,
                },
              ],
            },
          },
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
