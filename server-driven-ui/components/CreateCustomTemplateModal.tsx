"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { createTemplate, Template } from "@/lib/api/templates.api";
import { toast } from "sonner";

interface CreateCustomTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (template: Template) => void;
}

const CATEGORIES = [
  "homepage",
  "about",
  "courses",
  "departments",
  "contact",
  "blog",
  "events",
  "custom",
];

export const CreateCustomTemplateModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateCustomTemplateModalProps) => {
  const [step, setStep] = useState<"info" | "content">("info");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "custom",
    tags: [] as string[],
    isPublic: false,
  });
  const [currentTag, setCurrentTag] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [jsonConfig, setJsonConfig] = useState<any>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag],
      });
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJsonConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      setJsonConfig(JSON.parse(e.target.value));
    } catch {
      // Keep previous valid config if JSON is invalid
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    if (Object.keys(jsonConfig).length === 0) {
      toast.error("Template configuration is required");
      return;
    }

    try {
      setLoading(true);
      const template = await createTemplate({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        thumbnail: thumbnail,
        jsonConfig: jsonConfig,
        isPublic: formData.isPublic,
        tags: formData.tags,
        isCustom: true,
      });

      toast.success("Custom template created successfully!");
      onSuccess(template);
      resetForm();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("info");
    setFormData({
      name: "",
      description: "",
      category: "custom",
      tags: [],
      isPublic: false,
    });
    setCurrentTag("");
    setThumbnail("");
    setJsonConfig({});
  };

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Plus size={28} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Create Custom Template</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step Bar */}
          <div className="flex gap-4 mb-8">
            <div
              className={`flex-1 h-2 rounded-full ${
                step === "info" ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                step === "content" ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          </div>

          {step === "info" ? (
            // Step 1: Basic Info
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Modern Landing Page"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this template is for..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 mt-7 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Make Public
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label htmlFor="thumbnail-upload" className="cursor-pointer">
                    {thumbnail ? (
                      <div className="flex flex-col items-center">
                        <img src={thumbnail} alt="Thumbnail" className="w-20 h-20 object-cover rounded mb-2" />
                        <p className="text-sm text-blue-600 font-medium">Change image</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon size={32} className="text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Upload thumbnail</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep("content")}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next: Configure Content
              </button>
            </div>
          ) : (
            // Step 2: Template Configuration
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Configuration (JSON) *
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
                  <details className="text-xs text-gray-600 cursor-pointer">
                    <summary className="font-medium mb-2">Need help? Click here</summary>
                    <p className="mt-2 p-2 bg-blue-50 rounded">
                      Add your template's JSON configuration. This should include all the page layout,
                      components, and styling information. Example:
                    </p>
                    <code className="block p-2 bg-gray-100 rounded mt-2 text-gray-700 overflow-x-auto">
                      {`{
  "name": "Page Name",
  "title": "Page Title",
  "components": [],
  "styles": {}
}`}
                    </code>
                  </details>
                </div>
                <textarea
                  value={JSON.stringify(jsonConfig, null, 2)}
                  onChange={handleJsonConfigChange}
                  placeholder="Paste your template configuration here..."
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                />
                {Object.keys(jsonConfig).length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle size={18} className="text-yellow-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Template configuration is required to proceed
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("info")}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || Object.keys(jsonConfig).length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Template
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
