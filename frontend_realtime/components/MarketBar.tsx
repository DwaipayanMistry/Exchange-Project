"use client";
import { useEffect, useState } from "react";
import type { Ticker } from "@/utils/types";
import { getTicker } from "@/utils/httpClient";
import { SignalingManager } from "@/utils/SignalingManager";
export const MarketBar = ({ market }: { market: string }) => {
    const [ticker, setTicker] = useState<Ticker>();

    useEffect(() => {
        getTicker(market).then(setTicker);
        SignalingManager.getInstance().registerCallback("ticker", (data: Partial<Ticker>) => setTicker(prevTicker => ({
            firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? '',
            high: data?.high ?? prevTicker?.high ?? '',
            lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? '',
            low: data?.low ?? prevTicker?.low ?? '',
            priceChange: data?.priceChange ?? prevTicker?.priceChange ?? '',
            priceChangePercent: data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? '',
            quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? '',
            symbol: data?.symbol ?? prevTicker?.symbol ?? '',
            trades: data?.trades ?? prevTicker?.trades ?? '',
            volume: data?.volume ?? prevTicker?.volume ?? '',
        })), `TICKER-${market}`);
        SignalingManager.getInstance().sendMessage({ 'method': "SUBSCRIBE", 'params': [`ticker.${market}`] });

        return () => {
            SignalingManager.getInstance().deRegisterCallback("ticker", `TICKER-${market}`);
            SignalingManager.getInstance().sendMessage({ "method": "UNSUBSCRIBE", "params": [`ticker.${market}`] });
        }
    }, [market])

    return (
        <div>
            <div className="flex items-center flex-flow relative w-full overflow-hidden border-b border-s-slate-800">
                <div className="flex items-center justify-between flex-row no-scrollbar overflow-auto pr-4">
                    <Ticker market={market}></Ticker>
                    <div className="flex items-center flex-flow space-x-8 pl-4">
                        <div className="flex flex-col h-full justify-center">
                            <p className={`font-medium tabular-nums text-greenText text-md text-green-500`}>
                                ${ticker?.lastPrice}
                            </p>
                            <p className="font-medium text-sm tabular-nums">
                                ${ticker?.lastPrice}
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <p className={`font-medium text-sm text-slate-400`}>24H Change</p>
                            <p className={` font-medium tabular-nums leading-5 text-sm text-greenText 
                                ${Number(ticker?.priceChange) > 0 ? "text-green-500" : "text-red-500"}`}>
                                {Number(ticker?.priceChange) > 0 ? "+" : ""} {ticker?.priceChange} {Number(ticker?.priceChangePercent)?.toFixed(2)}%
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <p className={`font-medium text-xs text-slate-400`}>24H High</p>
                            <p className="text-sm font-medium tabular-nums leading-5">{ticker?.high}</p>
                        </div>
                        <button type="button" className="font-medium transition-opacity hover:cursor-pointer hover:opacity-80 text-base text-left" data-rac="">
                            <div className="flex flex-col">
                                <p className="text-sm font-medium text-slate-400">24H Low</p>
                                <p className="mt-1 text-sm font-medium leading-5 tabular-nums">{ticker?.volume}</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};
function Ticker({ market }: { market: string }) {
    return <div className="flex h-[60] shrink-0 space-x-4">
        <div className="flex flex-row reflex ml-2 -mr-4">
            <img alt="SOLANA Logo" loading="lazy" decoding="async" data-nimg='1'
                className="z-10 rounded-full h-6 mt-4 w-6 outline-baseBackgroundL2" src="/sol.webp"></img>
            <img alt="USDC_Logo" loading="lazy" decoding="async" data-nimg='1'
                className="h-6 w-6 -ml-2 mt-2 mt-4 rounded-full" src="/usdc.webp"></img>
        </div>
        <button type="button" className="react-aria-Button" data-rac="">
            <div className="flex justify-between items-center flex-row cursor-pointer rounded-lg p-3 hover:opacity-80">
                <div className="flex flex-row items-center gap-2 undefined">
                    <div className="flex flex-row relative">
                        <p className="font-medium text-sm undefined">{market.replace("_", "/")}</p>
                    </div>
                </div>
            </div>
        </button>
    </div>
}