CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    salt TEXT,
    auth_provider VARCHAR(10) CHECK (auth_provider IN ('google', 'email')) NOT NULL,
    user_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Portfolio (
    portfolio_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    portfolio_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_date DATE,
    risk_aptitude SMALLINT,
    cash Decimal(12,2)
);

CREATE TABLE Trades (
    trade_id SERIAL PRIMARY KEY,
    portfolio_id INT REFERENCES Portfolio(portfolio_id) ON DELETE CASCADE,
    ticker VARCHAR(10) NOT NULL,
    trade_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trade_is_buy BOOLEAN NOT NULL,
    amount_traded DECIMAL(10,4) NOT NULL,
    av_price_paid DECIMAL(10,2) NOT NULL
);

CREATE TABLE Holdings (
    portfolio_id INT REFERENCES Portfolio(portfolio_id) ON DELETE CASCADE,
    ticker VARCHAR(10) NOT NULL,
    quantity DECIMAL(10,4) NOT NULL,
    average_cost_basis DECIMAL(10,2) NOT NULL,
    last_updated TIMESTAMP NOT NULL,
    PRIMARY KEY (portfolio_id, ticker) 
);

CREATE TABLE Portfolio_Snapshot (
    portfolio_id INT REFERENCES Portfolio(portfolio_id) ON DELETE CASCADE,
    snapshot_time TIMESTAMP NOT NULL,
    snapshot_value DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (portfolio_id, snapshot_time)
);

CREATE TABLE Sample_Portfolio (
    sample_portfolio_id SERIAL PRIMARY KEY,
    last_generated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeline INTERVAL,
    risk_aptitude SMALLINT,
    sample_portfolio_name VARCHAR(255)
);

CREATE TABLE Sample_Portfolio_Asset_Allocation (
    sample_portfolio_id INT REFERENCES Sample_Portfolio(sample_portfolio_id) ON DELETE CASCADE,
    ticker VARCHAR(10) NOT NULL,
    percentage NUMERIC(5,4) NOT NULL,
    PRIMARY KEY (ticker, sample_portfolio_id)
);

CREATE TABLE Watchlist (
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    ticker VARCHAR(10) NOT NULL,
    PRIMARY KEY (ticker, user_id)
);
