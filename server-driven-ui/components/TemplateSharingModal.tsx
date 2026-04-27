"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Mail, Lock, Check, Loader2, X } from "lucide-react";
import { shareTemplate } from "@/lib/api/templates.api";
import { toast } from "sonner";

interface TemplateSharingModalProps {
  templateId: string;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateSharingModal = ({
  templateId,
  templateName,
  isOpen,
  onClose,
}: TemplateSharingModalProps) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<"view" | "use" | "edit">("view");
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleAddEmail = () => {
    if (!currentEmail.trim()) return;
    if (emails.includes(currentEmail)) {
      toast.error("Email already added");
      return;
    }
    if (!currentEmail.includes("@")) {
      toast.error("Invalid email");
      return;
    }
    setEmails([...emails, currentEmail]);
    setCurrentEmail("");
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleShare = async () => {
    if (emails.length === 0) {
      toast.error("Please add at least one email");
      return;
    }

    try {
      setLoading(true);
      const expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await shareTemplate(templateId, emails, accessLevel, expiresAt);
      
      setShareLink(
        `${window.location.origin}/templates/shared/${templateId}?access=${accessLevel}`
      );
      
      setEmails([]);
      toast.success("Template shared successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to share template");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied!");
    }
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
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Share2 size={28} className="text-blue-600" />
              Share Template
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {shareLink ? (
            // Success State
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium mb-3">Share link generated!</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setShareLink(null);
                  setEmails([]);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share with More People
              </button>
            </div>
          ) : (
            // Sharing Form
            <div className="space-y-6">
              {/* Email Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Share with Users
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddEmail()}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* Email List */}
                {emails.length > 0 && (
                  <div className="space-y-2">
                    {emails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="text-sm text-gray-700">{email}</span>
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock size={16} />
                  Access Level
                </label>
                <div className="space-y-2">
                  {(["view", "use", "edit"] as const).map((level) => (
                    <label key={level} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        checked={accessLevel === level}
                        onChange={() => setAccessLevel(level)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{level}</p>
                        <p className="text-xs text-gray-500">
                          {level === "view" && "View only"}
                          {level === "use" && "View and use"}
                          {level === "edit" && "View, use, and edit"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration
                </label>
                <select
                  value={expiresIn || ""}
                  onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Never (no expiration)</option>
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  disabled={loading || emails.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Share2 size={16} />
                      Share
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
