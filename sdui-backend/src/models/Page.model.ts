import mongoose, { Document, Schema } from "mongoose";
import { PageJSON } from "../types/page.types";

export interface IPage extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  jsonConfig: PageJSON;
  htmlContent?: string;
  useHtml: boolean;
  isPublished: boolean;
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

export const Page = mongoose.model<IPage>("Page", PageSchema);
