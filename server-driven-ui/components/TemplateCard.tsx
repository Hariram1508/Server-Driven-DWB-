"use client";

import { motion } from "framer-motion";
import { Eye, Copy, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Template } from "@/lib/api/templates.api";

interface TemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
  onApply: (template: Template) => void;
}

export const TemplateCard = ({
  template,
  onPreview,
  onApply,
}: TemplateCardProps) => {
  const categoryColors: Record<string, { bg: string; text: string; badge: string }> = {
    homepage: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100" },
    about: { bg: "bg-purple-50", text: "text-purple-700", badge: "bg-purple-100" },
    courses: { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100" },
    departments: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      badge: "bg-indigo-100",
    },
    contact: { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-100" },
    blog: { bg: "bg-pink-50", text: "text-pink-700", badge: "bg-pink-100" },
    events: { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100" },
    custom: { bg: "bg-slate-50", text: "text-slate-700", badge: "bg-slate-100" },
  };

  const colors = categoryColors[template.category] || categoryColors.custom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className={`relative h-48 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg ${colors.bg}`}>
        {/* Thumbnail Image */}
        {template.thumbnail ? (
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="text-center">
              <div className={`text-4xl font-bold ${colors.text} opacity-20`}>
                {template.category.toUpperCase()[0]}
              </div>
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="w-full flex gap-2">
            <button
              onClick={() => onPreview(template)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-900 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              onClick={() => onApply(template)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              <Copy size={16} />
              Use
            </button>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge} ${colors.text} capitalize`}>
            {template.category}
          </span>
        </div>
      </div>

      {/* Template Info */}
      <div className="mt-4 px-1">
        <h3 className="font-semibold text-gray-900 line-clamp-1 text-lg">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {template.description || "No description provided"}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {new Date(template.createdAt).toLocaleDateString()}
          </span>
          {template.isPublic && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Public
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
