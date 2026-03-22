"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: string;
  stock: number;
  active: boolean;
}

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  icon: "",
  category: "",
  stock: 0,
  active: true,
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<"hidden" | "create" | "edit">("hidden");
  const [formData, setFormData] = useState<Omit<Product, "id"> & { id?: string }>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  function fetchProducts() {
    setLoading(true);
    fetch("/api/admin/products")
      .then((res) => {
        if (res.status === 401) { router.push("/admin/login"); return null; }
        return res.json();
      })
      .then((data) => { if (data) setProducts(data.products ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function openCreate() {
    setFormData({ ...EMPTY_PRODUCT });
    setFormMode("create");
  }

  function openEdit(product: Product) {
    setFormData({ ...product });
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode("hidden");
    setFormData({ ...EMPTY_PRODUCT });
  }

  async function saveProduct() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (res.ok) {
        const data = await res.json();
        if (formMode === "edit" && formData.id) {
          setProducts((prev) => prev.map((p) => (p.id === formData.id ? { ...p, ...formData, id: p.id } : p)));
        } else if (data.product) {
          setProducts((prev) => [...prev, data.product]);
        } else {
          fetchProducts();
        }
        closeForm();
      }
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("ต้องการลบสินค้านี้?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      /* silent */
    } finally {
      setDeleting(null);
    }
  }

  async function toggleActive(product: Product) {
    const updated = { ...product, active: !product.active };
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (res.ok) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      }
    } catch {
      /* silent */
    }
  }

  function formatCurrency(n: number) {
    return n.toLocaleString("th-TH", { minimumFractionDigits: 0 });
  }

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">สินค้า</h2>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-gold/10 text-gold text-sm rounded-lg hover:bg-gold/20 transition-colors"
          >
            + เพิ่มสินค้า
          </button>
        </div>

        {/* Inline Form */}
        {formMode !== "hidden" && (
          <div className="bg-[#2a1215] rounded-xl p-6 mb-6">
            <h3 className="text-gold text-sm font-semibold mb-4">
              {formMode === "create" ? "เพิ่มสินค้าใหม่" : "แก้ไขสินค้า"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/30 text-[0.6rem] uppercase tracking-wider block mb-1">ชื่อสินค้า</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-[#1e0c0c] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold/50 placeholder:text-white/20"
                  placeholder="ชื่อสินค้า"
                />
              </div>
              <div>
                <label className="text-white/30 text-[0.6rem] uppercase tracking-wider block mb-1">ไอคอน</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
                  className="w-full bg-[#1e0c0c] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold/50 placeholder:text-white/20"
                  placeholder="เช่น ✧ หรือ URL"
                />
              </div>
              <div className="col-span-2">
                <label className="text-white/30 text-[0.6rem] uppercase tracking-wider block mb-1">รายละเอียด</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#1e0c0c] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold/50 placeholder:text-white/20 resize-none"
                  placeholder="รายละเอียดสินค้า"
                />
              </div>
              <div>
                <label className="text-white/30 text-[0.6rem] uppercase tracking-wider block mb-1">ราคา (บาท)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))}
                  className="w-full bg-[#1e0c0c] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold/50"
                  min={0}
                />
              </div>
              <div>
                <label className="text-white/30 text-[0.6rem] uppercase tracking-wider block mb-1">หมวดหมู่</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-[#1e0c0c] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold/50 placeholder:text-white/20"
                  placeholder="หมวดหมู่"
                />
              </div>
              <div>
                <label className="text-white/30 text-[0.6rem] uppercase tracking-wider block mb-1">สต็อก</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData((p) => ({ ...p, stock: Number(e.target.value) }))}
                  className="w-full bg-[#1e0c0c] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold/50"
                  min={0}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setFormData((p) => ({ ...p, active: !p.active }))}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${formData.active ? "bg-green-500/40" : "bg-white/10"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${formData.active ? "left-5" : "left-0.5"}`}
                    />
                  </div>
                  <span className="text-white/50 text-sm">{formData.active ? "เปิดขาย" : "ปิดขาย"}</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={saveProduct}
                disabled={saving || !formData.name}
                className="px-4 py-2 bg-gold/20 text-gold text-sm rounded-lg hover:bg-gold/30 transition-colors disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                onClick={closeForm}
                className="px-4 py-2 bg-white/5 text-white/50 text-sm rounded-lg hover:bg-white/10 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Product Cards */}
        {loading ? (
          <div className="text-white/30 text-center py-20">กำลังโหลด...</div>
        ) : products.length === 0 ? (
          <div className="text-white/30 text-center py-20">ยังไม่มีสินค้า</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-[#2a1215] rounded-xl p-5 transition-opacity ${!product.active ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{product.icon || "✧"}</span>
                    <div>
                      <p className="text-white/90 font-medium text-sm">{product.name}</p>
                      <p className="text-white/30 text-xs">{product.category}</p>
                    </div>
                  </div>
                  <div
                    onClick={() => toggleActive(product)}
                    className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer shrink-0 ${product.active ? "bg-green-500/40" : "bg-white/10"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${product.active ? "left-4" : "left-0.5"}`}
                    />
                  </div>
                </div>

                {product.description && (
                  <p className="text-white/40 text-xs mb-3 line-clamp-2">{product.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-gold font-semibold">฿{formatCurrency(product.price)}</span>
                  <span className="text-white/30 text-xs">สต็อก: {product.stock}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 px-3 py-1.5 bg-gold/10 text-gold text-xs rounded-lg hover:bg-gold/20 transition-colors"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    disabled={deleting === product.id}
                    className="flex-1 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {deleting === product.id ? "กำลังลบ..." : "ลบ"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
