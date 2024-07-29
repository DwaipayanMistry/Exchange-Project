export const AskTable = ({ asks }: { asks: [string, string][] }) => {
    let currentTotal = 0;
    const relevantAsks = asks.slice(0, 15).filter(([_, quantity]) => parseFloat(quantity) !== 0); // Exclude asks with quantity 0
    relevantAsks.reverse();
    const asksWithTotal: [string, string, number][] = relevantAsks.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
    const maxTotal = relevantAsks.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);
    asksWithTotal.reverse();

    return (
        <div>
            {asksWithTotal.map(([price, quantity, total]) => (
                <Asks maxTotal={maxTotal} key={price} price={price} quantity={quantity} total={total} />
            ))}
        </div>
    );
};
function Asks({ price, quantity, total, maxTotal }: { price: string, quantity: string, total: number, maxTotal: number }) {
    return (
        <div className="flex relative w-full bg-transparent overflow-hidden">
            <div className="absolute top-0 left-0 h-full " style={{
                width: `${(100 * total) / maxTotal}%`, background: "rgba(228, 75, 68, 0.325)",
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