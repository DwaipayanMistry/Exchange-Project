import { DEPTH_UPDATE, TICKER_UPDATE } from "./trade/events";
import { ORDER_UPDATE, TRADE_ADDED } from "./types";
import { RedisClientType, createClient } from "redis";
import { WsMessage } from "./types/toWs";
import { MessageToApi } from "./types/toApi";

type DbMessage ={
      type: typeof TRADE_ADDED;
      data: {
        id: string;
        isBuyerMarker: boolean;
        price: string;
        quantity: string;
        quoteQuantity: string;
        timestamp: number;
        market: string;
      }
} | {
    type: typeof ORDER_UPDATE;
    data: {
      orderId: string;
      executedQty: number;
      market?: string;
      price?: string;
      quantity?: string;
      side?: "buy" | "sell";
    };
};

export class RedisManager {
  // publishMessage(arg0: string, arg1: { stream: string; data: { e: string; t: number; m: boolean; p: string; q: string; s: string; }; }) {
  //     throw new Error("Method not implemented.");
  // }
  private client: RedisClientType;
  private static instance: RedisManager;
  constructor() {
    this.client = createClient();
    this.client.connect();
  }
  /**
   * static getInstance
   */
  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }
  /**
     * pushMessage
message: DbMessage     */
  public pushMessage(message: DbMessage) {
    this.client.lPush("db_processor", JSON.stringify(message));
  }
  /**
   * publicMessage
   */
  public publishMessage(channel: string, message: WsMessage) {
    this.client.publish(channel, JSON.stringify(message));
  }
  public sendToApi(clientId: string, message: MessageToApi) {
    this.client.publish(clientId, JSON.stringify(message));
  }
}
