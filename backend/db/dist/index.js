"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const redis_1 = require("redis");
const pgClient = new pg_1.Client({
    user: "your_user",
    host: "localhost",
    database: "my_database",
    password: "your_password",
    port: 5432,
});
pgClient.connect();
async function main() {
    const redisClient = (0, redis_1.createClient)();
    await redisClient.connect();
    console.log("connected to redis");
    while (true) {
        const response = await redisClient.rPop("db_processor");
        if (!response) {
        }
        else {
            const data = JSON.parse(response);
            if (data.type === "TRADE_ADDED") {
                console.log("adding data");
                console.log(data);
                const price = data.data.price;
                const timestamp = new Date(data.data.timestamp);
                const query = 'INSERT INTO sol_prices (time, price) VALUES ($1, $2)';
                const values = [timestamp, price];
                await pgClient.query(query, values);
            }
        }
    }
}
main();
