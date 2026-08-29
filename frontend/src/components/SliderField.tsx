import { useMemo } from "react";

type Props = { label: string; icon?: React.ReactNode; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void; left?: string; right?: string };
export function SliderField({ label, icon, value, min, max, step = 1, unit = "", onChange, left, right }: Props) {
  const pct = useMemo(() => ((value - min) / (max - min)) * 100, [value, min, max]);
  return <div className="space-y-1.5">
    <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-700">{icon}{label}</div><div className="text-[10px] font-medium text-green-700">{Number.isInteger(value) ? value : value.toFixed(2)}{unit}</div></div>
    <div className="relative"><div className="pointer-events-none absolute left-0 top-[6px] h-1 rounded-full bg-green-500" style={{ width: `${pct}%` }}/><input aria-label={label} className="range-input relative z-10" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}/></div>
    <div className="flex justify-between text-[8px] text-gray-500"><span>{left ?? `${min}${unit}`}</span><span>{right ?? `${max}${unit}`}</span></div>
  </div>;
}
