"use client";

import { useState, useEffect, useCallback } from "react";
import { UserRound, Plus, Loader2, Search, Pencil, Trash2 } from "lucide-react";

interface RefereeItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  matchesWithIncidentsCount?: number;
}

const ROLE_OPTIONS = [
  { value: "REFEREE", label: "Hakem" },
  { value: "VAR", label: "VAR Hakemi" },
];

export default function DashboardRefereesPage() {
  const [referees, setReferees] = useState<RefereeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "REFEREE",
    bio: "",
    photoUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/referees", { cache: "no-store" });
      const data = await res.json();
      setReferees(Array.isArray(data) ? data : []);
    } catch {
      setReferees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function resetForm() {
    setFormData({ name: "", role: "REFEREE", bio: "", photoUrl: "" });
    setShowAddForm(false);
    setEditingSlug(null);
  }

  function startEdit(r: RefereeItem) {
    setEditingSlug(r.slug);
    setShowAddForm(true);
    setFormData({
      name: r.name,
      role: r.role,
      bio: r.bio ?? "",
      photoUrl: r.photoUrl ?? "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSlug) {
        const res = await fetch(`/api/referees/${editingSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          resetForm();
          fetchData();
        }
      } else {
        const res = await fetch("/api/referees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          resetForm();
          fetchData();
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Bu hakemi silmek istediğinize emin misiniz? Maç atamaları kaldırılacak.")) return;
    try {
      const res = await fetch(`/api/referees/${slug}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        if (editingSlug === slug) resetForm();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  const filtered = referees.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <UserRound className="h-6 w-6 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Hakemler</h1>
            <p className="mt-0.5 text-sm text-zinc-400">Hakem ve VAR hakemlerini ekleyin, maçlara atayın</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setShowAddForm(true); setEditingSlug(null); setFormData({ name: "", role: "REFEREE", bio: "", photoUrl: "" }); }}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
        >
          <Plus className="h-4 w-4" />
          Hakem Ekle
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {editingSlug ? "Hakemi Düzenle" : "Yeni Hakem Ekle"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Ad Soyad</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="ör. Halil Umut Meler"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Rol</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Kısa bilgi (isteğe bağlı)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={2}
                placeholder="Kısa biyografi veya not"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Fotoğraf URL (isteğe bağlı)</label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingSlug ? "Güncelle" : "Ekle")}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
              >
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
            placeholder="Hakem ara..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-400">Hakem bulunamadı</p>
          <p className="mt-1 text-sm text-zinc-500">Maçlara atamak için hakem ekleyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div>
                <p className="font-bold text-white">{r.name}</p>
                <p className="text-xs text-zinc-500">{ROLE_OPTIONS.find((o) => o.value === r.role)?.label ?? r.role}</p>
                {r.matchesWithIncidentsCount != null && r.matchesWithIncidentsCount > 0 && (
                  <p className="mt-1 text-xs text-amber-400">{r.matchesWithIncidentsCount} maçta tartışmalı karar</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/hakemler/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  title="Sayfada görüntüle"
                >
                  Görüntüle
                </a>
                <button
                  type="button"
                  onClick={() => startEdit(r)}
                  className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  title="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.slug)}
                  className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
