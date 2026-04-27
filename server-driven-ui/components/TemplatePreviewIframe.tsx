"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Download, Maximize2, Minimize2, Loader2 } from "lucide-react";

interface TemplatePreviewIframeProps {
  templateId: string;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
  htmlContent?: string;
}

export const TemplatePreviewIframe = ({
  templateId,
  templateName,
  isOpen,
  onClose,
  htmlContent,
}: TemplatePreviewIframeProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeContent, setIframeContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && htmlContent) {
      setIframeContent(htmlContent);
      setLoading(false);
    }
  }, [isOpen, htmlContent]);

  const handleDownload = () => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/html;charset=utf-8," + encodeURIComponent(iframeContent)
    );
    element.setAttribute("download", `${templateName}.html`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) return null;

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-50"
    : "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={!isFullscreen ? onClose : undefined}
      className={containerClasses}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className={isFullscreen ? "w-full h-full flex flex-col" : "bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{templateName}</h2>
            <p className="text-xs text-gray-500">Template Preview</p>
          </div>
          <div className="flex gap-2">
            {htmlContent && (
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Download HTML"
              >
                <Download size={20} className="text-gray-600" />
              </button>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 size={20} className="text-gray-600" />
              ) : (
                <Maximize2 size={20} className="text-gray-600" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          ) : iframeContent ? (
            <iframe
              title={templateName}
              srcDoc={iframeContent}
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-600 text-lg">No preview available</p>
                <p className="text-gray-500 text-sm mt-2">
                  This template doesn't have HTML content yet
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Preview mode • Scroll within the preview to see the template
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
