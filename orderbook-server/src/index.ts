import express from "express";
import { orderbook, quantityBooks } from "./oderbook";
import { orderInputSchema } from "./types";
import { number } from "zod";

const BASE_ASSET = "BTC";
const QUOTE_ASSET = "USD";
const PORT = 3000;
const app = express();
app.use(express.json());
let GLOBAL_TRADE_ID = 0;

interface Fill {
  price: number;
  qty: number;
  traderId: number;
}

app.post("/api/v1/order", (req, res) => {
  const order = orderInputSchema.safeParse(req.body);
  if (!order.success) {
    res.status(400).send(order.error.message);
    return;
  }
  const orderId = getOrderId();
  const { baseAsset, quoteAsset, price, quantity, side, kind } = order.data;
  if (baseAsset !== BASE_ASSET || quoteAsset !== QUOTE_ASSET) {
    res.status(400).send("Invalid base or quota asset");
    return;
  }
  const { executedQty, fills } = fillOrder(
    orderId,
    price,
    quantity,
    side,
    kind
  );
  res.send({
    orderId,
    executedQty,
    fills,
  });
});

function getOrderId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function fillOrder(
  orderId: string,
  price: number,
  quantity: number,
  side: "buy" | "sell",
  type?: "ioc"
): { status: "rejected" | "accepted"; executedQty: number; fills: Fill[] } {
  const fills: Fill[] = [];
  const maxFillQuantity = getFillAmount(price, quantity, side);
  let executedQty = 0;

  if (side === "buy") {
    orderbook.asks.sort();
    orderbook.asks.forEach((o) => {
      if (o.price <= price && quantity > 0) {
        console.log("filling ask");
        const filledQuantity = Math.min(quantity, o.quantity);
        console.log(filledQuantity);
        o.quantity -= filledQuantity;
        quantityBooks.asks[o.price] =
          (quantityBooks.asks[o.price] || 0) - filledQuantity;
        fills.push({
          price: o.price,
          qty: filledQuantity,
          traderId: GLOBAL_TRADE_ID++,
        });
        executedQty += filledQuantity;
        quantity -= filledQuantity;
        if (o.quantity === 0) {
          orderbook.asks.splice(orderbook.asks.indexOf(o), 1);
        }
        if (quantityBooks.asks[price] === 0) {
          delete quantityBooks.asks[price];
        }
      }
    });
    // Place on the book if order not filled
    if (quantity != 0) {
      orderbook.bids.push({
        price,
        quantity: quantity - executedQty,
        side: "bid",
        orderId,
      });
      quantityBooks.bids[price] =
        (quantityBooks.bids[price] || 0) + (quantity - executedQty);
    }
  } else {
    orderbook.bids.forEach((o) => {
      if (o.price >= price && quantity > 0) {
        const filledQuantity = Math.min(quantity, o.quantity);
        o.quantity -= filledQuantity;
        quantityBooks.bids[price] =
          (quantityBooks.bids[price] || 0) - filledQuantity;
        fills.push({
          price: o.price,
          qty: filledQuantity,
          traderId: GLOBAL_TRADE_ID++,
        });
        executedQty += filledQuantity;
        quantity -= filledQuantity;
        if (o.quantity === 0) {
          orderbook.bids.splice(orderbook.bids.indexOf(o), 1);
        }
        if (quantityBooks.bids[price] === 0) {
          delete quantityBooks.bids[price];
        }
      }
    });
    // Place on the book if not filled
    if (quantity != 0) {
      orderbook.asks.push({
        price,
        quantity: quantity,
        side: "ask",
        orderId,
      });
      quantityBooks.asks[price] = quantityBooks.asks[price] || 0 + quantity;
    }
  }
  return {
    status: "accepted",
    executedQty,
    fills,
  };
}

function getFillAmount(
  price: number,
  quantity: number,
  side: "buy" | "sell"
): number {
  let filled = 0;
  if (side === "buy") {
    orderbook.asks.forEach((o) => {
      if (o.price < price) {
        filled += Math.min(quantity, o.quantity);
      }
    });
  } else {
    orderbook.bids.forEach((o) => {
      if (o.price > price) {
        filled += Math.min(quantity, o.quantity);
      }
    });
  }
  return filled;
}

app.listen(PORT, () => {
  console.log(`Listing on port number--->> ${PORT}`);
});
