"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Copy,
  Share2,
  TrendingUp,
  Calendar,
  Loader2,
  X,
  BarChart3,
} from "lucide-react";
import { getTemplateAnalytics, TemplateAnalytics } from "@/lib/api/templates.api";
import { toast } from "sonner";

interface TemplateAnalyticsModalProps {
  templateId: string;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateAnalyticsModal = ({
  templateId,
  templateName,
  isOpen,
  onClose,
}: TemplateAnalyticsModalProps) => {
  const [analytics, setAnalytics] = useState<TemplateAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, templateId, days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getTemplateAnalytics(templateId, days);
      setAnalytics(data);
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return analytics.reduce(
      (acc, day) => ({
        views: acc.views + day.views,
        uses: acc.uses + day.uses,
        shares: acc.shares + day.shares,
        duplicates: acc.duplicates + day.duplicateCount,
      }),
      { views: 0, uses: 0, shares: 0, duplicates: 0 }
    );
  };

  const totals = calculateTotals();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 size={32} className="text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
                <p className="text-sm text-gray-600">{templateName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="mb-8 flex gap-2">
            {[7, 14, 30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  days === d
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={18} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">Views</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{totals.views}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Copy size={18} className="text-green-600" />
                    <span className="text-xs font-medium text-green-600">Uses</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{totals.uses}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 size={18} className="text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">Shares</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{totals.shares}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-orange-600" />
                    <span className="text-xs font-medium text-orange-600">Duplicates</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{totals.duplicates}</p>
                </motion.div>
              </div>

              {/* Daily Breakdown */}
              {analytics.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown</h3>
                  {analytics.map((day, idx) => (
                    <motion.div
                      key={day._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block mb-1">Views</span>
                          <span className="font-bold text-gray-900">{day.views}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Uses</span>
                          <span className="font-bold text-gray-900">{day.uses}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Shares</span>
                          <span className="font-bold text-gray-900">{day.shares}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Duplicates</span>
                          <span className="font-bold text-gray-900">{day.duplicateCount}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No analytics data available yet</p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
