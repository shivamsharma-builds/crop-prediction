import { MapPin } from "lucide-react";

type Props = {
  location: string;
  coordinates: { latitude: number; longitude: number } | null;
};

export function LocationVisualizer({ location, coordinates }: Props) {
  const mapSrc = coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.longitude - 0.08}%2C${coordinates.latitude - 0.06}%2C${coordinates.longitude + 0.08}%2C${coordinates.latitude + 0.06}&layer=mapnik&marker=${coordinates.latitude}%2C${coordinates.longitude}`
    : "";

  return (
    <div className="section-card overflow-hidden p-2 sm:p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-gray-800">
        <MapPin className="h-4 w-4 text-green-600" />
        Actual OpenStreetMap
      </div>
      {coordinates ? (
        <>
          <iframe
            title={`Map for ${location || "farm location"}`}
            src={mapSrc}
            className="h-[240px] w-full rounded-md border-0 sm:h-[300px]"
            loading="lazy"
          />
          <div className="flex items-center justify-between gap-2 px-1 pt-2 text-[9px] leading-4 text-gray-500">
            <span>{coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}</span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=15/${coordinates.latitude}/${coordinates.longitude}`}
              target="_blank" rel="noreferrer"
              className="font-semibold text-green-700 hover:underline"
            >
              Open full map
            </a>
          </div>
        </>
      ) : (
        <div className="flex h-[240px] items-center justify-center rounded-md bg-slate-100 px-5 text-center text-[10px] leading-4 text-gray-500 sm:h-[300px]">
          Enter a place or use your current location to show the actual map.
        </div>
      )}
    </div>
  );
}
