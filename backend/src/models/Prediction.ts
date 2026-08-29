import mongoose, { type InferSchemaType } from "mongoose";

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null, index: true },
  inputs: {
    location: { type: String, required: true },
    desiredCrops: { type: String, default: "" },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    rainfall: { type: Number, required: true },
    nitrogen: { type: Number, required: true },
    phosphorus: { type: Number, required: true },
    potassium: { type: Number, required: true },
    ph: { type: Number, required: true },
    soilType: { type: String, default: "" },
    historicalYieldData: { type: String, default: "" },
    otherRelevantParameters: { type: String, default: "" }
  },
  recommendedCrop: { type: String, required: true, index: true },
  confidenceScore: { type: Number, required: true, min: 0, max: 100 },
  aiAnalysis: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

predictionSchema.index({ createdAt: -1 });
predictionSchema.index({ recommendedCrop: 1, createdAt: -1 });

export type PredictionDocument = InferSchemaType<typeof predictionSchema> & { _id: mongoose.Types.ObjectId };
export const Prediction = mongoose.model("Prediction", predictionSchema);
