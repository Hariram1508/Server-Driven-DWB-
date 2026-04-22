export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentNode[];
}

export interface PageMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface PageSEOSettings {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface PageJSON {
  components: ComponentNode[];
  meta?: PageMeta;
}

export interface Page {
  _id: string;
  institutionId: string;
  name: string;
  slug: string;
  jsonConfig: PageJSON;
  seo?: PageSEOSettings;
  htmlContent?: string;
  useHtml: boolean;
  isPublished: boolean;
  scheduledPublishAt?: string | null;
  scheduledUnpublishAt?: string | null;
  lastPublishedAt?: string | null;
  version: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CreatePageData {
  name: string;
  slug: string;
  useHtml?: boolean;
}

export interface UpdatePageData {
  name?: string;
  slug?: string;
  jsonConfig?: PageJSON;
  seo?: PageSEOSettings;
  htmlContent?: string;
  useHtml?: boolean;
  orderIndex?: number;
  scheduledPublishAt?: string | null;
  scheduledUnpublishAt?: string | null;
  changes?: string;
}

export type BatchPageAction = "publish" | "unpublish" | "duplicate" | "delete";

export interface BatchPagePayload {
  action: BatchPageAction;
  pageIds: string[];
  duplicatePrefix?: string;
  duplicateSuffix?: string;
}
