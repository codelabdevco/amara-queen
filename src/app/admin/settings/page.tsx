"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface CreditPackage {
  credits: number;
  price: number;
  label: string;
}

interface Settings {
  promptTemplate: string;
  model: string;
  maxTokens: number;
  dailyFreeLimit: number;
  rateLimitPerMinute: number;
  maintenanceMode: boolean;
  welcomeCredits: number;
  monthlyFreeCredits: number;
  creditCostPerReading: number;
  creditCostTarot: number;
  creditCostGypsy: number;
  creditCostSiamsi: number;
  creditCostAuspicious: number;
  creditCostCalendar: number;
  creditCostNumerology: number;
  creditPackages: CreditPackage[];
  promptPayNumber: string;
  promptPayName: string;
  omisePublicKey: string;
  omiseSecretKey: string;
  omiseConnected: boolean;
  lineConnected: boolean;
  lineChannelId: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [tab, setTab] = useState<"general" | "credits" | "ai" | "payment">("general");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => { if (r.status === 401) { router.push("/admin/login"); return null; } return r.json(); })
      .then((d) => { if (d) setS(d); })
      .catch(() => showToast("err", "โหลดการตั้งค่าไม่ได้"))
      .finally(() => setLoading(false));
  }, []);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    if (!s) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) { showToast("err", "บันทึกไม่สำเร็จ"); return; }
      showToast("ok", "บันทึกสำเร็จ");
    } catch { showToast("err", "เกิดข้อผิดพลาด"); }
    finally { setSaving(false); }
  }

  function upd<K extends keyof Settings>(key: K, val: Settings[K]) {
    setS((p) => (p ? { ...p, [key]: val } : p));
  }

  function updPkg(idx: number, field: keyof CreditPackage, val: string | number) {
    if (!s) return;
    const pkgs = [...s.creditPackages];
    pkgs[idx] = { ...pkgs[idx], [field]: field === "label" ? val : Number(val) };
    upd("creditPackages", pkgs);
  }

  function addPkg() {
    if (!s) return;
    upd("creditPackages", [...s.creditPackages, { credits: 10, price: 29, label: "10 เครดิต" }]);
  }

  function removePkg(idx: number) {
    if (!s) return;
    upd("creditPackages", s.creditPackages.filter((_, i) => i !== idx));
  }

  const cardClass = "rounded-xl p-5 border border-white/[0.04] bg-white/[0.02]";
  const inputClass = "w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#d4af37]/30 transition-colors";
  const labelClass = "block text-[10px] text-white/30 uppercase tracking-wider mb-1.5";
  const tabClass = (t: string) =>
    `px-4 py-2 rounded-lg text-xs transition-colors ${tab === t ? "bg-[#d4af37]/15 text-[#d4af37]" : "text-white/30 hover:text-white/50"}`;

  if (loading) return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <AdminNav />
      <main className="ml-56 p-6 flex items-center gap-3 text-white/30">
        <div className="w-4 h-4 border-2 border-white/10 border-t-[#d4af37] rounded-full animate-spin" /> กำลังโหลด...
      </main>
    </div>
  );

  if (!s) return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <AdminNav />
      <main className="ml-56 p-6 text-white/40">ไม่สามารถโหลดการตั้งค่าได้</main>
    </div>
  );

  return (
    <div className="min-h-screen text-white/80" style={{ background: "#0a0a0a" }}>
      <AdminNav />
      <main className="ml-56 p-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white/90">ตั้งค่า</h2>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-[#d4af37]/15 text-[#d4af37] hover:bg-[#d4af37]/25 transition-colors disabled:opacity-40">
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${toast.type === "ok" ? "bg-green-400/10 text-green-400 border border-green-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
            {toast.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          <button onClick={() => setTab("general")} className={tabClass("general")}>ทั่วไป</button>
          <button onClick={() => setTab("credits")} className={tabClass("credits")}>เครดิต</button>
          <button onClick={() => setTab("ai")} className={tabClass("ai")}>AI Model</button>
          <button onClick={() => setTab("payment")} className={tabClass("payment")}>การชำระเงิน</button>
        </div>

        {/* ─── TAB: ทั่วไป ─── */}
        {tab === "general" && (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className={cardClass}>
              <h3 className="text-sm font-medium text-[#d4af37]/80 mb-4">สถานะการเชื่อมต่อ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-white/[0.02] border border-white/[0.04]">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.lineConnected ? "bg-green-400" : "bg-yellow-400"}`} />
                  <div>
                    <p className="text-xs text-white/70">LINE Login</p>
                    <p className="text-[10px] text-white/30">{s.lineConnected ? "เชื่อมต่อแล้ว" : "ยังไม่ได้ตั้งค่า"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-white/[0.02] border border-white/[0.04]">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.omiseConnected ? "bg-green-400" : "bg-yellow-400"}`} />
                  <div>
                    <p className="text-xs text-white/70">Omise Payment</p>
                    <p className="text-[10px] text-white/30">{s.omiseConnected ? "เชื่อมต่อแล้ว" : "ยังไม่ได้ตั้งค่า"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Limits */}
            <div className={cardClass}>
              <h3 className="text-sm font-medium text-[#d4af37]/80 mb-4">ระบบ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>จำนวนดูดวงฟรี / วัน</label>
                  <input type="number" className={inputClass} value={s.dailyFreeLimit}
                    onChange={(e) => upd("dailyFreeLimit", Number(e.target.value))} />
                  <p className="text-[10px] text-white/20 mt-1">สำหรับ guest ที่ไม่ได้ login</p>
                </div>
                <div>
                  <label className={labelClass}>Rate Limit / นาที</label>
                  <input type="number" className={inputClass} value={s.rateLimitPerMinute}
                    onChange={(e) => upd("rateLimitPerMinute", Number(e.target.value))} />
                  <p className="text-[10px] text-white/20 mt-1">ป้องกัน spam</p>
                </div>
              </div>
            </div>

            {/* Maintenance */}
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 font-medium">โหมดบำรุงรักษา</p>
                  <p className="text-[10px] text-white/30 mt-0.5">ปิดระบบชั่วคราว ผู้ใช้จะเห็นหน้า maintenance</p>
                </div>
                <button onClick={() => upd("maintenanceMode", !s.maintenanceMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${s.maintenanceMode ? "bg-[#d4af37]/30" : "bg-white/[0.08]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${s.maintenanceMode ? "left-[26px] bg-[#d4af37]" : "left-0.5 bg-white/30"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: เครดิต ─── */}
        {tab === "credits" && (
          <div className="space-y-4">
            {/* Welcome & Monthly */}
            <div className={cardClass}>
              <h3 className="text-sm font-medium text-[#d4af37]/80 mb-4">เครดิตต้อนรับ & รายเดือน</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>เครดิตต้อนรับ (สมัครใหม่)</label>
                  <input type="number" className={inputClass} value={s.welcomeCredits}
                    onChange={(e) => upd("welcomeCredits", Number(e.target.value))} />
                  <p className="text-[10px] text-white/20 mt-1">ให้ครั้งเดียวตอนสมัคร</p>
                </div>
                <div>
                  <label className={labelClass}>เครดิตฟรีรายเดือน</label>
                  <input type="number" className={inputClass} value={s.monthlyFreeCredits}
                    onChange={(e) => upd("monthlyFreeCredits", Number(e.target.value))} />
                  <p className="text-[10px] text-white/20 mt-1">เติมให้ทุกเดือนอัตโนมัติ</p>
                </div>
              </div>
            </div>

            {/* Credit Costs per Service */}
            <div className={cardClass}>
              <h3 className="text-sm font-medium text-[#d4af37]/80 mb-4">ค่าเครดิตแต่ละบริการ</h3>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: "creditCostTarot" as const, label: "ไพ่ทาโร่", icon: "🃏" },
                  { key: "creditCostGypsy" as const, label: "ไพ่ยิปซี", icon: "🔮" },
                  { key: "creditCostSiamsi" as const, label: "เซียมซี", icon: "🎋" },
                  { key: "creditCostAuspicious" as const, label: "ฤกษ์มงคล", icon: "✨" },
                  { key: "creditCostCalendar" as const, label: "ปฏิทิน", icon: "📅" },
                  { key: "creditCostNumerology" as const, label: "เลขศาสตร์", icon: "🔢" },
                ] as const).map((item) => (
                  <div key={item.key} className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-xs text-white/60">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="number" className={`${inputClass} !py-1.5 text-center`}
                        value={s[item.key]} onChange={(e) => upd(item.key, Number(e.target.value))} />
                      <span className="text-[10px] text-white/20 flex-shrink-0">เครดิต</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40">ค่าเริ่มต้น (เก่า)</span>
                  <input type="number" className={`${inputClass} !w-20 !py-1.5 text-center`}
                    value={s.creditCostPerReading} onChange={(e) => upd("creditCostPerReading", Number(e.target.value))} />
                  <span className="text-[10px] text-white/20">เครดิต/ครั้ง (fallback)</span>
                </div>
              </div>
            </div>

            {/* Credit Packages */}
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[#d4af37]/80">แพ็กเกจเติมเครดิต</h3>
                <button onClick={addPkg} className="text-xs text-[#d4af37]/60 hover:text-[#d4af37] transition-colors">+ เพิ่มแพ็กเกจ</button>
              </div>
              <div className="space-y-2">
                {s.creditPackages.map((pkg, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-3 bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] text-white/20 mb-0.5 block">เครดิต</label>
                        <input type="number" className={`${inputClass} !py-1.5`}
                          value={pkg.credits} onChange={(e) => updPkg(i, "credits", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[9px] text-white/20 mb-0.5 block">ราคา (฿)</label>
                        <input type="number" className={`${inputClass} !py-1.5`}
                          value={pkg.price} onChange={(e) => updPkg(i, "price", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[9px] text-white/20 mb-0.5 block">ชื่อ</label>
                        <input className={`${inputClass} !py-1.5`}
                          value={pkg.label} onChange={(e) => updPkg(i, "label", e.target.value)} />
                      </div>
                    </div>
                    <button onClick={() => removePkg(i)} className="text-red-400/30 hover:text-red-400/70 text-xs transition-colors p-1">✕</button>
                  </div>
                ))}
                {s.creditPackages.length === 0 && (
                  <p className="text-center text-white/20 text-xs py-4">ยังไม่มีแพ็กเกจ</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: AI Model ─── */}
        {tab === "ai" && (
          <div className="space-y-4">
            <div className={cardClass}>
              <h3 className="text-sm font-medium text-[#d4af37]/80 mb-4">โมเดล AI</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Model</label>
                  <select className={inputClass} value={s.model}
                    onChange={(e) => upd("model", e.target.value)}>
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (แนะนำ)</option>
                    <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (เร็ว/ถูก)</option>
                    <option value="claude-opus-4-6">Claude Opus 4.6 (แม่นยำสุด)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Max Tokens</label>
                  <input type="number" className={inputClass} value={s.maxTokens}
                    onChange={(e) => upd("maxTokens", Number(e.target.value))} />
                  <p className="text-[10px] text-white/20 mt-1">ควรอยู่ที่ 1500-3000</p>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#d4af37]/80">Prompt Template</h3>
                <span className="text-[10px] text-white/20">{s.promptTemplate.length} ตัวอักษร</span>
              </div>
              <textarea className={`${inputClass} !h-80 font-mono text-xs leading-relaxed resize-y`}
                value={s.promptTemplate}
                onChange={(e) => upd("promptTemplate", e.target.value)} />
              <div className="flex flex-wrap gap-2 mt-2">
                {["{{topic}}", "{{question}}", "{{spread}}", "{{cardDetails}}", "{{cardCount}}"].map((v) => (
                  <span key={v} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#d4af37]/10 text-[#d4af37]/50">{v}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: การชำระเงิน ─── */}
        {tab === "payment" && (
          <div className="space-y-4">
            {/* PromptPay */}
            <div className={cardClass}>
              <h3 className="text-sm font-medium text-[#d4af37]/80 mb-4">PromptPay</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>เบอร์ / เลขบัตร</label>
                  <input className={inputClass} value={s.promptPayNumber} placeholder="0812345678"
                    onChange={(e) => upd("promptPayNumber", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>ชื่อบัญชี</label>
                  <input className={inputClass} value={s.promptPayName} placeholder="ชื่อบัญชี"
                    onChange={(e) => upd("promptPayName", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Omise */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-medium text-[#d4af37]/80">Omise Payment Gateway</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${s.omiseConnected ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                  {s.omiseConnected ? "เชื่อมต่อแล้ว" : "ยังไม่ได้ตั้งค่า"}
                </span>
              </div>
              <p className="text-xs text-white/30 mb-4">ตั้งค่า OMISE_PUBLIC_KEY / OMISE_SECRET_KEY ใน .env บน VPS แล้ว restart container</p>
              {s.omisePublicKey && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-white/25 mb-1 block">Public Key</label>
                    <div className="bg-white/[0.03] rounded-lg px-3 py-2 text-xs font-mono text-white/40">{s.omisePublicKey}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/25 mb-1 block">Secret Key</label>
                    <div className="bg-white/[0.03] rounded-lg px-3 py-2 text-xs font-mono text-white/40">{s.omiseSecretKey}</div>
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                <label className="text-[10px] text-white/25 mb-1 block">Webhook URL</label>
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 cursor-pointer group"
                  onClick={() => { navigator.clipboard.writeText(window.location.origin + "/api/payment/webhook"); showToast("ok", "คัดลอกแล้ว"); }}>
                  <code className="text-xs text-white/50 flex-1">{typeof window !== "undefined" ? window.location.origin : ""}/api/payment/webhook</code>
                  <span className="text-[10px] text-white/20 group-hover:text-[#d4af37]/60 transition-colors">คัดลอก</span>
                </div>
              </div>
            </div>

            {/* LINE */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-medium text-[#d4af37]/80">LINE Login</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${s.lineConnected ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                  {s.lineConnected ? "เชื่อมต่อแล้ว" : "ยังไม่ได้ตั้งค่า"}
                </span>
              </div>
              <p className="text-xs text-white/30">ตั้งค่า LINE_CHANNEL_ID / LINE_CHANNEL_SECRET / LINE_CALLBACK_URL ใน .env บน VPS แล้ว restart container</p>
              {s.lineChannelId && (
                <div className="mt-3">
                  <label className="text-[10px] text-white/25 mb-1 block">Channel ID</label>
                  <div className="bg-white/[0.03] rounded-lg px-3 py-2 text-xs font-mono text-white/40">{s.lineChannelId}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Save */}
        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[#d4af37]/15 text-[#d4af37] hover:bg-[#d4af37]/25 transition-colors disabled:opacity-40">
            {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </button>
          {toast && <span className={`text-xs ${toast.type === "ok" ? "text-green-400" : "text-red-400"}`}>{toast.msg}</span>}
        </div>
      </main>
    </div>
  );
}
