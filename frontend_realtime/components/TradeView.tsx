import { useEffect, useRef } from "react";
import { ChartManager } from "@/utils/ChartManager";
import { getKlines } from "@/utils/httpClient";
import { KLine } from "@/utils/types";
import { error, timeStamp } from "console";

export function TradeView({ market, }: { market: string }) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartManagerRef = useRef<ChartManager>(null);


    useEffect(() => {
        const init = async () => {
            let KLineData: KLine[] = [];
            try {
                KLineData = await getKlines(market, "1h", Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 7) / 1000), Math.floor(new Date().getTime() / 1000));
            } catch (error) { }

            if (chartRef) {
                if (chartManagerRef.current) {
                    chartManagerRef.current.destroy();
                }
                const chartManager = new ChartManager(
                    chartRef.current,
                    [
                        ...KLineData?.map((x) => ({
                            close: parseFloat(x.close),
                            high: parseFloat(x.high),
                            low: parseFloat(x.low),
                            open: parseFloat(x.open),
                            timestamp: new Date(x.end),
                        })),
                    ].sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1)) || [],
                    {
                        background: "#0e0f14",
                        color: "white",
                    }
                );
                // @ts-ignore
                chartManagerRef.current = chartManager;
            }
        };
        init();
    }, [market, chartRef]);

    return (
        <div ref={chartRef} className="h-[520px] w-full mt-1"> </div>
    );
}
