import mongoose, { Document, Schema } from "mongoose";

export interface IInstitution extends Document {
  name: string;
  email: string;
  passwordHash: string;
  domain?: string;
  subdomain: string;
  settings: {
    siteName?: string;
    tagline?: string;
    logo?: string;
    favicon?: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background?: string;
      text?: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    social?: {
      facebook?: string;
      instagram?: string;
      x?: string;
      linkedin?: string;
      youtube?: string;
    };
    analytics?: {
      googleAnalyticsId?: string;
    };
    customDomain?: {
      domain?: string;
      sslEnabled?: boolean;
      sslAutoRenew?: boolean;
    };
    email?: {
      notificationsEnabled?: boolean;
      smtpHost?: string;
      smtpPort?: number;
      smtpSecure?: boolean;
      smtpUser?: string;
      smtpFromEmail?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      trim: true,
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    settings: {
      siteName: {
        type: String,
        trim: true,
        default: "",
      },
      tagline: {
        type: String,
        trim: true,
        default: "",
      },
      logo: String,
      favicon: {
        type: String,
        trim: true,
        default: "",
      },
      colors: {
        primary: {
          type: String,
          default: "#3B82F6",
        },
        secondary: {
          type: String,
          default: "#10B981",
        },
        accent: {
          type: String,
          default: "#F59E0B",
        },
        background: {
          type: String,
          default: "#FFFFFF",
        },
        text: {
          type: String,
          default: "#0F172A",
        },
      },
      fonts: {
        heading: {
          type: String,
          default: "Inter",
        },
        body: {
          type: String,
          default: "Inter",
        },
      },
      social: {
        facebook: {
          type: String,
          trim: true,
          default: "",
        },
        instagram: {
          type: String,
          trim: true,
          default: "",
        },
        x: {
          type: String,
          trim: true,
          default: "",
        },
        linkedin: {
          type: String,
          trim: true,
          default: "",
        },
        youtube: {
          type: String,
          trim: true,
          default: "",
        },
      },
      analytics: {
        googleAnalyticsId: {
          type: String,
          trim: true,
          default: "",
        },
      },
      customDomain: {
        domain: {
          type: String,
          trim: true,
          default: "",
        },
        sslEnabled: {
          type: Boolean,
          default: true,
        },
        sslAutoRenew: {
          type: Boolean,
          default: true,
        },
      },
      email: {
        notificationsEnabled: {
          type: Boolean,
          default: true,
        },
        smtpHost: {
          type: String,
          trim: true,
          default: "",
        },
        smtpPort: {
          type: Number,
          default: 587,
        },
        smtpSecure: {
          type: Boolean,
          default: false,
        },
        smtpUser: {
          type: String,
          trim: true,
          default: "",
        },
        smtpFromEmail: {
          type: String,
          trim: true,
          default: "",
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
// email and subdomain are indexed automatically by setting unique: true in the schema definition.

export const Institution = mongoose.model<IInstitution>(
  "Institution",
  InstitutionSchema,
);
