"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, ExternalLink, Calendar, User } from "lucide-react";
import Image from "next/image";
import { Template } from "@/lib/api/templates.api";

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: Template) => void;
  isApplying?: boolean;
}

export const TemplatePreviewModal = ({
  template,
  isOpen,
  onClose,
  onApply,
  isApplying = false,
}: TemplatePreviewModalProps) => {
  if (!template) return null;

  const categoryColors: Record<string, { text: string; bg: string }> = {
    homepage: { text: "text-blue-600", bg: "bg-blue-50" },
    about: { text: "text-purple-600", bg: "bg-purple-50" },
    courses: { text: "text-green-600", bg: "bg-green-50" },
    departments: { text: "text-indigo-600", bg: "bg-indigo-50" },
    contact: { text: "text-orange-600", bg: "bg-orange-50" },
    blog: { text: "text-pink-600", bg: "bg-pink-50" },
    events: { text: "text-amber-600", bg: "bg-amber-50" },
    custom: { text: "text-slate-600", bg: "bg-slate-50" },
  };

  const colors = categoryColors[template.category] || categoryColors.custom;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={24} className="text-gray-600" />
            </button>

            <div className="p-8">
              {/* Thumbnail Preview */}
              {template.thumbnail && (
                <div className="w-full h-64 relative rounded-xl overflow-hidden mb-8 border border-gray-200">
                  <Image
                    src={template.thumbnail}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Template Info */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {template.name}
                    </h2>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${colors.bg} ${colors.text} capitalize`}
                    >
                      {template.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg">
                    {template.description || "No description provided"}
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-400">
                      {template.isPublic ? "✓" : "○"}
                    </span>
                    <div>
                      <p className="text-xs text-gray-500">Visibility</p>
                      <p className="text-sm font-medium text-gray-900">
                        {template.isPublic ? "Public" : "Private"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features/Components Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Template Information
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      This template includes a full page layout with pre-configured components,
                      styling, and responsive design patterns optimized for {template.category === 'custom' ? 'custom usage' : template.category}.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onApply(template)}
                    disabled={isApplying}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isApplying ? (
                      <>
                        <div className="animate-spin">⌛</div>
                        Applying...
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Use This Template
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
