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

export interface PageConfig {
  jsonConfig: PageJSON;
  isPublished: boolean;
  version: string;
}
