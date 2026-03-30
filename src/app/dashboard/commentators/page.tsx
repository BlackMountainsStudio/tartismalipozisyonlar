"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Loader2,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  User,
} from "lucide-react";

interface Commentator {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  education: string | null;
  career: string[];
  expertise: string[];
  opinions: { id: string }[];
}

export default function DashboardCommentatorsPage() {
  const [commentators, setCommentators] = useState<Commentator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    photoUrl: "",
    birthDate: "",
    birthPlace: "",
    education: "",
    expertise: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/commentators", { cache: "no-store" });
      const data = await res.json();
      setCommentators(Array.isArray(data) ? data : []);
    } catch {
      setCommentators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function resetForm() {
    setFormData({ name: "", role: "", bio: "", photoUrl: "", birthDate: "", birthPlace: "", education: "", expertise: "" });
    setShowAddForm(false);
    setEditingSlug(null);
  }

  function startEdit(c: Commentator) {
    setEditingSlug(c.slug);
    setShowAddForm(true);
    setFormData({
      name: c.name,
      role: c.role,
      bio: c.bio,
      photoUrl: c.photoUrl ?? "",
      birthDate: c.birthDate ?? "",
      birthPlace: c.birthPlace ?? "",
      education: c.education ?? "",
      expertise: c.expertise.join(", "),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...formData,
        expertise: formData.expertise.split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (editingSlug) {
        const res = await fetch(`/api/commentators/${editingSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          resetForm();
          fetchData();
        }
      } else {
        const res = await fetch("/api/commentators", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          resetForm();
          fetchData();
        }
      }
    } catch {
      console.error("Failed to save commentator");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Bu yorumcuyu silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/commentators/${slug}`, { method: "DELETE" });
      setCommentators((prev) => prev.filter((c) => c.slug !== slug));
    } catch {
      console.error("Delete failed");
    }
  }

  const filtered = commentators.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Yorumcu Yönetimi</h1>
            <p className="mt-0.5 text-sm text-zinc-400">Yorumcuları ekleyin, düzenleyin ve yönetin</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          <Plus className="h-4 w-4" />
          Yorumcu Ekle
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {editingSlug ? "Yorumcu Düzenle" : "Yeni Yorumcu Ekle"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Ad Soyad</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="ör. Erman Toroğlu"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Rol</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                placeholder="ör. Eski Hakem, Yorumcu"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Fotoğraf URL</label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Doğum Tarihi</label>
              <input
                type="text"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                placeholder="ör. 1 Ocak 1960"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Doğum Yeri</label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                placeholder="ör. İstanbul"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Eğitim</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="ör. Beden Eğitimi"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Biyografi</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
                rows={3}
                placeholder="Kısa biyografi..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Uzmanlık Alanları (virgülle ayırın)</label>
              <input
                type="text"
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                placeholder="ör. Hakem Kararları, VAR, Penaltı"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editingSlug ? "Güncelle" : "Ekle"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">
                İptal
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Yorumcu ara..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-zinc-700" />
          <p className="text-zinc-400">Yorumcu bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                  <User className="h-5 w-5 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">{c.name}</h3>
                  <p className="text-xs text-zinc-500">{c.role}</p>
                </div>
              </div>
              <p className="mb-3 line-clamp-2 text-sm text-zinc-400">{c.bio}</p>
              <div className="mb-3 flex flex-wrap gap-1">
                {c.expertise.slice(0, 3).map((e, idx) => (
                  <span key={idx} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                    {e}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {c.opinions.length} görüş
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(c)}
                    className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.slug)}
                    className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
