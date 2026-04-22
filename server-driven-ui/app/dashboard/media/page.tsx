"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  FolderPlus,
  Search,
  Download,
  ArrowLeft,
  CheckSquare,
  Square,
  Images,
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#f2f6ff_45%,#ffffff_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Media Hub
            </h1>
            <p className="text-slate-600 font-medium">
              Optimize, organize, tag, and bulk-manage your media library.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="h-11 px-4 rounded-xl bg-sky-600 text-white text-sm font-black inline-flex items-center gap-2 cursor-pointer">
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
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-black inline-flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Total Media
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {analytics?.totalMedia || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Used In Pages
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {analytics?.totalUsed || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Unused Assets
            </p>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {analytics?.unused || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Folders
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {folders.length}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by filename or tags"
                className="h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm w-64"
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
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest inline-flex items-center gap-1"
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
              className="h-10 px-3 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
            >
              Compress
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("move")}
              className="h-10 px-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
            >
              Move
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("tag")}
              className="h-10 px-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
            >
              Tag
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("categorize")}
              className="h-10 px-3 rounded-xl bg-violet-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
            >
              Categorize
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("download-zip")}
              className="h-10 px-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              ZIP
            </button>
            <button
              disabled={runningBulk || !selectedMediaIds.length}
              onClick={() => void runBulkAction("delete")}
              className="h-10 px-3 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
            >
              Delete
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-semibold">
              Loading media...
            </div>
          ) : visibleMedia.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-semibold">
              No media found for this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleMedia.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => toggleSelection(item._id)}
                      className="h-8 w-8 rounded-lg border border-slate-200 grid place-items-center text-slate-500"
                    >
                      {selectedMediaIds.includes(item._id) ? (
                        <CheckSquare className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {item.filename}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.folderPath}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 h-36 grid place-items-center">
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
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-sky-50 text-sky-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] text-slate-400 uppercase font-black">
                        Size
                      </p>
                      <p className="text-[11px] font-bold text-slate-700">
                        {(item.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] text-slate-400 uppercase font-black">
                        Used
                      </p>
                      <p className="text-[11px] font-bold text-slate-700">
                        {item.usageCount}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] text-slate-400 uppercase font-black">
                        Saved
                      </p>
                      <p className="text-[11px] font-bold text-emerald-700">
                        {item.compression?.savedPercent ?? 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
