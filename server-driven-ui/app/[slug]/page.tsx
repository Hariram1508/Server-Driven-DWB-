import type { Metadata } from "next";
import PageClient from "./PageClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type RouteParams = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageRouteProps {
  params: RouteParams;
  searchParams?: SearchParams;
}

interface PageSeoPayload {
  name?: string;
  slug?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };
}

async function fetchPublishedPage(slug: string, institutionId?: string) {
  const url = new URL(`${API_BASE}/public/pages/${encodeURIComponent(slug)}`);

  if (institutionId) {
    url.searchParams.set("institutionId", institutionId);
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: institutionId ? { "x-institution-id": institutionId } : undefined,
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return (payload?.data ?? null) as PageSeoPayload | null;
}

function resolveSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function buildMetadata(page: PageSeoPayload | null, slug: string): Metadata {
  const title = page?.seo?.metaTitle || page?.name || slug;
  const description =
    page?.seo?.metaDescription || `Published page for ${page?.name || slug}.`;

  return {
    title,
    description,
    alternates: page?.seo?.canonicalUrl
      ? {
          canonical: page.seo.canonicalUrl,
        }
      : undefined,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: PageRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const institutionId = resolvedSearchParams
    ? resolveSearchParam(resolvedSearchParams.institutionId)
    : undefined;

  const page = await fetchPublishedPage(slug, institutionId);
  return buildMetadata(page, slug);
}

export default async function DynamicPage({ params }: PageRouteProps) {
  const { slug } = await params;
  return <PageClient slug={slug} />;
}
