import { SystemConfig } from "../models/SystemConfig.js";
import { env } from "../config/env.js";
import { decryptSecret, encryptSecret, maskSecret } from "../utils/crypto.js";

export async function getSystemConfig() {
  const config = await SystemConfig.findOneAndUpdate(
    { singletonKey: "default" },
    {
      $setOnInsert: {
        singletonKey: "default",
        openRouterApiKey: env.OPENROUTER_API_KEY ? encryptSecret(env.OPENROUTER_API_KEY) : "",
        isAiEnabled: true,
        selectedModel: env.OPENROUTER_MODEL
      }
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );
  return config;
}

export async function getOpenRouterSettings() {
  const config = await getSystemConfig();
  let apiKey = env.OPENROUTER_API_KEY;

  if (config.openRouterApiKey) {
    try {
      apiKey = decryptSecret(config.openRouterApiKey);
    } catch {
      // A config encrypted with an old CONFIG_ENCRYPTION_KEY should not take
      // the whole API down. The admin can replace the key and re-encrypt it.
      console.warn("Stored OpenRouter key could not be decrypted; using OPENROUTER_API_KEY fallback.");
    }
  }

  return {
    apiKey,
    selectedModel: config.selectedModel || env.OPENROUTER_MODEL,
    isAiEnabled: config.isAiEnabled
  };
}

export async function updateSystemConfig(input: { apiKey?: string; isAiEnabled?: boolean; selectedModel?: string }) {
  const config = await getSystemConfig();
  if (typeof input.apiKey === "string") config.openRouterApiKey = encryptSecret(input.apiKey.trim());
  if (typeof input.isAiEnabled === "boolean") config.isAiEnabled = input.isAiEnabled;
  if (typeof input.selectedModel === "string" && input.selectedModel.trim()) config.selectedModel = input.selectedModel.trim();
  await config.save();
  const settings = await getOpenRouterSettings();
  return { isAiEnabled: settings.isAiEnabled, selectedModel: settings.selectedModel, apiKeyMasked: maskSecret(settings.apiKey) };
}

export async function getPublicSystemStatus() {
  const settings = await getOpenRouterSettings();
  return { isAiEnabled: settings.isAiEnabled, selectedModel: settings.selectedModel };
}
