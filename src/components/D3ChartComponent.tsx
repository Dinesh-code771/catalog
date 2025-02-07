import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  timestamp: Date;
  price: number;
  volume: number;
}

interface ChartComponentProps {
  data: DataPoint[];
  formatDate: (date: Date) => string;
  formatCurrency: (value: number) => string;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  fixedPrice: number;
}

export default function D3ChartComponent({
  data,
  formatDate,
  formatCurrency,
  isFullscreen = false,
  setIsFullscreen,
  fixedPrice,
}: ChartComponentProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 50, bottom: 60, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;
    const volumeHeight = height * 0.2;
    const priceHeight = height - volumeHeight;

    // Clear previous content
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d: DataPoint) => d.timestamp) as [Date, Date])
      .range([0, width]);

    const yPriceScale = d3
      .scaleLinear()
      .domain([
        (d3.min(data, (d: DataPoint) => d.price) as number) * 0.99,
        (d3.max(data, (d: DataPoint) => d.price) as number) * 1.01,
      ])
      .range([priceHeight, 0]);

    const yVolumeScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: DataPoint) => d.volume) as number])
      .range([height, height - volumeHeight]);

    // Add reference lines
    // const referenceLines = []; // 4 evenly spaced lines
    // g.selectAll(".reference-line")
    //   .data(referenceLines)
    //   .enter()
    //   .append("line")
    //   .attr("class", "reference-line")
    //   .attr("x1", (d: number) => width * d)
    //   .attr("x2", (d: number) => width * d)
    //   .attr("y1", 0)
    //   .attr("y2", height)
    //   .attr("stroke", "#e5e7eb")
    //   .attr("stroke-width", 1);

    // Create gradient
    const gradient = g
      .append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0")
      .attr("y1", "0")
      .attr("x2", "0")
      .attr("y2", "1");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.3);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0);

    // Area generator for price
    const area = d3
      .area<DataPoint>()
      .x((d) => xScale(d.timestamp))
      .y0(priceHeight)
      .y1((d) => yPriceScale(d.price))
      .curve(d3.curveMonotoneX);

    // Line generator for price
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yPriceScale(d.price))
      .curve(d3.curveMonotoneX);

    // Draw area
    g.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area)
      .attr("fill", "rgb(245 245 254)")
      .attr("fill-opacity", 0.3)
      .attr("spre", "rgb(245 245 254)");

    // Draw line
    g.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "rgb(75 64 238)")
      .attr("stroke-width", 2.3);

    // Draw volume bars
    g.selectAll(".volume-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "volume-bar")
      .attr("x", (d: DataPoint) => xScale(d.timestamp) - 2)
      .attr("y", (d: DataPoint) => yVolumeScale(d.volume))
      .attr("width", 4)
      .attr("height", (d: DataPoint) => height - yVolumeScale(d.volume))
      .attr("fill", "#e5e7eb")
      .attr("opacity", 0.5);

    // Add axes with fixed x-axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d: Date | d3.NumberValue) => formatDate(d as Date))
      .ticks(4);

    const yPriceAxis = d3
      .axisRight(yPriceScale)
      .tickFormat((d) => formatCurrency(d as number))
      .ticks(0);

    // Add x-axis grid
    g.append("g")
      .attr("class", "x-grid")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .call((g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        g.select(".domain").remove()
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("y2", -height)
          .attr("stroke-opacity", 0.1)
      );

    g.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${width},0)`)
      .call(yPriceAxis)
      .select(".domain")
      .remove();

    // Add tooltip functionality
    const tooltip = d3.select(tooltipRef.current);
    const bisect = d3.bisector<DataPoint, Date>((d) => d.timestamp).left;

    const mousemove = (event: MouseEvent) => {
      const [x, y] = d3.pointer(event);
      const x0 = xScale.invert(x);
      const i = bisect(data, x0, 1);

      // Bounds checking
      if (i <= 0 || i >= data.length) {
        tooltip.style("display", "none");
        g.selectAll(".hover-line").remove();
        g.selectAll(".hover-circle").remove();
        return;
      }

      const d0 = data[i - 1];
      const d1 = data[i];

      if (!d0 || !d1) {
        return;
      }

      const d =
        x0.getTime() - d0.timestamp.getTime() >
        d1.timestamp.getTime() - x0.getTime()
          ? d1
          : d0;

      // Move tooltip on both X and Y axis
      tooltip
        .style("display", "block")
        .style("position", "absolute") // Ensures correct positioning
        .style("left", `${event.pageX - (!isFullscreen ? 180 : -50)}px`)
        .style("top", `${event.pageY - (!isFullscreen ? 350 : 20)}px`)
        .style("pointer-events", "none") // Prevents flickering
        .html(`
        <div class="font-medium bg-black py-2 px-3 rounded-sm text-white">
          ${formatCurrency(d.price)}
        </div>
      `);
      // Remove old hover elements
      g.selectAll(".hover-line").remove();
      g.selectAll(".hover-circle").remove();

      // Vertical Line (X-axis movement)
      g.append("line")
        .attr("class", "hover-line")
        .attr("x1", xScale(d.timestamp))
        .attr("x2", xScale(d.timestamp))
        .attr("y1", margin.top)
        .attr("y2", height + margin.top)
        .attr("stroke", "#666")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

      // Horizontal Line (Y-axis movement)
      g.append("line")
        .attr("class", "hover-line")
        .attr("x1", margin.left)
        .attr("x2", width + margin.left)
        .attr("y1", yPriceScale(d.price))
        .attr("y2", yPriceScale(d.price))
        .attr("stroke", "#666")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

      // Circle marker on the line
      g.append("circle")
        .attr("class", "hover-circle")
        .attr("cx", xScale(d.timestamp))
        .attr("cy", yPriceScale(d.price))
        .attr("r", 4)
        .style("fill", "blue")
        .style("stroke", "white")
        .style("stroke-width", 1);
    };

    const mouseout = () => {
      tooltip.style("display", "none");
      g.selectAll(".hover-line").remove();
      g.selectAll(".hover-circle").remove();
    };

    // Apply interaction
    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);
  }, [data, isFullscreen]);

  return (
    <>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
      <div
        ref={tooltipRef}
        className="hidden absolute bg-white p-3 shadow-lg rounded-lg border border-gray-200"
        style={{ pointerEvents: "none" }}
      />

      <div
        className={`tooltip-content rounded-smn absolute ${
          isFullscreen ? "top-10 right-[60px]" : "top-10 right-[-60px]"
        } w-fit  text-white  rounded-sm`}
      >
        <p className=" bg-[#4b40ee] rounded-md text-[1rem] py-2 px-3 w-fit">
          {formatCurrency(data[data.length - 1]?.price)}
        </p>
      </div>
    </>
  );
}
