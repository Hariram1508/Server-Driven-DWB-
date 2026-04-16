"use client";

import React, { useEffect, useState, use } from "react";
import { Editor, Frame, Element } from "@craftjs/core";
import { ComponentMapper } from "@/components/renderer/ComponentMapper";
import * as pagesApi from "@/lib/api/pages.api";
import * as publicPagesApi from "@/lib/api/public.api";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "sonner";
import { Container } from "@/components/builder-components/Container";
import { Edit3 } from "lucide-react";
import { Page } from "@/lib/types/page.types";
import { SafeHTMLRenderer } from "@/components/editor/SafeHTMLRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Renders AI-generated HTML in a perfectly isolated full-page viewport ─────
// Navigation links inside the iframe are intercepted by SafeHTMLRenderer's
// script and sent to window.top so the full Next.js app navigates properly.
const FullPageRenderer = ({ html }: { html: string }) => (
  <div className="fixed inset-0 w-screen h-screen bg-white overflow-hidden">
    <SafeHTMLRenderer html={html} fullPage className="w-full h-full" />
  </div>
);

export default function DynamicPage({ params }: PageProps) {
  const { slug } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [pageData, setPageData] = useState<any>(null);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProjectMissingPage, setIsProjectMissingPage] = useState(false);

  const normalizedSlug = decodeURIComponent(slug || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  useEffect(() => {
    if (authLoading) return;

    // Reset immediately so the old page never flashes while the new one loads
    setLoading(true);
    setPageData(null);
    setIsProjectMissingPage(false);

    const fetchData = async () => {
      try {
        const institutionId = user?.institutionId;
        let data;
        let isPublicPage = true;

        try {
          if (!institutionId) {
            throw new Error("PROJECT_SCOPE_REQUIRED");
          }

          data = await publicPagesApi.getPublishedPageBySlug(
            normalizedSlug,
            institutionId,
          );
        } catch (publicError) {
          const canUsePrivatePreview =
            !!user &&
            (user.role === "admin" ||
              user.role === "editor" ||
              user.role === "super-admin") &&
            user.institutionId;

          if (!canUsePrivatePreview) {
            throw publicError;
          }

          data = await pagesApi.getPageBySlug(
            normalizedSlug,
            user.institutionId,
          );
          isPublicPage = false;
        }

        setPageData(data);

        // Only fetch all pages for block-mode (HTML pages have their own navbar)
        if (!data?.useHtml) {
          const pages = isPublicPage
            ? await pagesApi.getPublishedPages(undefined)
            : await pagesApi.getAllPages();
          setAllPages(pages);
        }
      } catch (error) {
        console.error("Failed to fetch page:", error);
        setIsProjectMissingPage(true);
        toast.error("Page not found in this project");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-gray-500 font-medium">Loading your website...</p>
        </div>
      </div>
    );
  }

  if (isProjectMissingPage) {
    const canCreate =
      !!user &&
      (user.role === "admin" ||
        user.role === "editor" ||
        user.role === "super-admin");

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-8 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3">
            Project Scope Protection
          </p>
          <h1 className="text-2xl font-black text-gray-900 mb-3">
            Page Not Found In This Project
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            The link{" "}
            <span className="font-mono text-gray-700">/{normalizedSlug}</span>{" "}
            does not belong to your current project pages. Cross-project
            redirects are blocked.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/dashboard"
              className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold inline-flex items-center"
            >
              Go To Dashboard
            </a>
            {canCreate && (
              <a
                href="/dashboard"
                className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center"
              >
                Create This Page
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = !!(
    user &&
    (user.role === "admin" ||
      user.role === "editor" ||
      user.role === "super-admin")
  );

  // ── HTML mode (AI-generated full page) ───────────────────────────────────
  if (pageData?.useHtml && pageData?.htmlContent) {
    return <FullPageRenderer html={pageData.htmlContent} />;
  }

  // ── Admin shortcut to block editor ───────────────────────────────────────
  if (isAdmin && !pageData?.jsonConfig?.ROOT) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto">
            <Edit3 className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Open in Editor</h2>
          <a
            href={`/edit/${slug}`}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105"
          >
            <Edit3 className="w-4 h-4" />
            Open Editor
          </a>
        </div>
      </div>
    );
  }

  // ── Public CraftJS block view ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <Editor enabled={false} resolver={ComponentMapper}>
        <Frame
          data={
            pageData?.jsonConfig?.ROOT
              ? JSON.stringify(pageData.jsonConfig)
              : undefined
          }
        >
          <Element is={Container} canvas />
        </Frame>
      </Editor>
    </div>
  );
}
