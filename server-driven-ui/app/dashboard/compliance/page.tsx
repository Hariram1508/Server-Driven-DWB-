"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Filter,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
import { getComplianceAuditTrail, getComplianceReport } from "@/lib/api/ai.api";

type Severity = "all" | "critical" | "warning" | "info";
type Category = "all" | "AICTE" | "UGC" | "WCAG" | "SEO";

interface ComplianceReport {
  summary: {
    totalPages: number;
    publishedPages: number;
    complianceScore: number;
    criticalIssues: number;
    warnings: number;
  };
  pages: Array<{
    pageId: string;
    name: string;
    slug: string;
    score: number;
    canPublish: boolean;
    critical: number;
    warnings: number;
    checks: Array<{
      category: "AICTE" | "UGC" | "WCAG" | "SEO";
      status: "pass" | "warn" | "fail";
      message: string;
      fix?: string;
    }>;
  }>;
  auditTrail: Array<{
    id: string;
    pageName?: string;
    pageSlug?: string;
    eventType: string;
    severity: "info" | "warning" | "critical";
    message: string;
    createdAt: string;
  }>;
}

export default function ComplianceReportPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [loadingTrail, setLoadingTrail] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>("all");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [searchText, setSearchText] = useState("");
  const [auditTrailOverride, setAuditTrailOverride] = useState<
    ComplianceReport["auditTrail"] | null
  >(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    const loadReport = async () => {
      if (!user) return;

      setLoadingReport(true);
      try {
        const response = await getComplianceReport();
        setReport(response?.data ?? response ?? null);
      } catch (error) {
        console.error("Failed to fetch compliance report", error);
        toast.error("Failed to load compliance report");
      } finally {
        setLoadingReport(false);
      }
    };

    void loadReport();
  }, [user]);

  useEffect(() => {
    const loadAuditTrailForPage = async () => {
      if (!user || selectedPageId === "all") {
        setAuditTrailOverride(null);
        return;
      }

      setLoadingTrail(true);
      try {
        const response = await getComplianceAuditTrail(selectedPageId);
        const events = response?.data?.events ?? response?.events ?? [];
        setAuditTrailOverride(events);
      } catch (error) {
        console.error("Failed to fetch page audit trail", error);
        toast.error("Failed to load page audit trail");
      } finally {
        setLoadingTrail(false);
      }
    };

    void loadAuditTrailForPage();
  }, [selectedPageId, user]);

  const filteredPages = useMemo(() => {
    const pages = report?.pages ?? [];

    return pages.filter((page) => {
      if (selectedPageId !== "all" && page.pageId !== selectedPageId) {
        return false;
      }

      if (selectedSeverity === "critical" && page.critical === 0) {
        return false;
      }

      if (selectedSeverity === "warning" && page.warnings === 0) {
        return false;
      }

      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        if (
          !page.name.toLowerCase().includes(q) &&
          !page.slug.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [report?.pages, searchText, selectedPageId, selectedSeverity]);

  const detailRows = useMemo(() => {
    const rows: Array<{
      pageId: string;
      pageName: string;
      slug: string;
      category: "AICTE" | "UGC" | "WCAG" | "SEO";
      status: "pass" | "warn" | "fail";
      message: string;
      fix?: string;
    }> = [];

    for (const page of filteredPages) {
      for (const check of page.checks) {
        if (selectedCategory !== "all" && check.category !== selectedCategory) {
          continue;
        }

        if (selectedSeverity === "critical" && check.status !== "fail") {
          continue;
        }

        if (selectedSeverity === "warning" && check.status !== "warn") {
          continue;
        }

        if (selectedSeverity === "info" && check.status !== "pass") {
          continue;
        }

        rows.push({
          pageId: page.pageId,
          pageName: page.name,
          slug: page.slug,
          category: check.category,
          status: check.status,
          message: check.message,
          fix: check.fix,
        });
      }
    }

    return rows;
  }, [filteredPages, selectedCategory, selectedSeverity]);

  const auditRows = useMemo(() => {
    const source = auditTrailOverride ?? report?.auditTrail ?? [];

    return source.filter((row) => {
      if (selectedSeverity !== "all" && row.severity !== selectedSeverity) {
        return false;
      }

      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const text =
          `${row.pageName || ""} ${row.pageSlug || ""} ${row.message}`.toLowerCase();
        if (!text.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [auditTrailOverride, report?.auditTrail, searchText, selectedSeverity]);

  const exportJson = () => {
    if (!report) return;

    const payload = {
      exportedAt: new Date().toISOString(),
      filters: {
        pageId: selectedPageId,
        severity: selectedSeverity,
        category: selectedCategory,
        searchText,
      },
      summary: report.summary,
      details: detailRows,
      auditTrail: auditRows,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `compliance-report-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Compliance JSON exported");
  };

  const exportCsv = () => {
    const header = ["pageName", "slug", "category", "status", "message", "fix"];

    const escape = (value: string) => `"${String(value).replace(/"/g, '""')}"`;

    const rows = detailRows.map((row) =>
      [
        row.pageName,
        row.slug,
        row.category,
        row.status,
        row.message,
        row.fix || "",
      ]
        .map(escape)
        .join(","),
    );

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `compliance-details-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Compliance CSV exported");
  };

  if (isLoading || loadingReport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-sky-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-500">
            Loading compliance report...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-sky-700 mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Compliance Report Suite
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              AICTE, UGC, WCAG 2.1 AA, SEO with pre-publish validation evidence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCsv}
              className="h-11 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={exportJson}
              className="h-11 px-4 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        {report ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Overall Score
              </p>
              <p className="text-3xl font-black text-gray-900 mt-2">
                {report.summary.complianceScore}%
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Total Pages
              </p>
              <p className="text-3xl font-black text-gray-900 mt-2">
                {report.summary.totalPages}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-red-100 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-red-400">
                Critical Issues
              </p>
              <p className="text-3xl font-black text-red-600 mt-2">
                {report.summary.criticalIssues}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-amber-100 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-500">
                Warnings
              </p>
              <p className="text-3xl font-black text-amber-600 mt-2">
                {report.summary.warnings}
              </p>
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-sky-600" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
              Filters
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={selectedPageId}
              onChange={(event) => setSelectedPageId(event.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"
              title="Filter by page"
            >
              <option value="all">All Pages</option>
              {(report?.pages || []).map((page) => (
                <option key={page.pageId} value={page.pageId}>
                  {page.name}
                </option>
              ))}
            </select>
            <select
              value={selectedSeverity}
              onChange={(event) =>
                setSelectedSeverity(event.target.value as Severity)
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"
              title="Filter by severity"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info/Pass</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value as Category)
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"
              title="Filter by category"
            >
              <option value="all">All Category</option>
              <option value="AICTE">AICTE</option>
              <option value="UGC">UGC</option>
              <option value="WCAG">WCAG</option>
              <option value="SEO">SEO</option>
            </select>
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"
              placeholder="Search page/message"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
                Validation Details
              </h2>
              <span className="text-xs font-bold text-gray-400">
                {detailRows.length} rows
              </span>
            </div>
            <div className="max-h-120 overflow-y-auto divide-y divide-gray-100">
              {detailRows.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  No rows for selected filters.
                </div>
              ) : (
                detailRows.map((row, index) => (
                  <div
                    key={`${row.pageId}-${row.category}-${index}`}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {row.pageName}
                        </p>
                        <p className="text-xs text-gray-500">/{row.slug}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                            row.status === "fail"
                              ? "bg-red-100 text-red-700"
                              : row.status === "warn"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {row.status}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {row.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                      {row.message}
                    </p>
                    {row.fix ? (
                      <p className="text-xs text-sky-700 mt-2 leading-relaxed">
                        Fix: {row.fix}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
                Audit Trail
              </h2>
              <span className="text-xs font-bold text-gray-400">
                {loadingTrail ? "Loading..." : `${auditRows.length} events`}
              </span>
            </div>
            <div className="max-h-120 overflow-y-auto divide-y divide-gray-100">
              {auditRows.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  No events for selected filters.
                </div>
              ) : (
                auditRows.map((event) => (
                  <div key={event.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {event.pageName || event.pageSlug || "Compliance"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {event.eventType}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                          event.severity === "critical"
                            ? "bg-red-100 text-red-700"
                            : event.severity === "warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {event.severity === "critical" ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        {event.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                      {event.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
