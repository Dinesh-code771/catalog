import React, { useEffect, useState } from "react";
import { ArrowUpRight, Maximize2, ArrowRight, X } from "lucide-react";

import ChartComponent from "./components/ChartComponent";
import PriceHeader from "./components/PriceHeader";

interface DataPoint {
  timestamp: string;
  price: number;
  volume: number;
}

function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [activeTab, setActiveTab] = useState("Chart");
  const [activeTimeframe, setActiveTimeframe] = useState("1w");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tabs = ["Summary", "Chart", "Statistics", "Analysis", "Settings"];
  const timeframes = [
    { label: "1d", value: "1d" },
    { label: "3d", value: "3d" },
    { label: "1w", value: "1w" },
    { label: "1m", value: "1m" },
    { label: "6m", value: "6m" },
    { label: "1y", value: "1y" },
    { label: "max", value: "max" },
  ];
  const fixedPrice = 64850.35; // Fixed price to be shown in the chart

  useEffect(() => {
    const generatedData = Array.from({ length: 100 }, (_, index) => {
      const basePrice = 63000;
      const randomFactor = Math.sin(index / 10) * 2000 + Math.random() * 1000;
      const volume = Math.random() * 100 + 20;

      return {
        timestamp: new Date(Date.now() - (100 - index) * 3600000).toISOString(),
        price: basePrice + randomFactor,
        volume: volume,
      };
    });
    setData(generatedData);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const priceData = payload.find((p: any) => p.dataKey === "price");
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">{label}</div>
          <div className="font-medium text-gray-900 mb-1">
            {formatCurrency(priceData.value)}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <PriceHeader />
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <ChartComponent
              data={data}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              CustomTooltip={CustomTooltip}
              isFullscreen={isFullscreen}
              setIsFullscreen={setIsFullscreen}
              fixedPrice={fixedPrice}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-5xl">
        {/* Price Header */}
        <PriceHeader />
        <div className="flex items-center border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 -mb-px ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Chart Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              <Maximize2 size={18} />
              <span>Fullscreen</span>
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
              <ArrowRight size={18} />
              <span>Compare</span>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {timeframes.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveTimeframe(value)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTimeframe === value
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative h-[400px] bg-white rounded-lg">
          <ChartComponent
            data={data}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            CustomTooltip={CustomTooltip}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            fixedPrice={fixedPrice}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
