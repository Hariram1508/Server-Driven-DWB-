"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";
import { getSiteSettings, updateSiteSettings } from "@/lib/api/settings.api";
import { SiteSettings } from "@/lib/types/settings.types";

const defaultSettings: SiteSettings = {
  siteName: "",
  tagline: "",
  logo: "",
  favicon: "",
  colors: {
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B",
    background: "#FFFFFF",
    text: "#0F172A",
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
  },
  social: {
    facebook: "",
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",
  },
  analytics: {
    googleAnalyticsId: "",
  },
  customDomain: {
    domain: "",
    sslEnabled: true,
    sslAutoRenew: true,
  },
  email: {
    notificationsEnabled: true,
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpFromEmail: "",
  },
};

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const canEdit = useMemo(
    () => user?.role === "admin" || user?.role === "super-admin",
    [user?.role],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    const loadSettings = async () => {
      try {
        const response = await getSiteSettings();
        setSettings({
          ...defaultSettings,
          ...response.settings,
          colors: {
            ...defaultSettings.colors,
            ...(response.settings?.colors || {}),
          },
          fonts: {
            ...defaultSettings.fonts,
            ...(response.settings?.fonts || {}),
          },
          social: {
            ...defaultSettings.social,
            ...(response.settings?.social || {}),
          },
          analytics: {
            ...defaultSettings.analytics,
            ...(response.settings?.analytics || {}),
          },
          customDomain: {
            ...defaultSettings.customDomain,
            ...(response.settings?.customDomain || {}),
          },
          email: {
            ...defaultSettings.email,
            ...(response.settings?.email || {}),
          },
        });
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, [isLoading, router, user]);

  const save = async () => {
    if (!canEdit) {
      toast.error("You do not have permission to edit settings");
      return;
    }

    setSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
              <Settings2 className="w-6 h-6 text-sky-700" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Site Settings
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Brand, social, analytics, custom domain, and email preferences.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={() => void save()}
              disabled={saving || !canEdit}
              className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
            Brand
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={settings.siteName || ""}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, siteName: e.target.value }))
              }
              placeholder="Site name"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              value={settings.tagline || ""}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, tagline: e.target.value }))
              }
              placeholder="Tagline"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              value={settings.logo || ""}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, logo: e.target.value }))
              }
              placeholder="Logo URL"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              value={settings.favicon || ""}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, favicon: e.target.value }))
              }
              placeholder="Favicon URL"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: "primary", label: "Primary" },
              { key: "secondary", label: "Secondary" },
              { key: "accent", label: "Accent" },
              { key: "background", label: "Background" },
              { key: "text", label: "Text" },
            ].map((item) => (
              <label
                key={item.key}
                className="space-y-1 text-xs font-semibold text-slate-500"
              >
                {item.label}
                <input
                  type="color"
                  value={
                    (settings.colors as Record<string, string>)[item.key] ||
                    "#000000"
                  }
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      colors: {
                        ...prev.colors,
                        [item.key]: e.target.value,
                      },
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-slate-200"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
            Social & Analytics
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={settings.social?.facebook || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  social: { ...(prev.social || {}), facebook: e.target.value },
                }))
              }
              placeholder="Facebook URL"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              value={settings.social?.instagram || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  social: { ...(prev.social || {}), instagram: e.target.value },
                }))
              }
              placeholder="Instagram URL"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              value={settings.social?.x || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  social: { ...(prev.social || {}), x: e.target.value },
                }))
              }
              placeholder="X/Twitter URL"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              value={settings.social?.linkedin || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  social: { ...(prev.social || {}), linkedin: e.target.value },
                }))
              }
              placeholder="LinkedIn URL"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              value={settings.social?.youtube || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  social: { ...(prev.social || {}), youtube: e.target.value },
                }))
              }
              placeholder="YouTube URL"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              value={settings.analytics?.googleAnalyticsId || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  analytics: {
                    ...(prev.analytics || {}),
                    googleAnalyticsId: e.target.value,
                  },
                }))
              }
              placeholder="Google Analytics ID (G-XXXXXXXXXX)"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
            Custom Domain & SSL
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              value={settings.customDomain?.domain || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  customDomain: {
                    ...(prev.customDomain || {}),
                    domain: e.target.value,
                  },
                }))
              }
              placeholder="custom.domain.com"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <label className="h-11 rounded-xl border border-slate-200 px-3 flex items-center justify-between text-sm font-medium text-slate-600">
              SSL Enabled
              <input
                type="checkbox"
                checked={!!settings.customDomain?.sslEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    customDomain: {
                      ...(prev.customDomain || {}),
                      sslEnabled: e.target.checked,
                    },
                  }))
                }
              />
            </label>
            <label className="h-11 rounded-xl border border-slate-200 px-3 flex items-center justify-between text-sm font-medium text-slate-600">
              SSL Auto-Renewal
              <input
                type="checkbox"
                checked={!!settings.customDomain?.sslAutoRenew}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    customDomain: {
                      ...(prev.customDomain || {}),
                      sslAutoRenew: e.target.checked,
                    },
                  }))
                }
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
            Email Notifications & SMTP
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="h-11 rounded-xl border border-slate-200 px-3 flex items-center justify-between text-sm font-medium text-slate-600">
              Notifications Enabled
              <input
                type="checkbox"
                checked={!!settings.email?.notificationsEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    email: {
                      ...(prev.email || {}),
                      notificationsEnabled: e.target.checked,
                    },
                  }))
                }
              />
            </label>
            <input
              value={settings.email?.smtpHost || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  email: { ...(prev.email || {}), smtpHost: e.target.value },
                }))
              }
              placeholder="SMTP host"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              type="number"
              value={settings.email?.smtpPort ?? 587}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  email: {
                    ...(prev.email || {}),
                    smtpPort: Number.parseInt(e.target.value || "587", 10),
                  },
                }))
              }
              placeholder="SMTP port"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <label className="h-11 rounded-xl border border-slate-200 px-3 flex items-center justify-between text-sm font-medium text-slate-600">
              Secure SMTP (TLS)
              <input
                type="checkbox"
                checked={!!settings.email?.smtpSecure}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    email: {
                      ...(prev.email || {}),
                      smtpSecure: e.target.checked,
                    },
                  }))
                }
              />
            </label>
            <input
              value={settings.email?.smtpUser || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  email: { ...(prev.email || {}), smtpUser: e.target.value },
                }))
              }
              placeholder="SMTP username"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <input
              value={settings.email?.smtpFromEmail || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  email: {
                    ...(prev.email || {}),
                    smtpFromEmail: e.target.value,
                  },
                }))
              }
              placeholder="From email"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
