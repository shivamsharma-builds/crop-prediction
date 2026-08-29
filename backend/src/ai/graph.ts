import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { createOpenRouterModel } from "./model.js";
import { cropSelectionPrompt, cultivationAdvicePrompt } from "./prompts.js";
import { parseJsonObject } from "./parsing.js";
import { deterministicCropSelection, fallbackAdvice } from "./fallbacks.js";
import type { CropCandidate, CultivationAdvice, PredictionInput } from "./types.js";

type GraphState = {
  input: PredictionInput;
  recommendedCrop?: string;
  confidenceScore?: number;
  alternatives?: CropCandidate[];
  selectionRationale?: string;
  advice?: CultivationAdvice;
  usedFallback?: boolean;
};

const State = Annotation.Root({
  input: Annotation<PredictionInput>(),
  recommendedCrop: Annotation<string>(),
  confidenceScore: Annotation<number>(),
  alternatives: Annotation<CropCandidate[]>(),
  selectionRationale: Annotation<string>(),
  advice: Annotation<CultivationAdvice>(),
  usedFallback: Annotation<boolean>()
});

async function cropSelectionNode(state: GraphState) {
  try {
    const model = await createOpenRouterModel();
    const response = await model.invoke(cropSelectionPrompt(state.input));
    const parsed = parseJsonObject<{ recommendedCrop: string; confidenceScore: number; alternatives: CropCandidate[]; selectionRationale: string }>(response.content);
    if (!parsed.recommendedCrop) throw new Error("Missing crop recommendation");
    return {
      recommendedCrop: parsed.recommendedCrop,
      confidenceScore: Math.max(0, Math.min(100, Math.round(Number(parsed.confidenceScore) || 50))),
      alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives.slice(0, 3) : [],
      selectionRationale: parsed.selectionRationale || "Selected from the supplied farm parameters.",
      usedFallback: false
    };
  } catch (error) {
    console.warn("Crop selection node falling back:", error instanceof Error ? error.message : error);
    return { ...deterministicCropSelection(state.input), usedFallback: true };
  }
}

async function cultivationAdviceNode(state: GraphState) {
  const crop = state.recommendedCrop || "Maize";
  try {
    const model = await createOpenRouterModel();
    const response = await model.invoke(cultivationAdvicePrompt(state.input, crop, state.selectionRationale || ""));
    const parsed = parseJsonObject<CultivationAdvice>(response.content);
    return { advice: parsed };
  } catch (error) {
    console.warn("Cultivation advice node falling back:", error instanceof Error ? error.message : error);
    return { advice: fallbackAdvice(state.input, crop), usedFallback: true };
  }
}

const graph = new StateGraph(State)
  .addNode("cropSelection", cropSelectionNode)
  .addNode("cultivationAdvice", cultivationAdviceNode)
  .addEdge(START, "cropSelection")
  .addEdge("cropSelection", "cultivationAdvice")
  .addEdge("cultivationAdvice", END)
  .compile();

export async function runCropGraph(input: PredictionInput) {
  const result = await graph.invoke({ input });
  return {
    recommendedCrop: result.recommendedCrop,
    confidenceScore: result.confidenceScore,
    alternatives: result.alternatives,
    selectionRationale: result.selectionRationale,
    advice: result.advice,
    usedFallback: result.usedFallback ?? false
  };
}

export { graph };
