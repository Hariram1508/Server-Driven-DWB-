import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplateShare extends Document {
  templateId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId[];
  uniqueShareCode: string;
  accessLevel: 'view' | 'use' | 'edit';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateShareSchema = new Schema<ITemplateShare>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sharedWith: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    uniqueShareCode: {
      type: String,
      unique: true,
      required: true,
    },
    accessLevel: {
      type: String,
      enum: ['view', 'use', 'edit'],
      default: 'view',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TemplateShareSchema.index({ templateId: 1 });
TemplateShareSchema.index({ ownerId: 1 });
TemplateShareSchema.index({ uniqueShareCode: 1 });

export const TemplateShare = mongoose.model<ITemplateShare>('TemplateShare', TemplateShareSchema);
