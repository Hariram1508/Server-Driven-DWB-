import mongoose, { Document, Schema } from "mongoose";

export interface IMediaFolder extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  path: string;
  parentPath: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaFolderSchema = new Schema<IMediaFolder>(
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
    path: {
      type: String,
      required: true,
      trim: true,
    },
    parentPath: {
      type: String,
      required: true,
      trim: true,
      default: "/",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

MediaFolderSchema.index({ institutionId: 1, path: 1 }, { unique: true });
MediaFolderSchema.index(
  { institutionId: 1, parentPath: 1, name: 1 },
  { unique: true },
);

export const MediaFolder = mongoose.model<IMediaFolder>(
  "MediaFolder",
  MediaFolderSchema,
);
