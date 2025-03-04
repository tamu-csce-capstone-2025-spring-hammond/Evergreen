# Some sample SQL queries on this database:


```sql
SELECT users.user_name, portfolio.portfolio_name, portfolio.portfolio_id from users RIGHT JOIN portfolio ON users.user_id=portfolio.user_id;
```

```sql
SELECT users.user_name, portfolio.portfolio_name, trades.ticker, trades.amount_traded from users RIGHT JOIN portfolio ON users.user_id=portfolio.user_id RIGHT JOIN trades ON portfolio.portfolio_id=trades.portfolio_id;
```

```sql
SELECT 'DROP TABLE IF EXISTS "' || tablename || '" CASCADE;' FROM pg_tables where schemaname = 'public';
```