import { useState } from "react";
import { LocateFixed, MapPin, Sprout, Thermometer, Droplets, CloudRain, FlaskConical, Leaf, Loader2, WandSparkles } from "lucide-react";
import type { PredictionInput } from "../types";
import { LocationVisualizer } from "./LocationVisualizer";
import { SliderField } from "./SliderField";

const defaults: PredictionInput = { location: "", desiredCrops: "", temperature: 25, humidity: 70, rainfall: 100, nitrogen: 50, phosphorus: 82, potassium: 50, ph: 6.6, soilType: "", historicalYieldData: "", otherRelevantParameters: "" };

export function CropForm({ onSubmit, loading }: { onSubmit: (input: PredictionInput) => Promise<void>; loading: boolean }) {
  const [form, setForm] = useState<PredictionInput>(defaults);
  const [locating, setLocating] = useState(false);
  const set = <K extends keyof PredictionInput>(key: K, value: PredictionInput[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const currentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => { set("location", `Coordinates: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`); setLocating(false); }, () => setLocating(false), { enableHighAccuracy: true, timeout: 12000 });
  };
  return <form onSubmit={e => { e.preventDefault(); void onSubmit(form); }} className="section-card shadow-soft">
    <div className="p-4 pb-3">
      <h2 className="text-[17px] font-semibold text-gray-900">Farm &amp; Location Data</h2>
      <p className="mt-1 text-[10px] leading-4 text-gray-500">Enter details about your farm. Use sliders for environmental and soil parameters. AI can estimate soil type and historical yield if left blank. Use <LocateFixed className="inline h-3 w-3 align-[-2px]"/> for current location and <WandSparkles className="inline h-3 w-3 align-[-2px]"/> to get AI-driven insights.</p>
    </div>
    <div className="space-y-3 px-4 pb-4">
      <div className="grid gap-3 md:grid-cols-[1.15fr_.85fr]">
        <div className="section-card p-3">
          <div className="flex items-center justify-between gap-2"><label className="label flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-green-600"/>Location</label><button type="button" onClick={currentLocation} className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-[9px] font-medium text-gray-600 hover:bg-gray-50"><LocateFixed className="h-3 w-3"/>{locating ? "Locating..." : "Use Current Location"}</button></div>
          <input className="field mt-2" value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g., Central Valley, California or Coimbatore" required />
          <p className="micro mt-1">Place name, address, or use button. Use ↻ to fetch climate &amp; soil.</p>
          <label className="label mt-3 flex items-center gap-1"><Sprout className="h-3.5 w-3.5 text-green-600"/>Desired Crops (Optional)</label>
          <input className="field mt-1" value={form.desiredCrops} onChange={e => set("desiredCrops", e.target.value)} placeholder="e.g., tomatoes, lettuce, strawberries" />
          <p className="micro mt-1">List specific crops you're interested in (comma-separated).</p>
        </div>
        <LocationVisualizer location={form.location}/>
      </div>

      <div className="section-card p-3">
        <div className="mb-3"><h3 className="text-[13px] font-semibold">Environmental Parameters</h3><p className="micro">Use sliders or fetch typical values based on location using ↻.</p></div>
        <div className="space-y-4">
          <SliderField label="Avg. Temperature (°C)" icon={<Thermometer className="h-3.5 w-3.5 text-green-600"/>} value={form.temperature} min={0} max={45} step={0.5} unit="°C" onChange={v => set("temperature", v)} left="0°C" right="45°C" />
          <SliderField label="Avg. Humidity (%)" icon={<Droplets className="h-3.5 w-3.5 text-green-600"/>} value={form.humidity} min={0} max={100} unit="%" onChange={v => set("humidity", v)} left="0%" right="100%" />
          <SliderField label="Avg. Monthly Rainfall (mm)" icon={<CloudRain className="h-3.5 w-3.5 text-green-600"/>} value={form.rainfall} min={0} max={300} unit="mm" onChange={v => set("rainfall", v)} left="0mm" right="300mm" />
        </div>
      </div>

      <div className="section-card p-3">
        <div className="mb-3"><h3 className="text-[13px] font-semibold">Soil Parameters</h3><p className="micro">Use sliders or fetch typical values based on location using ↻.</p></div>
        <div className="space-y-4">
          <SliderField label="Nitrogen (N) content (kg/ha)" icon={<FlaskConical className="h-3.5 w-3.5 text-green-600"/>} value={form.nitrogen} min={0} max={140} unit=" kg/ha" onChange={v => set("nitrogen", v)} left="0" right="140" />
          <SliderField label="Phosphorus (P) content (kg/ha)" icon={<Leaf className="h-3.5 w-3.5 text-green-600"/>} value={form.phosphorus} min={5} max={145} unit=" kg/ha" onChange={v => set("phosphorus", v)} left="5" right="145" />
          <SliderField label="Potassium (K) content (kg/ha)" icon={<Leaf className="h-3.5 w-3.5 text-green-600"/>} value={form.potassium} min={5} max={205} unit=" kg/ha" onChange={v => set("potassium", v)} left="5" right="205" />
          <SliderField label="pH value" icon={<FlaskConical className="h-3.5 w-3.5 text-green-600"/>} value={form.ph} min={3.5} max={10} step={0.01} onChange={v => set("ph", v)} left="3.50" right="10.00" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_120px]">
        <div><label className="label">Soil Type &amp; Appearance (Optional)</label><input className="field mt-1" value={form.soilType} onChange={e => set("soilType", e.target.value)} placeholder="e.g., Loam, Clay, Sandy, Dark Brown, Crumbly"/><p className="micro mt-1">Describe the soil type or appearance if known. AI will estimate if left blank.</p></div>
        <div className="overflow-hidden rounded border border-gray-200 bg-gradient-to-b from-gray-700 via-green-900 to-green-500"><div className="h-full min-h-[80px] w-full opacity-70" style={{backgroundImage:"repeating-linear-gradient(85deg, transparent 0 18px, rgba(255,255,255,.12) 19px 21px)"}}/></div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div><label className="label">Historical Yield Data (Optional)</label><textarea className="textarea-field mt-1" value={form.historicalYieldData} onChange={e => set("historicalYieldData", e.target.value)} placeholder="e.g., Corn: 5 tons/acre (2023), Soybeans: 2 tons/acre (2022)"/><p className="micro mt-1">Provide past yield data if available. AI estimates if blank.</p></div>
        <div><label className="label">Other Relevant Parameters (Optional)</label><textarea className="textarea-field mt-1" value={form.otherRelevantParameters} onChange={e => set("otherRelevantParameters", e.target.value)} placeholder="e.g., Water availability, specific pest issues, market prices, nearby industries"/><p className="micro mt-1">Include any other factors that might influence crop choice or yield.</p></div>
      </div>

      <button disabled={loading} className="flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-green-500 text-[12px] font-semibold text-white shadow-sm hover:bg-green-600 disabled:cursor-wait disabled:opacity-70">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <WandSparkles className="h-4 w-4"/>}{loading ? "Analyzing..." : "Predict Suitable Crops"}</button>
    </div>
  </form>;
}
