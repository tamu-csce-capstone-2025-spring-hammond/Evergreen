-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "user_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "portfolio" (
    "portfolio_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "portfolio_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_date" DATE NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "uninvested_cash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_deposited" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "risk_aptitude" SMALLINT,
    "bitcoin_focus" BOOLEAN NOT NULL DEFAULT false,
    "smallcap_focus" BOOLEAN NOT NULL DEFAULT false,
    "value_focus" BOOLEAN NOT NULL DEFAULT false,
    "momentum_focus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("portfolio_id")
);

-- CreateTable
CREATE TABLE "executed_trades" (
    "trade_id" SERIAL NOT NULL,
    "portfolio_id" INTEGER NOT NULL,
    "ticker" VARCHAR(10) NOT NULL,
    "trade_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trade_is_buy" BOOLEAN NOT NULL,
    "amount_shares_traded" DECIMAL(10,4) NOT NULL,
    "av_price_paid" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "executed_trades_pkey" PRIMARY KEY ("trade_id")
);

-- CreateTable
CREATE TABLE "holdings" (
    "portfolio_id" INTEGER NOT NULL,
    "ticker" VARCHAR(10) NOT NULL,
    "ticker_name" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL,
    "average_cost_basis" DECIMAL(10,2) NOT NULL,
    "last_updated" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "holdings_pkey" PRIMARY KEY ("portfolio_id","ticker")
);

-- CreateTable
CREATE TABLE "portfolio_snapshot" (
    "portfolio_id" INTEGER NOT NULL,
    "snapshot_time" TIMESTAMP(6) NOT NULL,
    "snapshot_value" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "portfolio_snapshot_pkey" PRIMARY KEY ("portfolio_id","snapshot_time")
);

-- CreateTable
CREATE TABLE "portfolio_template" (
    "portfolio_template_id" SERIAL NOT NULL,
    "last_generated" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sample_portfolio_name" VARCHAR(255),
    "time_to_expiration" BIGINT NOT NULL,
    "risk_aptitude" SMALLINT,
    "bitcoin_focus" BOOLEAN NOT NULL DEFAULT false,
    "smallcap_focus" BOOLEAN NOT NULL DEFAULT false,
    "value_focus" BOOLEAN NOT NULL DEFAULT false,
    "momentum_focus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "portfolio_template_pkey" PRIMARY KEY ("portfolio_template_id")
);

-- CreateTable
CREATE TABLE "portfolio_templte_asset_allocation" (
    "portfolio_template_id" INTEGER NOT NULL,
    "ticker" VARCHAR(10) NOT NULL,
    "ticker_name" VARCHAR(255) NOT NULL,
    "percentage" DECIMAL(5,4) NOT NULL,

    CONSTRAINT "portfolio_templte_asset_allocation_pkey" PRIMARY KEY ("ticker","portfolio_template_id")
);

-- CreateTable
CREATE TABLE "watchlist" (
    "user_id" INTEGER NOT NULL,
    "ticker" VARCHAR(10) NOT NULL,
    "ticker_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "watchlist_pkey" PRIMARY KEY ("ticker","user_id")
);

-- CreateTable
CREATE TABLE "trade_q" (
    "trade_q_id" SERIAL NOT NULL,
    "portfolio_id" INTEGER NOT NULL,
    "ticker" VARCHAR(10) NOT NULL,
    "time_added_to_q" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trade_is_buy" BOOLEAN NOT NULL,
    "dollar_amount_to_trade" DECIMAL(10,4) NOT NULL,

    CONSTRAINT "trade_q_pkey" PRIMARY KEY ("trade_q_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "executed_trades" ADD CONSTRAINT "executed_trades_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("portfolio_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("portfolio_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "portfolio_snapshot" ADD CONSTRAINT "portfolio_snapshot_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("portfolio_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "portfolio_templte_asset_allocation" ADD CONSTRAINT "portfolio_templte_asset_allocation_portfolio_template_id_fkey" FOREIGN KEY ("portfolio_template_id") REFERENCES "portfolio_template"("portfolio_template_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
