import mongoose, { type InferSchemaType } from "mongoose";

const systemConfigSchema = new mongoose.Schema({
  singletonKey: { type: String, unique: true, default: "default" },
  openRouterApiKey: { type: String, default: "" },
  isAiEnabled: { type: Boolean, default: true },
  selectedModel: { type: String, default: "openrouter/free" }
}, { timestamps: true });

export type SystemConfigDocument = InferSchemaType<typeof systemConfigSchema> & { _id: mongoose.Types.ObjectId };
export const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
