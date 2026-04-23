"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Gauge, Timer } from "lucide-react";
import { toast } from "sonner";
import { getSystemPerformance } from "@/lib/api/system.api";
import { SystemPerformanceMetrics } from "@/lib/types/settings.types";

type VitalsState = {
  lcp?: number;
  cls?: number;
  inp?: number;
};

const initVitals: VitalsState = {};

export default function PerformanceDashboardPage() {
  const [metrics, setMetrics] = useState<SystemPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState<VitalsState>(initVitals);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getSystemPerformance();
        setMetrics(data);
      } catch {
        toast.error("Unable to load performance metrics");
      } finally {
        setLoading(false);
      }
    };

    void fetchMetrics();
    const interval = setInterval(() => void fetchMetrics(), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      if (last) {
        setVitals((prev) => ({
          ...prev,
          lcp: Number(last.startTime.toFixed(2)),
        }));
      }
    });

    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries() as Array<
        PerformanceEntry & { value?: number; hadRecentInput?: boolean }
      >) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value || 0;
        }
      }
      setVitals((prev) => ({ ...prev, cls: Number(clsValue.toFixed(4)) }));
    });

    const inpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      if (last) {
        setVitals((prev) => ({
          ...prev,
          inp: Number(last.duration.toFixed(2)),
        }));
      }
    });

    try {
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      clsObserver.observe({ type: "layout-shift", buffered: true });
      inpObserver.observe({
        type: "event",
        buffered: true,
      } as PerformanceObserverInit);
    } catch {
      return;
    }

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      inpObserver.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Performance Dashboard
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Core Web Vitals, API latency, and backend error rates.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              LCP
            </p>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {vitals.lcp ?? 0}ms
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              CLS
            </p>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {vitals.cls ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              INP
            </p>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {vitals.inp ?? 0}ms
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              API Avg (5m)
            </p>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {metrics?.api.avgLatencyMs5m ?? 0}ms
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              API P95 (5m)
            </p>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {metrics?.api.p95LatencyMs5m ?? 0}ms
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Error Rate (5m)
            </p>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {metrics?.api.errorRate5m ?? 0}%
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
              Slow Routes (1h)
            </h2>
            <div className="text-xs text-slate-400 inline-flex items-center gap-2">
              <Timer className="w-3.5 h-3.5" />
              Updated every 30s
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm font-semibold text-slate-500">
              Loading...
            </div>
          ) : metrics?.slowRoutes?.length ? (
            <div className="space-y-2">
              {metrics.slowRoutes.map((route) => (
                <div
                  key={route.route}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {route.route}
                    </p>
                    <p className="text-xs text-slate-500">
                      {route.requests} requests
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      {route.avgLatencyMs}ms avg
                    </span>
                    <span>{route.errorRate}% errors</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm font-semibold text-slate-500">
              No route metrics available yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
