export interface Media {
  _id: string;
  institutionId: string;
  filename: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  type: "image" | "video" | "document";
  mimeType: string;
  size: number;
  folderPath: string;
  tags: string[];
  category:
    | "admissions"
    | "academics"
    | "events"
    | "marketing"
    | "branding"
    | "other";
  altText?: string;
  formats?: {
    original: {
      url: string;
      publicId?: string;
      size?: number;
    };
    webp?: {
      url: string;
    };
    avif?: {
      url: string;
    };
  };
  compression?: {
    originalSize: number;
    optimizedSize: number;
    savedBytes: number;
    savedPercent: number;
  };
  isAutoCategorized: boolean;
  usageCount: number;
  lastUsedAt?: string;
  usedByPages: string[];
  uploadedAt: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface MediaFolder {
  _id: string;
  institutionId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUsage {
  pageId: string;
  pageName: string;
  pageSlug: string;
}
