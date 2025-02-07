import React from "react";
import {
  AreaChart,
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
  maxPrice?: number;
  currentPrice?: number;
}

interface ChartComponentProps {
  data: DataPoint[];
  formatDate: (timestamp: string) => string;
  formatCurrency: (value: number) => string;
  CustomTooltip: React.FC<any>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  fixedPrice: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  data,
  formatDate,
  formatCurrency,
  CustomTooltip,
  isFullscreen,
  setIsFullscreen,
  fixedPrice,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 30, left: 60, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatDate}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          display={isFullscreen ? "block" : "none"}
        />
        <YAxis
          yAxisId="price"
          domain={["dataMin - 1000", "dataMax + 1000"]}
          tickFormatter={(value) => formatCurrency(value)}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          orientation="right"
          display={isFullscreen ? "block" : "none"}
        />
        <YAxis
          yAxisId="volume"
          orientation="left"
          domain={[0, "dataMax"]}
          tickFormatter={(value) => Math.round(value).toString()}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          display={isFullscreen ? "block" : "none"}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "#666", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <ReferenceLine
          y={fixedPrice}
          yAxisId="price"
          stroke="gray"
          strokeDasharray="3 3"
          label={{
            value: formatCurrency(fixedPrice),
            position: "right",
            fill: "gray",
            fontSize: 15,
          }}
        />
        {/* Price comparison lines */}
        <Area
          yAxisId="price"
          type="monotone"
          dataKey="maxPrice"
          stroke="#1a1a1a"
          strokeDasharray="5 5"
          fill="none"
          strokeWidth={1}
        />
        <Area
          yAxisId="price"
          type="monotone"
          dataKey="currentPrice"
          stroke="#3b82f6"
          strokeDasharray="5 5"
          fill="none"
          strokeWidth={1}
        />
        {/* Main price line */}
        <Area
          yAxisId="price"
          type="monotone"
          dataKey="price"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorPrice)"
          strokeWidth={2}
        />
        {/* Volume bars */}
        <Bar
          yAxisId="volume"
          dataKey="volume"
          fill="#e5e7eb"
          opacity={0.2}
          maxBarSize={5}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;
