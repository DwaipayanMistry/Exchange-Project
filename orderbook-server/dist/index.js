"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const oderbook_1 = require("./oderbook");
const types_1 = require("./types");
const BASE_ASSET = "BTC";
const QUOTE_ASSET = "USD";
const PORT = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
let GLOBAL_TRADE_ID = 0;
app.post("/api/v1/order", (req, res) => {
    const order = types_1.orderInputSchema.safeParse(req.body);
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
    const { executedQty, fills } = fillOrder(orderId, price, quantity, side, kind);
    res.send({
        orderId,
        executedQty,
        fills,
    });
});
function getOrderId() {
    return (Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15));
}
function fillOrder(orderId, price, quantity, side, type) {
    const fills = [];
    const maxFillQuantity = getFillAmount(price, quantity, side);
    let executedQty = 0;
    if (side === "buy") {
        oderbook_1.orderbook.asks.sort();
        oderbook_1.orderbook.asks.forEach((o) => {
            if (o.price <= price && quantity > 0) {
                console.log("filling ask");
                const filledQuantity = Math.min(quantity, o.quantity);
                console.log(filledQuantity);
                o.quantity -= filledQuantity;
                oderbook_1.quantityBooks.asks[o.price] =
                    (oderbook_1.quantityBooks.asks[o.price] || 0) - filledQuantity;
                fills.push({
                    price: o.price,
                    qty: filledQuantity,
                    traderId: GLOBAL_TRADE_ID++,
                });
                executedQty += filledQuantity;
                quantity -= filledQuantity;
                if (o.quantity === 0) {
                    oderbook_1.orderbook.asks.splice(oderbook_1.orderbook.asks.indexOf(o), 1);
                }
                if (oderbook_1.quantityBooks.asks[price] === 0) {
                    delete oderbook_1.quantityBooks.asks[price];
                }
            }
        });
        // Place on the book if order not filled
        if (quantity != 0) {
            oderbook_1.orderbook.bids.push({
                price,
                quantity: quantity - executedQty,
                side: "bid",
                orderId,
            });
            oderbook_1.quantityBooks.bids[price] =
                (oderbook_1.quantityBooks.bids[price] || 0) + (quantity - executedQty);
        }
    }
    else {
        oderbook_1.orderbook.bids.forEach((o) => {
            if (o.price >= price && quantity > 0) {
                const filledQuantity = Math.min(quantity, o.quantity);
                o.quantity -= filledQuantity;
                oderbook_1.quantityBooks.bids[price] =
                    (oderbook_1.quantityBooks.bids[price] || 0) - filledQuantity;
                fills.push({
                    price: o.price,
                    qty: filledQuantity,
                    traderId: GLOBAL_TRADE_ID++,
                });
                executedQty += filledQuantity;
                quantity -= filledQuantity;
                if (o.quantity === 0) {
                    oderbook_1.orderbook.bids.splice(oderbook_1.orderbook.bids.indexOf(o), 1);
                }
                if (oderbook_1.quantityBooks.bids[price] === 0) {
                    delete oderbook_1.quantityBooks.bids[price];
                }
            }
        });
        // Place on the book if not filled
        if (quantity != 0) {
            oderbook_1.orderbook.asks.push({
                price,
                quantity: quantity,
                side: "ask",
                orderId,
            });
            oderbook_1.quantityBooks.asks[price] = oderbook_1.quantityBooks.asks[price] || 0 + quantity;
        }
    }
    return {
        status: "accepted",
        executedQty,
        fills,
    };
}
function getFillAmount(price, quantity, side) {
    let filled = 0;
    if (side === "buy") {
        oderbook_1.orderbook.asks.forEach((o) => {
            if (o.price < price) {
                filled += Math.min(quantity, o.quantity);
            }
        });
    }
    else {
        oderbook_1.orderbook.bids.forEach((o) => {
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
