import { AlertTriangle, CheckCircle2, Droplets, FlaskConical, Gauge, Leaf, Sprout } from "lucide-react";
import type { PredictionResult } from "../types";

function AdviceCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) { return <div className="rounded border border-gray-200 bg-white p-3"><div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-gray-800">{icon}{title}</div><ul className="space-y-1.5">{items.map((item, i) => <li key={i} className="flex gap-1.5 text-[10px] leading-4 text-gray-600"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-green-500"/>{item}</li>)}</ul></div> }
export function PredictionResults({ result }: { result: PredictionResult }) {
  return <section className="mt-5 space-y-3">
    <div className="section-card overflow-hidden">
      <div className="border-b border-gray-100 bg-green-50/60 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-green-700"><CheckCircle2 className="h-4 w-4"/>AI Recommendation</div><div className="mt-1 text-2xl font-bold text-gray-900">{result.recommendedCrop}</div><p className="mt-1 max-w-2xl text-[10px] leading-4 text-gray-600">{result.selectionRationale}</p></div><div className="min-w-[120px] rounded border border-green-100 bg-white p-2.5 text-center"><Gauge className="mx-auto h-5 w-5 text-green-600"/><div className="mt-1 text-xl font-bold text-green-700">{result.confidenceScore}%</div><div className="text-[9px] text-gray-500">Confidence score</div></div></div></div>
      <div className="grid gap-3 p-3 sm:grid-cols-3">{result.alternatives.map(item => <div key={item.crop} className="rounded border border-gray-200 p-2.5"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold">{item.crop}</span><span className="text-[10px] font-medium text-green-700">{item.score}%</span></div><p className="mt-1 text-[9px] leading-4 text-gray-500">{item.rationale}</p></div>)}</div>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <AdviceCard title="Soil Advice" icon={<FlaskConical className="h-4 w-4 text-green-600"/>} items={result.advice.soil}/>
      <AdviceCard title="Irrigation" icon={<Droplets className="h-4 w-4 text-blue-500"/>} items={result.advice.irrigation}/>
      <AdviceCard title="Cultivation Plan" icon={<Sprout className="h-4 w-4 text-green-600"/>} items={result.advice.cultivation}/>
      <AdviceCard title="Risks & Checks" icon={<AlertTriangle className="h-4 w-4 text-amber-500"/>} items={result.advice.risks}/>
    </div>
    <div className="rounded border border-green-100 bg-green-50 p-3"><div className="flex gap-2"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-green-600"/><div><div className="text-[11px] font-semibold text-green-800">Summary</div><p className="mt-1 text-[10px] leading-4 text-green-900/75">{result.advice.summary}</p><ul className="mt-2 list-disc pl-4 text-[10px] leading-4 text-green-900/75">{result.advice.nextSteps.map((x,i)=><li key={i}>{x}</li>)}</ul></div></div></div>
  </section>;
}
