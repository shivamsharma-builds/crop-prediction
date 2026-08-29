import { MapPin } from "lucide-react";
export function LocationVisualizer({ location }: { location: string }) {
  return <div className="section-card h-full p-3">
    <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-gray-800"><MapPin className="h-4 w-4 text-green-600"/>Location Visualizer</div>
    <div className="flex min-h-[108px] items-center justify-center overflow-hidden rounded-sm bg-gradient-to-b from-slate-100 to-green-50">
      {location ? <div className="px-5 text-center text-[10px] leading-4 text-gray-500"><MapPin className="mx-auto mb-1 h-6 w-6 text-green-500"/><div className="font-medium text-gray-700">{location}</div><div>Location preview ready</div></div> : <div className="px-5 text-center text-[10px] leading-4 text-gray-500">Enter a location or use current location to see map preview.</div>}
    </div>
  </div>;
}
