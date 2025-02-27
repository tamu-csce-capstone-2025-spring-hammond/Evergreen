-- Clear existing data (if any) by deleting in reverse order of dependencies
TRUNCATE TABLE Watchlist CASCADE;
TRUNCATE TABLE Sample_Portfolio_Asset_Allocation CASCADE;
TRUNCATE TABLE Sample_Portfolio CASCADE;
TRUNCATE TABLE Portfolio_Snapshot CASCADE;
TRUNCATE TABLE Holdings CASCADE;
TRUNCATE TABLE Trades CASCADE;
TRUNCATE TABLE Portfolio CASCADE;
TRUNCATE TABLE Users CASCADE;

-- Insert Users
INSERT INTO Users (email, password_hash, salt, auth_provider, user_name, created_at)
VALUES
  ('john.doe@example.com', 'hash1', 'salt1', 'email', 'JohnDoe', NOW() - INTERVAL '60 days'),
  ('jane.smith@example.com', 'hash2', 'salt2', 'email', 'JaneSmith', NOW() - INTERVAL '45 days'),
  ('alice.johnson@example.com', NULL, NULL, 'google', 'AliceJ', NOW() - INTERVAL '30 days'),
  ('bob.wilson@example.com', 'hash4', 'salt4', 'email', 'BobWilson', NOW() - INTERVAL '15 days');

-- Insert Portfolios
INSERT INTO Portfolio (user_id, portfolio_name, created_at, target_date, risk_aptitude, cash)
VALUES
  -- John Doe's portfolios
  (1, 'Retirement', NOW() - INTERVAL '59 days', '2045-01-01', 4, 2500.50),
  (1, 'Short Term', NOW() - INTERVAL '58 days', '2025-06-01', 2, 1000.25),
  
  -- Jane Smith's portfolios
  (2, 'Long-term Growth', NOW() - INTERVAL '44 days', '2050-12-31', 5, 5000.00),
  (2, 'Dividend Income', NOW() - INTERVAL '43 days', '2030-01-01', 3, 3500.75),
  
  -- Alice Johnson's portfolios
  (3, 'Tech Stocks', NOW() - INTERVAL '29 days', '2035-01-01', 4, 7500.00),
  (3, 'Aggressive Growth', NOW() - INTERVAL '28 days', '2040-01-01', 5, 1200.50),
  
  -- Bob Wilson's portfolios
  (4, 'Conservative', NOW() - INTERVAL '14 days', '2027-01-01', 2, 10000.00),
  (4, 'Speculative', NOW() - INTERVAL '13 days', '2030-06-01', 5, 2000.00);

-- Insert Trades
INSERT INTO Trades (portfolio_id, ticker, trade_time, trade_is_buy, amount_traded, av_price_paid)
VALUES
  -- John Doe's trades for Retirement portfolio
  (1, 'AAPL', NOW() - INTERVAL '58 days', TRUE, 10.0000, 150.25),
  (1, 'MSFT', NOW() - INTERVAL '57 days', TRUE, 5.0000, 250.75),
  (1, 'GOOGL', NOW() - INTERVAL '55 days', TRUE, 2.0000, 1200.50),
  (1, 'AAPL', NOW() - INTERVAL '40 days', TRUE, 2.0000, 155.50),
  (1, 'MSFT', NOW() - INTERVAL '30 days', FALSE, 1.0000, 260.00),
  
  -- John Doe's trades for Short Term portfolio
  (2, 'VTI', NOW() - INTERVAL '56 days', TRUE, 8.0000, 180.25),
  (2, 'BND', NOW() - INTERVAL '55 days', TRUE, 10.0000, 85.50),
  (2, 'VTI', NOW() - INTERVAL '35 days', FALSE, 3.0000, 185.00),
  
  -- Jane Smith's trades for Long-term Growth portfolio
  (3, 'SPY', NOW() - INTERVAL '43 days', TRUE, 12.0000, 410.25),
  (3, 'QQQ', NOW() - INTERVAL '42 days', TRUE, 8.0000, 350.75),
  (3, 'IWM', NOW() - INTERVAL '41 days', TRUE, 10.0000, 180.50),
  (3, 'SPY', NOW() - INTERVAL '25 days', FALSE, 2.0000, 415.00),
  
  -- Jane Smith's trades for Dividend Income portfolio
  (4, 'VYM', NOW() - INTERVAL '42 days', TRUE, 15.0000, 95.25),
  (4, 'SCHD', NOW() - INTERVAL '41 days', TRUE, 20.0000, 75.50),
  (4, 'PFF', NOW() - INTERVAL '40 days', TRUE, 25.0000, 35.75),
  
  -- Alice Johnson's trades for Tech Stocks portfolio
  (5, 'NVDA', NOW() - INTERVAL '28 days', TRUE, 4.0000, 450.25),
  (5, 'AMD', NOW() - INTERVAL '27 days', TRUE, 10.0000, 105.50),
  (5, 'TSLA', NOW() - INTERVAL '26 days', TRUE, 3.0000, 650.75),
  (5, 'NVDA', NOW() - INTERVAL '15 days', TRUE, 2.0000, 475.00),
  
  -- Alice Johnson's trades for Aggressive Growth portfolio
  (6, 'ARKK', NOW() - INTERVAL '27 days', TRUE, 15.0000, 80.25),
  (6, 'PLTR', NOW() - INTERVAL '26 days', TRUE, 50.0000, 25.50),
  (6, 'SQ', NOW() - INTERVAL '25 days', TRUE, 10.0000, 195.75),
  
  -- Bob Wilson's trades for Conservative portfolio
  (7, 'VIG', NOW() - INTERVAL '13 days', TRUE, 25.0000, 145.25),
  (7, 'USMV', NOW() - INTERVAL '12 days', TRUE, 30.0000, 65.50),
  (7, 'AGG', NOW() - INTERVAL '11 days', TRUE, 40.0000, 110.75),
  
  -- Bob Wilson's trades for Speculative portfolio
  (8, 'COIN', NOW() - INTERVAL '12 days', TRUE, 5.0000, 225.50),
  (8, 'MARA', NOW() - INTERVAL '11 days', TRUE, 20.0000, 35.75),
  (8, 'RIOT', NOW() - INTERVAL '10 days', TRUE, 15.0000, 45.25),
  (8, 'COIN', NOW() - INTERVAL '5 days', FALSE, 2.0000, 230.00);

-- Insert Holdings (based on the net result of trades)
INSERT INTO Holdings (portfolio_id, ticker, quantity, average_cost_basis, last_updated)
VALUES
  -- John Doe's holdings
  (1, 'AAPL', 12.0000, 151.17, NOW() - INTERVAL '30 days'),
  (1, 'MSFT', 4.0000, 250.75, NOW() - INTERVAL '30 days'),
  (1, 'GOOGL', 2.0000, 1200.50, NOW() - INTERVAL '30 days'),
  (2, 'VTI', 5.0000, 180.25, NOW() - INTERVAL '35 days'),
  (2, 'BND', 10.0000, 85.50, NOW() - INTERVAL '35 days'),
  
  -- Jane Smith's holdings
  (3, 'SPY', 10.0000, 410.25, NOW() - INTERVAL '25 days'),
  (3, 'QQQ', 8.0000, 350.75, NOW() - INTERVAL '25 days'),
  (3, 'IWM', 10.0000, 180.50, NOW() - INTERVAL '25 days'),
  (4, 'VYM', 15.0000, 95.25, NOW() - INTERVAL '25 days'),
  (4, 'SCHD', 20.0000, 75.50, NOW() - INTERVAL '25 days'),
  (4, 'PFF', 25.0000, 35.75, NOW() - INTERVAL '25 days'),
  
  -- Alice Johnson's holdings
  (5, 'NVDA', 6.0000, 458.50, NOW() - INTERVAL '15 days'),
  (5, 'AMD', 10.0000, 105.50, NOW() - INTERVAL '15 days'),
  (5, 'TSLA', 3.0000, 650.75, NOW() - INTERVAL '15 days'),
  (6, 'ARKK', 15.0000, 80.25, NOW() - INTERVAL '15 days'),
  (6, 'PLTR', 50.0000, 25.50, NOW() - INTERVAL '15 days'),
  (6, 'SQ', 10.0000, 195.75, NOW() - INTERVAL '15 days'),
  
  -- Bob Wilson's holdings
  (7, 'VIG', 25.0000, 145.25, NOW() - INTERVAL '5 days'),
  (7, 'USMV', 30.0000, 65.50, NOW() - INTERVAL '5 days'),
  (7, 'AGG', 40.0000, 110.75, NOW() - INTERVAL '5 days'),
  (8, 'COIN', 3.0000, 225.50, NOW() - INTERVAL '5 days'),
  (8, 'MARA', 20.0000, 35.75, NOW() - INTERVAL '5 days'),
  (8, 'RIOT', 15.0000, 45.25, NOW() - INTERVAL '5 days');

-- Insert Portfolio Snapshots
INSERT INTO Portfolio_Snapshot (portfolio_id, snapshot_time, snapshot_value)
VALUES
  -- John Doe's portfolio snapshots
  (1, NOW() - INTERVAL '55 days', 3500.00),
  (1, NOW() - INTERVAL '45 days', 3650.00),
  (1, NOW() - INTERVAL '35 days', 3750.00),
  (1, NOW() - INTERVAL '25 days', 3900.00),
  (1, NOW() - INTERVAL '15 days', 4050.00),
  (1, NOW() - INTERVAL '5 days', 4200.00),
  (2, NOW() - INTERVAL '55 days', 2500.00),
  (2, NOW() - INTERVAL '45 days', 2550.00),
  (2, NOW() - INTERVAL '35 days', 2600.00),
  (2, NOW() - INTERVAL '25 days', 2650.00),
  (2, NOW() - INTERVAL '15 days', 2700.00),
  (2, NOW() - INTERVAL '5 days', 2750.00),
  
  -- Jane Smith's portfolio snapshots
  (3, NOW() - INTERVAL '40 days', 9500.00),
  (3, NOW() - INTERVAL '30 days', 9800.00),
  (3, NOW() - INTERVAL '20 days', 10200.00),
  (3, NOW() - INTERVAL '10 days', 10500.00),
  (4, NOW() - INTERVAL '40 days', 5800.00),
  (4, NOW() - INTERVAL '30 days', 6000.00),
  (4, NOW() - INTERVAL '20 days', 6200.00),
  (4, NOW() - INTERVAL '10 days', 6400.00),
  
  -- Alice Johnson's portfolio snapshots
  (5, NOW() - INTERVAL '25 days', 8200.00),
  (5, NOW() - INTERVAL '20 days', 8500.00),
  (5, NOW() - INTERVAL '15 days', 8800.00),
  (5, NOW() - INTERVAL '10 days', 9100.00),
  (5, NOW() - INTERVAL '5 days', 9400.00),
  (6, NOW() - INTERVAL '25 days', 4800.00),
  (6, NOW() - INTERVAL '20 days', 5000.00),
  (6, NOW() - INTERVAL '15 days', 5200.00),
  (6, NOW() - INTERVAL '10 days', 5400.00),
  (6, NOW() - INTERVAL '5 days', 5600.00),
  
  -- Bob Wilson's portfolio snapshots
  (7, NOW() - INTERVAL '10 days', 12500.00),
  (7, NOW() - INTERVAL '5 days', 12750.00),
  (8, NOW() - INTERVAL '10 days', 3200.00),
  (8, NOW() - INTERVAL '5 days', 3300.00);

-- Insert Sample Portfolios
INSERT INTO Sample_Portfolio (last_generated, timeline, risk_aptitude, sample_portfolio_name)
VALUES
  (NOW() - INTERVAL '90 days', '15 years', 2, 'Conservative Long-term'),
  (NOW() - INTERVAL '90 days', '5 years', 2, 'Conservative Short-term'),
  (NOW() - INTERVAL '90 days', '15 years', 4, 'Balanced Long-term'),
  (NOW() - INTERVAL '90 days', '5 years', 4, 'Balanced Short-term'),
  (NOW() - INTERVAL '90 days', '15 years', 5, 'Aggressive Long-term'),
  (NOW() - INTERVAL '90 days', '5 years', 5, 'Aggressive Short-term');

-- Insert Sample Portfolio Asset Allocations
INSERT INTO Sample_Portfolio_Asset_Allocation (sample_portfolio_id, ticker, percentage)
VALUES
  -- Conservative Long-term
  (1, 'AGG', 0.4000),
  (1, 'BND', 0.2000),
  (1, 'VTI', 0.2000),
  (1, 'VIG', 0.1000),
  (1, 'VXUS', 0.1000),
  
  -- Conservative Short-term
  (2, 'BIL', 0.3000),
  (2, 'SHY', 0.3000),
  (2, 'AGG', 0.2000),
  (2, 'VIG', 0.1000),
  (2, 'USMV', 0.1000),
  
  -- Balanced Long-term
  (3, 'VTI', 0.3500),
  (3, 'VXUS', 0.2500),
  (3, 'BND', 0.2000),
  (3, 'VNQ', 0.1000),
  (3, 'GLD', 0.0500),
  (3, 'QQQ', 0.0500),
  
  -- Balanced Short-term
  (4, 'VTI', 0.3000),
  (4, 'SCHD', 0.1500),
  (4, 'AGG', 0.3000),
  (4, 'BND', 0.1500),
  (4, 'USMV', 0.1000),
  
  -- Aggressive Long-term
  (5, 'VTI', 0.4000),
  (5, 'QQQ', 0.2000),
  (5, 'VXUS', 0.2000),
  (5, 'VNQ', 0.1000),
  (5, 'BND', 0.1000),
  
  -- Aggressive Short-term
  (6, 'QQQ', 0.3000),
  (6, 'VUG', 0.3000),
  (6, 'VTI', 0.2000),
  (6, 'ARKK', 0.1000),
  (6, 'AGG', 0.1000);

-- Insert Watchlist items
INSERT INTO Watchlist (user_id, ticker)
VALUES
  -- John Doe's watchlist
  (1, 'AMZN'),
  (1, 'NFLX'),
  (1, 'DIS'),
  
  -- Jane Smith's watchlist
  (2, 'AAPL'),
  (2, 'MSFT'),
  (2, 'NVDA'),
  (2, 'AMD'),
  
  -- Alice Johnson's watchlist
  (3, 'TSLA'),
  (3, 'PLTR'),
  (3, 'SQ'),
  
  -- Bob Wilson's watchlist
  (4, 'JPM'),
  (4, 'GS'),
  (4, 'BAC');