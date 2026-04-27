import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplateAnalytics extends Document {
  templateId: mongoose.Types.ObjectId;
  date: Date;
  views: number;
  uses: number;
  shares: number;
  averageRating: number;
  saveCount: number;
  duplicateCount: number;
  performanceMetrics?: {
    avgLoadTime: number;
    avgRenderTime: number;
  };
}

const TemplateAnalyticsSchema = new Schema<ITemplateAnalytics>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
    views: {
      type: Number,
      default: 0,
    },
    uses: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    saveCount: {
      type: Number,
      default: 0,
    },
    duplicateCount: {
      type: Number,
      default: 0,
    },
    performanceMetrics: {
      type: {
        avgLoadTime: Number,
        avgRenderTime: Number,
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TemplateAnalyticsSchema.index({ templateId: 1, date: -1 });
TemplateAnalyticsSchema.index({ templateId: 1 });

export const TemplateAnalytics = mongoose.model<ITemplateAnalytics>(
  'TemplateAnalytics',
  TemplateAnalyticsSchema
);
