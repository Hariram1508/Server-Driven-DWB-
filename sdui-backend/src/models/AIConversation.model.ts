import mongoose, { Document, Schema } from "mongoose";

export interface IAIConversationExchange {
  role: "user" | "assistant";
  message: string;
  model?: string;
  createdAt: Date;
}

export interface IAIConversation extends Document {
  institutionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  threadId: string;
  title?: string;
  exchanges: IAIConversationExchange[];
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationExchangeSchema = new Schema<IAIConversationExchange>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const AIConversationSchema = new Schema<IAIConversation>(
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
    threadId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    exchanges: {
      type: [AIConversationExchangeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

AIConversationSchema.index(
  { institutionId: 1, userId: 1, threadId: 1 },
  { unique: true },
);

export const AIConversation = mongoose.model<IAIConversation>(
  "AIConversation",
  AIConversationSchema,
);
