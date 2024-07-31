import { createClient } from "redis";
import { Engine } from "./trade/Engine";

main();

async function main() {
  const engine = new Engine();
  const RedisClient = createClient();
  await RedisClient.connect();
  console.log(`connect to redis`);

  while (true) {
    const response = await RedisClient.rPop("message" as string);
    if (!response) {
    } else {
      engine.process(JSON.parse(response));
    }
  }
}
