import axios from "axios";

const BASE_URL = "http://localhost:3000";

const TOTAL_BIDS = 25;
const TOTAL_ASK = 25;
const MARKET = "TATA_INR";
const USER_ID = "5";

async function main() {
    const price =1000+Math.random()*10;
    const openOrders= await axios.get(`${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${MARKET}`);
    // cancels bids when more than available
    const cancelledBids =await cancelBids
}