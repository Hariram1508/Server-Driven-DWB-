import mongoose, { Document, Schema } from 'mongoose';
import { PageJSON } from '../types/page.types';

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  jsonConfig: PageJSON;
  isPublic: boolean;
  tags: string[];
  createdBy?: mongoose.Types.ObjectId;
  viewCount: number;
  shareCount: number;
  ratingScore: number;
  ratingCount: number;
  isCustom: boolean;
  performance?: {
    loadTime?: number;
    renderTime?: number;
    bundleSize?: number;
    lastAnalyzed?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['homepage', 'about', 'courses', 'departments', 'contact', 'blog', 'events', 'custom'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    jsonConfig: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    ratingScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    performance: {
      type: {
        loadTime: Number,
        renderTime: Number,
        bundleSize: Number,
        lastAnalyzed: Date,
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TemplateSchema.index({ category: 1 });
TemplateSchema.index({ isPublic: 1 });
TemplateSchema.index({ createdBy: 1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ ratingScore: -1 });
TemplateSchema.index({ viewCount: -1 });

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
