"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const client = new pg_1.Client({
    user: "your_user",
    host: "localhost",
    database: "my_database",
    password: "your_password",
    port: 5432,
});
async function initializeDb() {
    await client.connect();
    await client.query(`DROP TABLE IF EXISTS "sol_price";
        CREATE TABLE "sol_price"(
        time    TIMESTAMP WITH TIME ZONE NOT NULL,
        price   DOUBLE PRECISION,
        currency_code   VARCHAR (10)
        );
        SELECT create_hypertable('sol_price', 'time', 'price', 2);
    `);
    await client.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m AS
    SELECT
        time_bucket('1 minuit', time) AS bucket,
        first(price, time) AS open,
        max(price) AS high,
        min(price) AS low,
        last(price, time) AS close,
        sum(volume) AS volume,
        currency_code
    FROM sol_prices
    GROUP BY bucket, currency_code;
`);
    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1h AS
        SELECT
            time_bucket('1 hour', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM sol_prices
        GROUP BY bucket, currency_code;
    `);
    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1w AS
        SELECT
            time_bucket('1 week', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM sol_prices
        GROUP BY bucket, currency_code;
    `);
    await client.end();
    console.log("Database initialized successfully");
}
initializeDb().catch(console.error);
