import mongoose, { Document, Schema } from "mongoose";

export type MediaType = "image" | "video" | "document";
export type MediaCategory =
  | "admissions"
  | "academics"
  | "events"
  | "marketing"
  | "branding"
  | "other";

interface MediaFormatVariant {
  url: string;
  publicId?: string;
  size?: number;
}

interface MediaCompressionDetails {
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savedPercent: number;
}

export interface IMedia extends Document {
  institutionId: mongoose.Types.ObjectId;
  filename: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  type: MediaType;
  mimeType: string;
  size: number;
  folderPath: string;
  tags: string[];
  category: MediaCategory;
  altText?: string;
  formats?: {
    original: MediaFormatVariant;
    webp?: MediaFormatVariant;
    avif?: MediaFormatVariant;
  };
  compression?: MediaCompressionDetails;
  isAutoCategorized: boolean;
  usageCount: number;
  lastUsedAt?: Date | null;
  usedByPages: mongoose.Types.ObjectId[];
  uploadedAt: Date;
  uploadedBy: mongoose.Types.ObjectId;
}

const MediaSchema = new Schema<IMedia>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "document"],
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    folderPath: {
      type: String,
      default: "/",
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      enum: [
        "admissions",
        "academics",
        "events",
        "marketing",
        "branding",
        "other",
      ],
      default: "other",
      index: true,
    },
    altText: {
      type: String,
      default: "",
      trim: true,
    },
    formats: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    compression: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    isAutoCategorized: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    usedByPages: {
      type: [Schema.Types.ObjectId],
      ref: "Page",
      default: [],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "uploadedAt", updatedAt: false },
  },
);

// Indexes
MediaSchema.index({ institutionId: 1, uploadedAt: -1 });
MediaSchema.index({ institutionId: 1, folderPath: 1, uploadedAt: -1 });
MediaSchema.index({ institutionId: 1, type: 1, uploadedAt: -1 });
MediaSchema.index({ institutionId: 1, category: 1, uploadedAt: -1 });
MediaSchema.index({ institutionId: 1, filename: "text", tags: "text" });

export const Media = mongoose.model<IMedia>("Media", MediaSchema);
