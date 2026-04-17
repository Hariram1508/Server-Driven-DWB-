import mongoose, { Document, Schema } from "mongoose";

export interface IFormSubmission extends Document {
  formType: "contact" | "inquiry" | "feedback";
  recipientEmail: string;
  subject: string;
  pageUrl?: string;
  fields: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const FormSubmissionSchema = new Schema<IFormSubmission>(
  {
    formType: {
      type: String,
      enum: ["contact", "inquiry", "feedback"],
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    pageUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    fields: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

FormSubmissionSchema.index({ recipientEmail: 1, createdAt: -1 });

export const FormSubmission = mongoose.model<IFormSubmission>(
  "FormSubmission",
  FormSubmissionSchema,
);
