import { ChatOpenAI } from "@langchain/openai";
import { getOpenRouterSettings } from "../services/configService.js";

export async function createOpenRouterModel() {
  const settings = await getOpenRouterSettings();
  if (!settings.isAiEnabled) throw new Error("AI predictions are currently disabled by an administrator");
  if (!settings.apiKey) throw new Error("OpenRouter API key is not configured");
  return new ChatOpenAI({
    apiKey: settings.apiKey,
    model: settings.selectedModel,
    temperature: 0.2,
    maxTokens: 1200,
    streamUsage: false,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:5173",
        "X-Title": process.env.OPENROUTER_APP_NAME || "CropWise"
      }
    }
  });
}
