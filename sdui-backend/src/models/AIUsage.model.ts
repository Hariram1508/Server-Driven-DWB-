import mongoose, { Document, Schema } from "mongoose";

export interface IAIUsage extends Document {
  institutionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  feature: string;
  provider: "anthropic" | "groq" | "openai" | "internal";
  modelName: string;
  promptChars: number;
  responseChars: number;
  inputTokensEstimated: number;
  outputTokensEstimated: number;
  estimatedCostUsd: number;
  cacheHit: boolean;
  latencyMs: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AIUsageSchema = new Schema<IAIUsage>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    feature: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["anthropic", "groq", "openai", "internal"],
      required: true,
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    promptChars: {
      type: Number,
      required: true,
      min: 0,
    },
    responseChars: {
      type: Number,
      required: true,
      min: 0,
    },
    inputTokensEstimated: {
      type: Number,
      required: true,
      min: 0,
    },
    outputTokensEstimated: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedCostUsd: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    cacheHit: {
      type: Boolean,
      default: false,
      index: true,
    },
    latencyMs: {
      type: Number,
      required: true,
      min: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

AIUsageSchema.index({ institutionId: 1, createdAt: -1 });
AIUsageSchema.index({ institutionId: 1, feature: 1, createdAt: -1 });

export const AIUsage = mongoose.model<IAIUsage>("AIUsage", AIUsageSchema);
