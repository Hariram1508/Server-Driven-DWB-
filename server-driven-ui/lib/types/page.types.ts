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
  htmlContent?: string;
  useHtml: boolean;
  isPublished: boolean;
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
  htmlContent?: string;
  useHtml?: boolean;
  orderIndex?: number;
  changes?: string;
}
