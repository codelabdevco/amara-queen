"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface Settings {
  promptTemplate: string;
  model: string;
  maxTokens: number;
  dailyFreeLimit: number;
  rateLimitPerMinute: number;
  maintenanceMode: boolean;
  creditCostPerReading: number;
  promptPayNumber: string;
  promptPayName: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => setError("ไม่สามารถโหลดการตั้งค่าได้"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "บันทึกไม่สำเร็จ");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <h2 className="text-xl font-semibold mb-6">ตั้งค่า</h2>

        {loading ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : !settings ? (
          <p className="text-white/40">{error || "ไม่สามารถโหลดการตั้งค่าได้"}</p>
        ) : (
          <div className="max-w-2xl space-y-6">
            {/* Prompt Template */}
            <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
              <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                Prompt Template
              </label>
              <textarea
                value={settings.promptTemplate}
                onChange={(e) => update("promptTemplate", e.target.value)}
                rows={10}
                className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-mono leading-relaxed focus:border-gold/30 outline-none transition-colors resize-y"
              />
            </div>

            {/* Model & Max Tokens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                  Model
                </label>
                <input
                  type="text"
                  value={settings.model}
                  onChange={(e) => update("model", e.target.value)}
                  className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 outline-none transition-colors"
                />
              </div>
              <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => update("maxTokens", Number(e.target.value))}
                  className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                  Daily Free Limit
                </label>
                <input
                  type="number"
                  value={settings.dailyFreeLimit}
                  onChange={(e) => update("dailyFreeLimit", Number(e.target.value))}
                  className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 outline-none transition-colors"
                />
                <p className="text-white/20 text-xs mt-1.5">จำนวนครั้งต่อวันที่ใช้ฟรี</p>
              </div>
              <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                  Rate Limit / min
                </label>
                <input
                  type="number"
                  value={settings.rateLimitPerMinute}
                  onChange={(e) => update("rateLimitPerMinute", Number(e.target.value))}
                  className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 outline-none transition-colors"
                />
                <p className="text-white/20 text-xs mt-1.5">จำกัดต่อนาที</p>
              </div>
            </div>

            {/* Credit & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                  เครดิต/ครั้ง
                </label>
                <input
                  type="number"
                  value={settings.creditCostPerReading}
                  onChange={(e) => update("creditCostPerReading", Number(e.target.value))}
                  className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 outline-none transition-colors"
                />
                <p className="text-white/20 text-xs mt-1.5">จำนวนเครดิตที่หักต่อการดูดวง</p>
              </div>
              <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                  PromptPay เบอร์
                </label>
                <input
                  type="text"
                  value={settings.promptPayNumber}
                  onChange={(e) => update("promptPayNumber", e.target.value)}
                  className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 outline-none transition-colors"
                  placeholder="0812345678"
                />
              </div>
              <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">
                  PromptPay ชื่อ
                </label>
                <input
                  type="text"
                  value={settings.promptPayName}
                  onChange={(e) => update("promptPayName", e.target.value)}
                  className="w-full bg-[#08090e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 outline-none transition-colors"
                  placeholder="ชื่อบัญชี"
                />
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Maintenance Mode</p>
                  <p className="text-white/30 text-xs mt-0.5">ปิดระบบชั่วคราวเพื่อบำรุงรักษา</p>
                </div>
                <button
                  onClick={() => update("maintenanceMode", !settings.maintenanceMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.maintenanceMode ? "bg-gold/30" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                      settings.maintenanceMode
                        ? "left-[26px] bg-gold"
                        : "left-0.5 bg-white/40"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}
            {saved && (
              <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">
                บันทึกสำเร็จ
              </p>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gold/10 text-gold border border-gold/20 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
