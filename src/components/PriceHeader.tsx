import { ArrowUpRight } from "lucide-react";

export default function PriceHeader() {
  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <h1 className="text-5xl font-bold">63,179.71</h1>
      <span className="text-gray-500">USD</span>
    </div>
    <div className="flex items-center mt-3 gap-1 text-green-500">
      <ArrowUpRight size={20} />
        <span>+2,161.42 (3.54%)</span>
      </div>
    </div>
  );
}
