import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  //   // Your seeding logic here
  //   await prisma.portfolio.create({
  //     data: {
  //       target_date: new Date('2027-06-15'),
  //       user_id: 1,
  //       portfolio_name: 'retirement',
  //       cash: 2000,
  //       color: '#33ff33',
  //       deposited_cash: 1000,
  //       holdings: {
  //         create: [
  //           {
  //             ticker: 'BOXX',
  //             quantity: 40,
  //             average_cost_basis: 111.41,
  //             last_updated: new Date(),
  //           },
  //           {
  //             ticker: 'VCIT',
  //             quantity: 12.2,
  //             average_cost_basis: 81.18,
  //             last_updated: new Date(),
  //           },
  //           {
  //             ticker: 'BND',
  //             quantity: 18.2,
  //             average_cost_basis: 73.18,
  //             last_updated: new Date(),
  //           },
  //         ],
  //       },
  //     },
  //   });
  await prisma.portfolio.create({
    data: {
      target_date: new Date('2027-06-15'),
      user_id: 1,
      portfolio_name: 'house',
      cash: 40000,
      color: '#0066ff',
      deposited_cash: 25000,
      holdings: {
        create: [
          {
            ticker: 'VTI',
            quantity: 40,
            average_cost_basis: 111.41,
            last_updated: new Date(),
          },
          {
            ticker: 'VCIT',
            quantity: 12.2,
            average_cost_basis: 81.18,
            last_updated: new Date(),
          },
          {
            ticker: 'NVDA',
            quantity: 18.2,
            average_cost_basis: 73.18,
            last_updated: new Date(),
          },
        ],
      },
    },
  });
  //   const hist = generatePortfolioHistory(6778.672, 400, -0.000121, 0.0001337);
  //   hist.forEach(async (pt) => {
  //     console.log(pt.value);
  //     await prisma.portfolio_snapshot.create({
  //       data: {
  //         snapshot_time: pt.date,
  //         snapshot_value: pt.value,
  //         portfolio_id: 2,
  //       },
  //     });
  //   });
  //   console.log('11211.922');
  // await prisma.portfolio_snapshot.deleteMany();
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

interface PortfolioPoint {
  date: Date;
  value: number;
}

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

function generatePortfolioHistory(
  currentValue: number,
  days: number,
  drift: number = -0.0005,
  volatility: number = 0.02,
): PortfolioPoint[] {
  const history: PortfolioPoint[] = [];
  let value = currentValue;
  //   const rando = gaussianRandom(0, 1);

  for (let i = 0; i < days; i++) {
    value *= Math.exp(drift + volatility * gaussianRandom(0, 1));
    history.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      value,
    });
  }

  return history.reverse();
}

// Example usage:
// const history = generatePortfolioHistory(10000, 365);
// console.log(history);
