import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  FlaskConical,
  Gauge,
  Leaf,
  Sprout,
} from "lucide-react";
import type { PredictionResult } from "../types";

function AdviceCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
        {icon}
        {title}
      </div>

      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2 text-base leading-6 text-gray-600"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
            <span className="min-w-0 break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PredictionResults({
  result,
}: {
  result: PredictionResult;
}) {
  return (
    <section className="mt-6 space-y-4">
      {/* AI Recommendation */}
      <div className="section-card overflow-hidden">
        <div className="border-b border-gray-100 bg-green-50/60 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                AI Recommendation
              </div>

              <div className="mt-2 break-words text-3xl font-bold text-gray-900">
                {result.recommendedCrop}
              </div>

              <p className="mt-2 max-w-3xl break-words text-base leading-7 text-gray-600">
                {result.selectionRationale}
              </p>
            </div>

            {/* Confidence */}
            <div className="min-w-[140px] rounded-lg border border-green-100 bg-white p-4 text-center">
              <Gauge className="mx-auto h-6 w-6 text-green-600" />

              <div className="mt-2 text-2xl font-bold text-green-700">
                {result.confidenceScore}%
              </div>

              <div className="mt-1 text-sm text-gray-500">
                Confidence score
              </div>
            </div>
          </div>
        </div>

        {/* Alternative crops */}
        <div className="grid min-w-0 gap-3 p-4 sm:grid-cols-3 sm:p-5">
          {result.alternatives.map((item) => (
            <div
              key={item.crop}
              className="min-w-0 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words text-base font-semibold text-gray-800">
                  {item.crop}
                </span>

                <span className="shrink-0 text-base font-medium text-green-700">
                  {item.score}%
                </span>
              </div>

              <p className="mt-2 break-words text-sm leading-6 text-gray-500">
                {item.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Advice Cards */}
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <AdviceCard
          title="Soil Advice"
          icon={<FlaskConical className="h-5 w-5 text-green-600" />}
          items={result.advice.soil}
        />

        <AdviceCard
          title="Irrigation"
          icon={<Droplets className="h-5 w-5 text-blue-500" />}
          items={result.advice.irrigation}
        />

        <AdviceCard
          title="Cultivation Plan"
          icon={<Sprout className="h-5 w-5 text-green-600" />}
          items={result.advice.cultivation}
        />

        <AdviceCard
          title="Risks & Checks"
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          items={result.advice.risks}
        />
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-green-100 bg-green-50 p-4 sm:p-5">
        <div className="flex gap-3">
          <Leaf className="mt-1 h-5 w-5 shrink-0 text-green-600" />

          <div className="min-w-0">
            <div className="text-base font-semibold text-green-800">
              Summary
            </div>

            <p className="mt-2 break-words text-base leading-7 text-green-900/75">
              {result.advice.summary}
            </p>

            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-base leading-7 text-green-900/75">
              {result.advice.nextSteps.map((step, i) => (
                <li key={i} className="break-words">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}