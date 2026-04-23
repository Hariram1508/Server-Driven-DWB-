export interface SiteSettings {
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
}

export interface InstitutionSettingsResponse {
  id: string;
  name: string;
  subdomain: string;
  settings: SiteSettings;
}

export interface PublicSettingsResponse {
  institutionId: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  settings: SiteSettings;
}

export interface SystemPerformanceMetrics {
  generatedAt: string;
  traffic: {
    requestsLast5m: number;
    requestsLast1h: number;
  };
  api: {
    avgLatencyMs5m: number;
    p95LatencyMs5m: number;
    errorRate5m: number;
  };
  slowRoutes: Array<{
    route: string;
    requests: number;
    avgLatencyMs: number;
    errorRate: number;
  }>;
}
