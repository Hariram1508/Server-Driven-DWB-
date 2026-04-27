"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Plus,
  Grid3x3,
  List,
  Star,
  Share2,
  Copy,
  BarChart3,
  TrendingUp,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
import { getAllTemplates, applyTemplate, duplicateTemplate, Template, getTrendingTemplates, getTopRatedTemplates } from "@/lib/api/templates.api";
import { TemplateCard } from "@/components/TemplateCard";
import { TemplatePreviewModal } from "@/components/TemplatePreviewModal";
import { TemplateRatingModal } from "@/components/TemplateRatingModal";
import { TemplateSharingModal } from "@/components/TemplateSharingModal";
import { TemplateAnalyticsModal } from "@/components/TemplateAnalyticsModal";
import { CreateCustomTemplateModal } from "@/components/CreateCustomTemplateModal";

type CategoryFilter = "all" | "homepage" | "about" | "courses" | "departments" | "contact" | "blog" | "events" | "custom";
type TabFilter = "all" | "trending" | "top-rated" | "my-templates";

const CATEGORIES: { value: CategoryFilter; label: string; description: string }[] = [
  { value: "all", label: "All Templates", description: "View all available templates" },
  { value: "homepage", label: "Homepage", description: "Landing and home pages" },
  { value: "about", label: "About", description: "About and company pages" },
  { value: "courses", label: "Courses", description: "Course and program pages" },
  { value: "departments", label: "Departments", description: "Department pages" },
  { value: "contact", label: "Contact", description: "Contact and inquiry forms" },
  { value: "blog", label: "Blog", description: "Blog and article pages" },
  { value: "events", label: "Events", description: "Event and announcement pages" },
  { value: "custom", label: "Custom", description: "Custom templates" },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tab, setTab] = useState<TabFilter>("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isSharingOpen, setIsSharingOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: Template[] = [];

        if (tab === "trending") {
          data = await getTrendingTemplates(12);
        } else if (tab === "top-rated") {
          data = await getTopRatedTemplates(12);
        } else if (tab === "my-templates") {
          // This would need a separate endpoint or filter
          data = await getAllTemplates(selectedCategory === "all" ? undefined : selectedCategory);
          data = data.filter((t) => t.createdBy === user?.id || t.isCustom);
        } else {
          data = await getAllTemplates(selectedCategory === "all" ? undefined : selectedCategory);
        }

        setTemplates(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load templates");
        toast.error("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedCategory, tab, user?.id]);

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  // Handle template preview
  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  // Handle apply template
  const handleApplyTemplate = async (template: Template) => {
    try {
      setIsApplying(true);
      const jsonConfig = await applyTemplate(template._id);
      
      sessionStorage.setItem("templateConfig", JSON.stringify(jsonConfig));
      
      toast.success(`Template "${template.name}" ready to use!`);
      setPreviewTemplate(null);
      
      router.push("/dashboard/page?templateId=" + template._id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply template");
    } finally {
      setIsApplying(false);
    }
  };

  // Handle duplicate template
  const handleDuplicate = async (template: Template) => {
    try {
      setDuplicating(template._id);
      const duplicated = await duplicateTemplate(template._id);
      toast.success(`Template duplicated as "${duplicated.name}"`);
      
      // Refresh templates
      setTab("my-templates");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to duplicate template");
    } finally {
      setDuplicating(null);
    }
  };

  // Handle rating click
  const handleRating = (template: Template) => {
    setSelectedTemplate(template);
    setIsRatingOpen(true);
  };

  // Handle sharing click
  const handleShare = (template: Template) => {
    setSelectedTemplate(template);
    setIsSharingOpen(true);
  };

  // Handle analytics click
  const handleAnalytics = (template: Template) => {
    setSelectedTemplate(template);
    setIsAnalyticsOpen(true);
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to view templates</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex gap-3">
              <Link
                href="/edit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Plus size={18} />
                New Page
              </Link>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={18} />
                Create Template
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Page Templates
            </h1>
            <p className="text-gray-600">
              Browse, manage, and share page templates with advanced features
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 flex-wrap">
          {["all", "trending", "top-rated", ...(user ? ["my-templates"] : [])].map(
            (t) => (
              <button
                key={t}
                onClick={() => setTab(t as TabFilter)}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  tab === t
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  {t === "trending" && <TrendingUp size={16} />}
                  {t === "top-rated" && <Star size={16} />}
                  {t === "my-templates" && <Clock size={16} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            )
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search templates by name or description..."  
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Filter and View Mode */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Filter size={16} className="inline mr-2" />
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.value
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title={cat.description}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Grid view"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading templates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3"
          >
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No templates found" : "No templates available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? `Try adjusting your search query or filters`
                : "Check back later for new templates"}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Templates Grid/List */}
        {!loading && filteredTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {viewMode === "grid" ? (
                  <div className="group relative">
                    <TemplateCard
                      template={template}
                      onPreview={handlePreview}
                      onApply={() => handleApplyTemplate(template)}
                    />
                    
                    {/* Action buttons below card */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleRating(template)}
                        title="Rate this template"
                        className="flex-1 px-3 py-2 text-xs bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Star size={14} />
                        Rate
                      </button>
                      <button
                        onClick={() => handleShare(template)}
                        title="Share this template"
                        className="flex-1 px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Share2 size={14} />
                        Share
                      </button>
                      {template.isCustom && (
                        <button
                          onClick={() => handleDuplicate(template)}
                          disabled={duplicating === template._id}
                          title="Duplicate this template"
                          className="flex-1 px-3 py-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {duplicating === template._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Copy size={14} />
                          )}
                          Duplicate
                        </button>
                      )}
                      <button
                        onClick={() => handleAnalytics(template)}
                        title="View analytics"
                        className="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <BarChart3 size={14} />
                        Analytics
                      </button>
                    </div>

                    {/* Rating and view count badges */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                      {template.ratingScore > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          {template.ratingScore.toFixed(1)} ({template.ratingCount})
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        👁️ {template.viewCount}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        {template.ratingScore > 0 && (
                          <span className="flex items-center gap-1 text-sm text-yellow-600">
                            <Star size={14} className="fill-yellow-400" />
                            {template.ratingScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                          {template.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          👁️ {template.viewCount}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleRating(template)}
                        className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
                      >
                        Rate
                      </button>
                      <button
                        onClick={() => handleShare(template)}
                        className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => handleAnalytics(template)}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        Analytics
                      </button>
                      <button
                        onClick={() => handlePreview(template)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleApplyTemplate(template)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Results Count */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="mt-8 text-center text-gray-600 text-sm">
            Showing <span className="font-semibold">{filteredTemplates.length}</span> of
            <span className="font-semibold">{templates.length}</span> template
            {templates.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Modals */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onApply={handleApplyTemplate}
        isApplying={isApplying}
      />

      {selectedTemplate && (
        <>
          <TemplateRatingModal
            templateId={selectedTemplate._id}
            isOpen={isRatingOpen}
            onClose={() => setIsRatingOpen(false)}
          />
          <TemplateSharingModal
            templateId={selectedTemplate._id}
            templateName={selectedTemplate.name}
            isOpen={isSharingOpen}
            onClose={() => setIsSharingOpen(false)}
          />
          <TemplateAnalyticsModal
            templateId={selectedTemplate._id}
            templateName={selectedTemplate.name}
            isOpen={isAnalyticsOpen}
            onClose={() => setIsAnalyticsOpen(false)}
          />
        </>
      )}

      <CreateCustomTemplateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => setTemplate([])} // Refresh templates
      />
    </div>
  );
}
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to view templates</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              href="/edit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Create New Page
            </Link>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Page Templates
            </h1>
            <p className="text-gray-600">
              Browse and use pre-designed page templates to quickly build your pages
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search templates by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Filter and View Mode */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Filter size={16} className="inline mr-2" />
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.value
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title={cat.description}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Grid view"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading templates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3"
          >
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No templates found" : "No templates available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? `Try adjusting your search query or filters`
                : "Check back later for new templates"}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Templates Grid/List */}
        {!loading && filteredTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {viewMode === "grid" ? (
                  <TemplateCard
                    template={template}
                    onPreview={handlePreview}
                    onApply={() => handleApplyTemplate(template)}
                  />
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                          {template.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handlePreview(template)}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleApplyTemplate(template)}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Results Count */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="mt-8 text-center text-gray-600 text-sm">
            Showing <span className="font-semibold">{filteredTemplates.length}</span> of{" "}
            <span className="font-semibold">{templates.length}</span> template
            {templates.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onApply={handleApplyTemplate}
        isApplying={isApplying}
      />
    </div>
  );
}
