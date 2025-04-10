# Evergreen Prisma

This prisma schema is the sole point of reference (source of authority) of database design for our project

## Set up database

1. Fill out .env with database url
2. Install prisma with `npm install prisma --save-dev`
3. Run `npx prisma db push` to push schema to database

## Generate prisma-client

1. Run `npx prisma generate` to generate prisma client scripts in node modules. The client can then be used in the code through prisma.service.ts
2. Run `npx prisma db seed` to generate a sample user with simulated trade history, and 