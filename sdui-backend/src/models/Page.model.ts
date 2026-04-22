import mongoose, { Document, Schema } from "mongoose";
import { PageJSON } from "../types/page.types";

export interface IPage extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  jsonConfig: PageJSON;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };
  htmlContent?: string;
  useHtml: boolean;
  isPublished: boolean;
  scheduledPublishAt?: Date | null;
  scheduledUnpublishAt?: Date | null;
  lastPublishedAt?: Date | null;
  version: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId;
}

const PageSchema = new Schema<IPage>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    jsonConfig: {
      type: Schema.Types.Mixed,
      required: true,
      default: {
        components: [],
        meta: {
          title: "",
          description: "",
          keywords: [],
        },
      },
    },
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        default: "",
      },
      metaDescription: {
        type: String,
        trim: true,
        default: "",
      },
      canonicalUrl: {
        type: String,
        trim: true,
        default: "",
      },
    },
    htmlContent: {
      type: String,
    },
    useHtml: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    scheduledPublishAt: {
      type: Date,
      default: null,
    },
    scheduledUnpublishAt: {
      type: Date,
      default: null,
    },
    lastPublishedAt: {
      type: Date,
      default: null,
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    orderIndex: {
      type: Number,
      default: 0,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for unique slug per institution
PageSchema.index({ institutionId: 1, slug: 1 }, { unique: true });
PageSchema.index({ isPublished: 1 });
PageSchema.index({ institutionId: 1, scheduledPublishAt: 1 });
PageSchema.index({ institutionId: 1, scheduledUnpublishAt: 1 });

export const Page = mongoose.model<IPage>("Page", PageSchema);
