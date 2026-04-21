import mongoose, { Document, Schema } from "mongoose";

export interface IComplianceAudit extends Document {
  institutionId: mongoose.Types.ObjectId;
  pageId?: mongoose.Types.ObjectId;
  pageName?: string;
  pageSlug?: string;
  eventType:
    | "validation"
    | "publish"
    | "publish-blocked"
    | "unpublish"
    | "fix-suggestion";
  severity: "info" | "warning" | "critical";
  message: string;
  details?: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceAuditSchema = new Schema<IComplianceAudit>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      index: true,
    },
    pageName: {
      type: String,
      trim: true,
    },
    pageSlug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    eventType: {
      type: String,
      enum: [
        "validation",
        "publish",
        "publish-blocked",
        "unpublish",
        "fix-suggestion",
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

ComplianceAuditSchema.index({ institutionId: 1, createdAt: -1 });
ComplianceAuditSchema.index({ institutionId: 1, pageId: 1, createdAt: -1 });

export const ComplianceAudit = mongoose.model<IComplianceAudit>(
  "ComplianceAudit",
  ComplianceAuditSchema,
);
