"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface DbSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
  description: string | null;
}

interface ReadOnlySettings {
  razorpayKeyId: string;
  razorpayPublicKeyId: string;
  databaseUrl: string;
  nextAuthUrl: string;
  nextAuthSecret: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  storageType: string;
  s3Bucket: string;
  uploadFolder: string;
  appUrl: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [readOnlySettings, setReadOnlySettings] =
    useState<ReadOnlySettings | null>(null);
  const [, setDbSettings] = useState<DbSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || {});
        setReadOnlySettings(data.readOnlySettings);
        setDbSettings(data.dbSettings || []);
      } else {
        toast.error("Failed to load settings");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const loadingToast = toast.loading("Saving settings...");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Settings saved successfully!", { id: loadingToast });
        fetchSettings(); // Reload to get updated values
      } else {
        toast.error(data.error || "Failed to save settings", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--custom-600)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage platform settings and configuration
        </p>
      </div>

      <div className="space-y-6">
        {/* App Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">App Settings</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={(settings.siteName as string) || ""}
                onChange={(e) => updateSetting("siteName", e.target.value)}
                placeholder="Stockey"
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={(settings.siteDescription as string) || ""}
                onChange={(e) =>
                  updateSetting("siteDescription", e.target.value)
                }
                placeholder="Your trading platform"
              />
            </div>
            <div>
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={(settings.adminEmail as string) || ""}
                onChange={(e) => updateSetting("adminEmail", e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={(settings.supportEmail as string) || ""}
                onChange={(e) => updateSetting("supportEmail", e.target.value)}
                placeholder="support@example.com"
              />
            </div>
          </div>
        </Card>

        {/* Content Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Content Settings</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="postsPerPage">Posts Per Page</Label>
              <Input
                id="postsPerPage"
                type="number"
                value={(settings.postsPerPage as string) || "10"}
                onChange={(e) =>
                  updateSetting("postsPerPage", parseInt(e.target.value) || 10)
                }
                min="1"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="enableComments">Enable Comments</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="enableComments"
                  checked={
                    settings.enableComments === true ||
                    settings.enableComments === "true"
                  }
                  onChange={(e) =>
                    updateSetting("enableComments", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="enableComments" className="text-sm">
                  Allow users to comment on blogs
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* System Information (Read-Only) */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <p className="text-sm text-gray-600 mb-4">
            These settings are configured via environment variables and cannot
            be changed here.
          </p>
          <div className="space-y-3">
            {readOnlySettings && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Razorpay Key ID:</span>
                    <span className="ml-2 text-gray-600">
                      {readOnlySettings.razorpayKeyId}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Database:</span>
                    <span className="ml-2 text-gray-600">
                      {readOnlySettings.databaseUrl}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Storage Type:</span>
                    <span className="ml-2 text-gray-600">
                      {readOnlySettings.storageType}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Upload Folder:</span>
                    <span className="ml-2 text-gray-600">
                      {readOnlySettings.uploadFolder}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">SMTP Host:</span>
                    <span className="ml-2 text-gray-600">
                      {readOnlySettings.smtpHost}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">SMTP Port:</span>
                    <span className="ml-2 text-gray-600">
                      {readOnlySettings.smtpPort}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">App URL:</span>
                    <span className="ml-2 text-gray-600">
                      {readOnlySettings.appUrl}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">NextAuth URL:</span>
                    <span className="ml-2 text-gray-600">
                      {readOnlySettings.nextAuthUrl}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--custom-600)] hover:bg-[var(--custom-700)] text-white"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
