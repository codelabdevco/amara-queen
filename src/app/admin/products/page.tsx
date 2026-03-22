"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  salePrice: number;
  icon: string;
  images: string[];
  category: string;
  stock: number;
  weight: number;
  sortOrder: number;
  active: boolean;
}

const EMPTY: Product = {
  id: "", sku: "", name: "", description: "", longDescription: "",
  price: 0, salePrice: 0, icon: "✦", images: [], category: "",
  stock: 0, weight: 0, sortOrder: 0, active: true,
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCat, setNewCat] = useState("");

  function fetchData() {
    fetch("/api/admin/products")
      .then(r => { if (r.status === 401) { router.push("/admin/login"); return null; } return r.json(); })
      .then(d => { if (d) { setProducts(d.products || []); setCategories(d.categories || []); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, [router]);

  async function handleSave() {
    if (!editing || !editing.name || !editing.price) return;
    await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบสินค้านี้?")) return;
    await fetch("/api/admin/products", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  }

  async function handleToggleActive(p: Product) {
    await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, active: !p.active }),
    });
    fetchData();
  }

  async function handleSaveCategories(cats: string[]) {
    await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "saveCategories", categories: cats }),
    });
    setCategories(cats);
  }

  function addImage() {
    if (!newImageUrl.trim() || !editing) return;
    setEditing({ ...editing, images: [...editing.images, newImageUrl.trim()] });
    setNewImageUrl("");
  }

  function removeImage(idx: number) {
    if (!editing) return;
    setEditing({ ...editing, images: editing.images.filter((_, i) => i !== idx) });
  }

  const inputClass = "w-full rounded px-3 py-2 text-sm text-white/80 placeholder:text-white/15 outline-none focus:ring-1 focus:ring-white/10";
  const inputStyle = { background: "#0a0a0a", border: "1px solid #ffffff08" };
  const labelClass = "block text-white/30 text-[0.6rem] mb-1 uppercase tracking-wider";

  return (
    <div className="flex h-screen">
      <AdminNav />
      <main className="flex-1 ml-56 p-8 h-screen overflow-y-auto pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">สินค้า</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowCatManager(!showCatManager)}
              className="px-3 py-1.5 rounded text-xs text-white/40 hover:text-white/70 transition-colors"
              style={{ background: "#111111", border: "1px solid #ffffff06" }}
            >จัดการหมวดหมู่</button>
            <button onClick={() => setEditing({ ...EMPTY })}
              className="px-3 py-1.5 rounded text-xs font-medium"
              style={{ background: "#d4af37", color: "#0a0a0a" }}
            >+ เพิ่มสินค้า</button>
          </div>
        </div>

        {/* Category Manager */}
        {showCatManager && (
          <div className="rounded-lg p-4 mb-6 space-y-3" style={{ background: "#111111", border: "1px solid #ffffff06" }}>
            <p className="text-white/50 text-xs font-semibold">หมวดหมู่</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, i) => (
                <div key={i} className="flex items-center gap-1 rounded px-2.5 py-1 text-xs text-white/60" style={{ background: "#0a0a0a", border: "1px solid #ffffff08" }}>
                  {cat}
                  <button onClick={() => handleSaveCategories(categories.filter((_, idx) => idx !== i))} className="text-red-400/40 hover:text-red-400 ml-1">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่"
                className="flex-1 rounded px-3 py-1.5 text-xs text-white/80 placeholder:text-white/15 outline-none" style={inputStyle} />
              <button onClick={() => { if (newCat.trim()) { handleSaveCategories([...categories, newCat.trim()]); setNewCat(""); } }}
                className="px-3 py-1.5 rounded text-xs" style={{ background: "#d4af37", color: "#0a0a0a" }}>เพิ่ม</button>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <div className="rounded-lg p-5 mb-6 space-y-4" style={{ background: "#111111", border: "1px solid #ffffff06" }}>
            <p className="text-white/70 text-sm font-semibold">{editing.id ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</p>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>ชื่อสินค้า *</label>
                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="ชื่อสินค้า" className={inputClass} style={inputStyle} /></div>
              <div><label className={labelClass}>SKU</label>
                <input value={editing.sku} onChange={e => setEditing({ ...editing, sku: e.target.value })} placeholder="SKU-001" className={inputClass} style={inputStyle} /></div>
            </div>

            <div><label className={labelClass}>คำอธิบายสั้น</label>
              <input value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="คำอธิบายสั้นๆ" className={inputClass} style={inputStyle} /></div>

            <div><label className={labelClass}>รายละเอียดเพิ่มเติม</label>
              <textarea value={editing.longDescription} onChange={e => setEditing({ ...editing, longDescription: e.target.value })} placeholder="รายละเอียด..." rows={3} className={`${inputClass} resize-y`} style={inputStyle} /></div>

            <div className="grid grid-cols-4 gap-4">
              <div><label className={labelClass}>ราคาปกติ (฿) *</label>
                <input type="number" value={editing.price || ""} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} className={inputClass} style={inputStyle} /></div>
              <div><label className={labelClass}>ราคาลด (฿)</label>
                <input type="number" value={editing.salePrice || ""} onChange={e => setEditing({ ...editing, salePrice: Number(e.target.value) })} placeholder="0 = ไม่ลด" className={inputClass} style={inputStyle} /></div>
              <div><label className={labelClass}>สต็อก</label>
                <input type="number" value={editing.stock || ""} onChange={e => setEditing({ ...editing, stock: Number(e.target.value) })} className={inputClass} style={inputStyle} /></div>
              <div><label className={labelClass}>น้ำหนัก (กรัม)</label>
                <input type="number" value={editing.weight || ""} onChange={e => setEditing({ ...editing, weight: Number(e.target.value) })} className={inputClass} style={inputStyle} /></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelClass}>หมวดหมู่</label>
                <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className={inputClass} style={inputStyle}>
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div><label className={labelClass}>ไอคอน</label>
                <input value={editing.icon} onChange={e => setEditing({ ...editing, icon: e.target.value })} placeholder="✦" className={inputClass} style={inputStyle} /></div>
              <div><label className={labelClass}>ลำดับ</label>
                <input type="number" value={editing.sortOrder || ""} onChange={e => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className={inputClass} style={inputStyle} /></div>
            </div>

            {/* Images */}
            <div>
              <label className={labelClass}>รูปสินค้า</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editing.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded overflow-hidden group" style={{ border: "1px solid #ffffff08" }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-red-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                ))}
                {editing.images.length === 0 && <div className="w-20 h-20 rounded flex items-center justify-center text-white/10 text-xs" style={{ background: "#0a0a0a", border: "1px dashed #ffffff10" }}>ไม่มีรูป</div>}
              </div>
              <div className="flex gap-2">
                <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className={`flex-1 ${inputClass}`} style={inputStyle} onKeyDown={e => e.key === "Enter" && addImage()} />
                <button onClick={addImage} className="px-3 py-1.5 rounded text-xs" style={{ background: "#d4af37", color: "#0a0a0a" }}>เพิ่มรูป</button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4 rounded accent-[#d4af37]" />
              <span className="text-white/50 text-xs">เปิดขาย</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded text-xs text-white/40 hover:text-white/70" style={{ background: "#0a0a0a", border: "1px solid #ffffff08" }}>ยกเลิก</button>
              <button onClick={handleSave} disabled={!editing.name || !editing.price} className="px-4 py-2 rounded text-xs font-medium disabled:opacity-30" style={{ background: "#d4af37", color: "#0a0a0a" }}>บันทึก</button>
            </div>
          </div>
        )}

        {/* Product List */}
        {loading ? (
          <div className="flex items-center gap-3 text-white/30"><div className="w-4 h-4 border-2 border-white/10 border-t-[#d4af37] rounded-full animate-spin" /> กำลังโหลด...</div>
        ) : products.length === 0 && !editing ? (
          <div className="rounded-lg p-10 text-center text-white/20 text-sm" style={{ background: "#111111" }}>ยังไม่มีสินค้า กด "+ เพิ่มสินค้า" เพื่อเริ่มต้น</div>
        ) : (
          <div className="space-y-2">
            {products.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(p => (
              <div key={p.id} className="rounded-lg p-4 flex items-center gap-4" style={{ background: "#111111", border: "1px solid #ffffff06", opacity: p.active ? 1 : 0.5 }}>
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="w-14 h-14 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded flex items-center justify-center text-xl text-[#d4af37]/40 flex-shrink-0" style={{ background: "#0a0a0a" }}>{p.icon}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white/80 text-sm font-medium truncate">{p.name}</p>
                    {p.sku && <span className="text-white/20 text-[0.55rem] font-mono">{p.sku}</span>}
                    {!p.active && <span className="text-red-400/50 text-[0.5rem] bg-red-400/10 px-1.5 py-0.5 rounded">ปิด</span>}
                  </div>
                  <p className="text-white/30 text-xs truncate">{p.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {p.salePrice > 0 ? (
                      <><span className="text-[#d4af37] text-sm font-semibold">฿{p.salePrice}</span><span className="text-white/25 text-xs line-through">฿{p.price}</span></>
                    ) : (
                      <span className="text-[#d4af37] text-sm font-semibold">฿{p.price}</span>
                    )}
                    <span className="text-white/20 text-[0.6rem]">{p.category}</span>
                    <span className="text-white/20 text-[0.6rem]">สต็อก {p.stock}</span>
                    {p.images?.length > 0 && <span className="text-white/20 text-[0.6rem]">{p.images.length} รูป</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => handleToggleActive(p)} className="px-2 py-1 rounded text-[0.6rem] text-white/30 hover:text-white/60" style={{ background: "#0a0a0a" }}>{p.active ? "ปิด" : "เปิด"}</button>
                  <button onClick={() => setEditing({ ...p })} className="px-2 py-1 rounded text-[0.6rem] text-[#d4af37]/50 hover:text-[#d4af37]" style={{ background: "#0a0a0a" }}>แก้ไข</button>
                  <button onClick={() => handleDelete(p.id)} className="px-2 py-1 rounded text-[0.6rem] text-red-400/30 hover:text-red-400" style={{ background: "#0a0a0a" }}>ลบ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
