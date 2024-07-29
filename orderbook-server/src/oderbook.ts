interface Order {
  price: number;
  quantity: number;
  orderId: string;
}

interface Bid extends Order {
  side: "bid";
}

interface Asks extends Order {
  side: "ask";
}

interface Orderbook {
  bids: Bid[];
  asks: Asks[];
}

export const orderbook: Orderbook = {
  bids: [],
  asks: [],
};

export const quantityBooks: {
  bids: { [price: number]: number };
  asks: { [price: number]: number };
} = {
  bids: {},
  asks: {},
};
