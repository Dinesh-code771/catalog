import React, { useState } from 'react';
import { ArrowUpRight, Maximize2, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
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

  // Sample data for the chart
  const data = Array.from({ length: 100 }, (_, index) => {
    const basePrice = 63000;
    const randomFactor = Math.sin(index / 10) * 2000 + Math.random() * 1000;
    return {
      timestamp: new Date(Date.now() - (100 - index) * 3600000).toISOString(),
      price: basePrice + randomFactor,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-lg rounded border">
          <p className="text-sm font-medium">
            ${payload[0].value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(payload[0].payload.timestamp).toLocaleString()}
          </p>
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
          <div className="flex items-baseline gap-2">
            <h1 className="text-4xl font-bold">63,179.71</h1>
            <span className="text-gray-500">USD</span>
          </div>
          <div className="flex items-center gap-1 text-green-500">
            <ArrowUpRight size={20} />
            <span>+2,161.42 (3.54%)</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 -mb-px ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
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
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
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
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => {
                  return new Date(timestamp).toLocaleDateString();
                }}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={['dataMin - 1000', 'dataMax + 1000']}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;