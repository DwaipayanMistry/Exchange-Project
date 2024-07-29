export const BidTable = ({ bids }: { bids: [string, string][] }) => {
    let currentTotal = 0;
    const relevantBids = bids.slice(0, 15).filter(([_, quantity]) => parseFloat(quantity) !== 0); // Exclude bids with quantity 0
    const bidsWithTotal: [string, string, number][] = relevantBids.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
    const maxTotal = relevantBids.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);

    return (
        <div>
            {bidsWithTotal?.map(([price, quantity, total]) => (
                <Bid maxTotal={maxTotal} total={total} key={price} price={price} quantity={quantity} />
            ))}
        </div>
    );
};
function Bid({ price, quantity, total, maxTotal }: { price: string, quantity: string, total: number, maxTotal: number }) {
    return (
        <div className="flex relative w-full bg-transparent overflow-hidden">
            <div className="absolute top-0 left-0 h-full " style={{
                width: `${(100 * total) / maxTotal}%`, background: "rgba(1, 167, 129, 0.325)",
                transition: "width 0.3s ease-in-out",
            }}></div>
            <div className={`flex justify-between text-xs w-full`}>
                <div>
                    {price}
                </div>
                <div>
                    {quantity}
                </div>
                <div>
                    {total.toFixed(2)}
                </div>
            </div>
        </div>
    )
}