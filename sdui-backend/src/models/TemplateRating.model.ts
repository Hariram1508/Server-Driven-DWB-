import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplateRating extends Document {
  templateId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  review: string;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateRatingSchema = new Schema<ITemplateRating>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: '',
      maxlength: 500,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one rating per user per template
TemplateRatingSchema.index({ templateId: 1, userId: 1 }, { unique: true });

export const TemplateRating = mongoose.model<ITemplateRating>('TemplateRating', TemplateRatingSchema);
