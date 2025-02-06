import React, { useEffect, useState } from "react";
import { ArrowUpRight, Maximize2, ArrowRight } from "lucide-react";
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  timestamp: string;
  price: number;
  volume: number;
}

function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [activeTab, setActiveTab] = useState('Chart');
  const [activeTimeframe, setActiveTimeframe] = useState('1w');

  const tabs = ['Summary', 'Chart', 'Statistics', 'Analysis', 'Settings'];
  const timeframes = [
    { label: '1d', value: '1d' },
    { label: '3d', value: '3d' },
    { label: '1w', value: '1w' },
    { label: '1m', value: '1m' },
    { label: '6m', value: '6m' },
    { label: '1y', value: '1y' },
    { label: 'max', value: 'max' },
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        {/* Price Header */}
        <div className="mb-6">
          <div className="flex  gap-3">
            <h1 className="text-5xl leading-none text-secondary dark:text-secondaryDark">
              63,179.71
            </h1>
            <span className="text-gray-500">USD</span>
          </div>
          <div className="flex items-center mt-3 gap-1 text-green-500">
            <ArrowUpRight size={20} />
            <span>+2,161.42 (3.54%)</span>
          </div>
        </div>
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
            <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
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
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Y-Axis Price */}
              <YAxis
                yAxisId="price"
                domain={["dataMin - 1000", "dataMax + 500"]}
                tickFormatter={formatCurrency}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                orientation="right"
                display="none"
              />

              {/* X-Axis Volume */}

              {/* Y-Axis Volume (Reduced Max Height) */}
              <YAxis
                yAxisId="volume"
                domain={[0, "dataMax * 0.5"]} // Reduce max height of bars
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                hide
              />

              {/* Tooltip */}
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#666",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              {/* Reference Line for Fixed Price */}
              <ReferenceLine
                y={fixedPrice}
                yAxisId="price"
                stroke="gray"
                strokeDasharray="3 3"
                label={{
                  value: formatCurrency(fixedPrice),
                  position: "right",
                  fill: "gray",
                  fontSize: 12,
                }}
              />

              {/* Main Price Line */}
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={0.1}
              />

              {/* Volume Bars - Reduced Height */}
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="#e5e7eb"
                opacity={0.2}
                maxBarSize={5} // Reduce bar width
                barSize={5} // Keep bars thin
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
