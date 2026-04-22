"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Upload,
  FolderPlus,
  Search,
  Download,
  ArrowLeft,
  CheckSquare,
  Square,
  Images,
  Image,
  Video,
  FileText,
  Sparkles,
  FolderOpen,
  BadgeInfo,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
import {
  uploadMedia,
  getAllMedia,
  listMediaFolders,
  createMediaFolder,
  bulkMediaOperation,
  getMediaUsageAnalytics,
} from "@/lib/api/media.api";
import { Media, MediaFolder } from "@/lib/types/media.types";

type BulkAction =
  | "compress"
  | "move"
  | "tag"
  | "categorize"
  | "delete"
  | "download-zip";

const mediaModels = [
  {
    key: "admissions",
    label: "Admissions",
    icon: BadgeInfo,
    gradient: "from-sky-500 to-cyan-500",
    ring: "ring-sky-100",
    bg: "bg-sky-50",
    text: "text-sky-700",
    description:
      "Use for prospectus files, campus brochures, scholarship images, and application banners.",
    bestFor: ["Brochures", "Hero banners", "PDF guides"],
    folderHint: "admissions/2026-intake",
  },
  {
    key: "academics",
    label: "Academics",
    icon: FileText,
    gradient: "from-indigo-500 to-violet-500",
    ring: "ring-indigo-100",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    description:
      "Store syllabus documents, department visuals, faculty portraits, and course promotions.",
    bestFor: ["Faculty photos", "Course PDFs", "Department covers"],
    folderHint: "academics/department-assets",
  },
  {
    key: "events",
    label: "Events",
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-500",
    ring: "ring-amber-100",
    bg: "bg-amber-50",
    text: "text-amber-700",
    description:
      "Ideal for event posters, gallery highlights, ceremony clips, and announcement creatives.",
    bestFor: ["Posters", "Photo sets", "Reel clips"],
    folderHint: "events/2026-fests",
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Image,
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    description:
      "Best for campaign visuals, homepage banners, testimonials, and social-ready assets.",
    bestFor: ["Campaign art", "Homepage banners", "Social tiles"],
    folderHint: "marketing/campaigns",
  },
  {
    key: "branding",
    label: "Branding",
    icon: Video,
    gradient: "from-slate-700 to-slate-900",
    ring: "ring-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-700",
    description:
      "Use for logos, brand kits, intro animations, and visual identity source files.",
    bestFor: ["Logos", "Brand kits", "Intro videos"],
    folderHint: "branding/master-kit",
  },
  {
    key: "other",
    label: "Other",
    icon: FolderOpen,
    gradient: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-100",
    bg: "bg-violet-50",
    text: "text-violet-700",
    description:
      "Keep miscellaneous assets here, then tag and move them into a more precise category later.",
    bestFor: ["Misc files", "Imported assets", "Temporary storage"],
    folderHint: "other/inbox",
  },
] as const;

export default function MediaHubPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [media, setMedia] = useState<Media[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("/");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [runningBulk, setRunningBulk] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  const categoryCounts = useMemo(() => {
    return mediaModels.map((model) => ({
      ...model,
      count: media.filter((item) => item.category === model.key).length,
    }));
  }, [media]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [mediaItems, folderItems, usageAnalytics] = await Promise.all([
        getAllMedia({
          search: searchQuery || undefined,
          folderPath: selectedFolder !== "/" ? selectedFolder : undefined,
          type: selectedType !== "all" ? selectedType : undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        }),
        listMediaFolders(),
        getMediaUsageAnalytics(),
      ]);

      setMedia(mediaItems);
      setFolders(folderItems);
      setAnalytics(usageAnalytics);
    } catch (error) {
      toast.error("Failed to load media hub data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void refreshAll();
  }, [user, searchQuery, selectedFolder, selectedType, selectedCategory]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploading(true);
    try {
      await Promise.all(
        Array.from(files).map((file) =>
          uploadMedia(file, {
            folderPath: selectedFolder,
          }),
        ),
      );
      toast.success(`${files.length} media file(s) uploaded.`);
      await refreshAll();
    } catch {
      toast.error("Upload failed for one or more files.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Folder name");
    if (!name?.trim()) return;

    try {
      await createMediaFolder({
        name: name.trim(),
        parentPath: selectedFolder,
      });
      toast.success("Folder created.");
      await refreshAll();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message || "Could not create folder.",
      );
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedMediaIds((prev) =>
      prev.includes(id)
        ? prev.filter((mediaId) => mediaId !== id)
        : [...prev, id],
    );
  };

  const visibleMedia = useMemo(() => media, [media]);

  const selectedCategoryModel =
    selectedCategory === "all"
      ? null
      : (categoryCounts.find((model) => model.key === selectedCategory) ??
        null);

  const selectAllVisible = () => {
    const ids = visibleMedia.map((item) => item._id);
    const hasAll =
      ids.length > 0 && ids.every((id) => selectedMediaIds.includes(id));
    setSelectedMediaIds(
      hasAll
        ? selectedMediaIds.filter((id) => !ids.includes(id))
        : Array.from(new Set([...selectedMediaIds, ...ids])),
    );
  };

  const runBulkAction = async (action: BulkAction) => {
    if (!selectedMediaIds.length) {
      toast.error("Select at least one media file.");
      return;
    }

    setRunningBulk(true);
    let folderPath: string | undefined;
    let tags: string[] | undefined;
    let category: string | undefined;

    if (action === "move") {
      const response = window.prompt(
        "Move selected files to folder path",
        selectedFolder,
      );
      if (!response?.trim()) {
        setRunningBulk(false);
        return;
      }
      folderPath = response.trim();
    }

    if (action === "tag") {
      const response = window.prompt(
        "Add comma-separated tags",
        "campus,homepage",
      );
      if (!response?.trim()) {
        setRunningBulk(false);
        return;
      }
      tags = response
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    if (action === "categorize") {
      const response = window.prompt(
        "Category (admissions|academics|events|marketing|branding|other)",
        "other",
      );
      if (!response?.trim()) {
        setRunningBulk(false);
        return;
      }
      category = response.trim();
    }

    try {
      if (action === "download-zip") {
        const zipBlob = await bulkMediaOperation({
          action,
          mediaIds: selectedMediaIds,
          folderPath,
          tags,
          category,
        });
        const url = URL.createObjectURL(zipBlob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `media-batch-${new Date().toISOString().slice(0, 10)}.zip`;
        anchor.click();
        URL.revokeObjectURL(url);
      } else {
        await bulkMediaOperation({
          action,
          mediaIds: selectedMediaIds,
          folderPath,
          tags,
          category,
        });
      }

      toast.success(`Bulk ${action} completed.`);
      setSelectedMediaIds([]);
      await refreshAll();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message || `Bulk ${action} failed.`,
      );
    } finally {
      setRunningBulk(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center">
        <div className="text-slate-500 font-semibold">Loading media hub...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(14,165,233,0.12),transparent_36%),radial-gradient(circle_at_88%_4%,rgba(99,102,241,0.10),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f2f6ff_48%,#ffffff_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-4rem] top-20 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl animate-float-slow" />
        <div className="absolute right-[-3rem] top-44 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl animate-float-slow [animation-delay:1.3s]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] border border-white/80 bg-white/75 backdrop-blur-2xl shadow-[0_28px_80px_-44px_rgba(15,23,42,0.4)] p-6 sm:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="max-w-2xl">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                Media Hub
              </h1>
              <p className="mt-3 text-slate-600 font-medium max-w-2xl leading-relaxed">
                A structured library for admissions, academics, events,
                marketing, and branding assets. Use the category models below to
                keep uploads consistent and easy to find.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:w-[430px] gap-3">
              <label className="h-12 px-4 rounded-2xl bg-slate-950 text-white text-sm font-black inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Files"}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => void handleUpload(e.target.files)}
                  disabled={uploading}
                />
              </label>
              <button
                onClick={handleCreateFolder}
                className="h-12 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-black inline-flex items-center justify-center gap-2 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
              Total Media
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {analytics?.totalMedia || 0}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
              Used In Pages
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {analytics?.totalUsed || 0}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
              Unused Assets
            </p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {analytics?.unused || 0}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
              Folders
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {folders.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
                  Media Models
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Category guides for clean uploads
                </h2>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-2xl">
                  Each card gives users a simple mental model for what belongs
                  in that category and how to organize it.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.24em]">
                  Smart Library
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {categoryCounts.map((model) => {
                const Icon = model.icon;
                const isActive = selectedCategory === model.key;

                return (
                  <button
                    key={model.key}
                    onClick={() =>
                      setSelectedCategory(isActive ? "all" : model.key)
                    }
                    className={`group text-left rounded-[1.5rem] border p-4 transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_-30px_rgba(15,23,42,0.4)] ${isActive ? `${model.bg} ${model.ring} ring-2` : "bg-white border-slate-200"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${model.gradient} text-white grid place-items-center shadow-sm`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-950 truncate">
                            {model.label}
                          </p>
                          <p
                            className={`text-[10px] font-black uppercase tracking-[0.24em] ${model.text}`}
                          >
                            {model.count} items
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 shadow-sm ring-1 ring-slate-100">
                        Model
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                      {model.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {model.bestFor.map((item) => (
                        <span
                          key={item}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${model.bg} ${model.text} ring-1 ${model.ring}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Suggested folder
                      </span>
                      <span className="font-mono text-xs text-slate-600 truncate max-w-[55%] text-right">
                        {model.folderHint}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-slate-950 text-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.55)]">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">
              Category Focus
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">
              {selectedCategoryModel?.label || "All media types"}
            </h3>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              {selectedCategoryModel?.description ||
                "Select a category model to narrow the library and guide uploads."}
            </p>

            <div className="mt-5 rounded-[1.5rem] bg-white/8 border border-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">
                Best use
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  selectedCategoryModel?.bestFor || [
                    "Images",
                    "Videos",
                    "Documents",
                  ]
                ).map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-white/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">
                  Current Count
                </p>
                <p className="mt-2 text-2xl font-black">
                  {selectedCategoryModel?.count ?? media.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">
                  Folder Hint
                </p>
                <p className="mt-2 text-sm font-mono text-white/85 leading-relaxed">
                  {selectedCategoryModel?.folderHint || "/"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] bg-white/5 border border-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">
                Tip
              </p>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">
                Use the category cards as a naming model: upload, tag, and file
                assets into the matching folder pattern so the library stays
                easy to scan.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-4 sm:p-5 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
                Library Controls
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">
                Search, filter, and batch actions
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by filename or tags"
                className="h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm w-64 bg-white shadow-sm"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-sm"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="admissions">Admissions</option>
              <option value="academics">Academics</option>
              <option value="events">Events</option>
              <option value="marketing">Marketing</option>
              <option value="branding">Branding</option>
              <option value="other">Other</option>
            </select>

            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-sm"
            >
              <option value="/">All Folders</option>
              {folders.map((folder) => (
                <option key={folder._id} value={folder.path}>
                  {folder.path}
                </option>
              ))}
            </select>

            <button
              onClick={selectAllVisible}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.22em] inline-flex items-center gap-1 shadow-sm"
            >
              {visibleMedia.length > 0 &&
              visibleMedia.every((m) => selectedMediaIds.includes(m._id)) ? (
                <CheckSquare className="w-3.5 h-3.5" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              Select
            </button>

            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("compress")}
              className="h-10 px-3 rounded-xl bg-sky-600 text-white text-[10px] font-black uppercase tracking-[0.22em] disabled:opacity-50 shadow-sm"
            >
              Compress
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("move")}
              className="h-10 px-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.22em] disabled:opacity-50 shadow-sm"
            >
              Move
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("tag")}
              className="h-10 px-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.22em] disabled:opacity-50 shadow-sm"
            >
              Tag
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("categorize")}
              className="h-10 px-3 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.22em] disabled:opacity-50 shadow-sm"
            >
              Categorize
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("download-zip")}
              className="h-10 px-3 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.22em] disabled:opacity-50 inline-flex items-center gap-1 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              ZIP
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("delete")}
              className="h-10 px-3 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.22em] disabled:opacity-50 shadow-sm"
            >
              Delete
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold">
              Loading media...
            </div>
          ) : visibleMedia.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-semibold">
              No media found for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
              {visibleMedia.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.03, 0.2),
                  }}
                  className="rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => toggleSelection(item._id)}
                      className="h-8 w-8 rounded-xl border border-slate-200 grid place-items-center text-slate-500 shadow-sm"
                    >
                      {selectedMediaIds.includes(item._id) ? (
                        <CheckSquare className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-950 truncate">
                        {item.filename}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.folderPath}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 h-40 grid place-items-center">
                    {item.type === "image" ? (
                      <img
                        src={item.formats?.webp?.url || item.cloudinaryUrl}
                        alt={item.altText || item.filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                        <Images className="w-4 h-4" />
                        {item.type}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.22em] bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.22em] bg-sky-50 text-sky-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-black">
                        Size
                      </p>
                      <p className="text-[11px] font-bold text-slate-700">
                        {(item.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-black">
                        Used
                      </p>
                      <p className="text-[11px] font-bold text-slate-700">
                        {item.usageCount}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-black">
                        Saved
                      </p>
                      <p className="text-[11px] font-bold text-emerald-700">
                        {item.compression?.savedPercent ?? 0}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
