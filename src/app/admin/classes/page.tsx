"use client";

import { useEffect, useState } from "react";
import { BookOpen, Check, CircleOff, Pencil, Plus, UsersRound } from "lucide-react";
import { EbdClass } from "@/lib/types";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<EbdClass[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/classes", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar as classes.");
      setClasses(data.classes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar as classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadClasses(); }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setSortOrder(0);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(editingId ? `/api/classes/${editingId}` : "/api/classes", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, sort_order: sortOrder }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar a classe.");
      setNotice(editingId ? "Classe atualizada." : "Classe cadastrada.");
      resetForm();
      await loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a classe.");
    } finally {
      setSaving(false);
    }
  };

  const editClass = (item: EbdClass) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || "");
    setSortOrder(item.sort_order);
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (item: EbdClass) => {
    setError(null);
    try {
      const response = await fetch(`/api/classes/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível alterar a classe.");
      setClasses((current) => current.map((entry) => entry.id === item.id ? data.class : entry));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível alterar a classe.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header>
        <span className="inline-flex items-center gap-2 rounded-full bg-church-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-church-700">
          <UsersRound className="h-3.5 w-3.5" /> Organização da EBD
        </span>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Classes</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Cadastre as turmas da EBD. Cada revista será vinculada a uma classe e aparecerá no espaço dos alunos daquela turma.</p>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {notice && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-church-50 text-church-700"><BookOpen className="h-5 w-5" /></div>
          <div><h2 className="font-bold text-slate-900">{editingId ? "Editar classe" : "Cadastrar uma classe"}</h2><p className="text-xs text-slate-500">O nome será usado para organizar o material dos alunos.</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-6">
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-3">Nome da classe
            <input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Adultos, Jovens, Crianças" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-normal text-slate-900" />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">Descrição (opcional)
            <input maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Faixa etária ou informações" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-normal text-slate-900" />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-1">Ordem
            <input type="number" min={0} max={9999} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-normal text-slate-900" />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-church-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-church-700/15 transition hover:bg-church-800 disabled:opacity-60">
            {editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{saving ? "Salvando…" : editingId ? "Salvar alterações" : "Cadastrar classe"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>}
        </div>
      </form>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div><h2 className="font-bold text-slate-900">Classes cadastradas</h2><p className="text-xs text-slate-500">Desativar oculta a classe dos alunos sem apagar as revistas.</p></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{classes.length}</span>
        </div>
        {loading ? <p className="p-8 text-center text-sm text-slate-500">Carregando classes…</p> : classes.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">Nenhuma classe encontrada. Confirme se a migração do banco foi executada.</p> : (
          <ul className="divide-y divide-slate-100">
            {classes.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}><UsersRound className="h-4 w-4" /></span>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{item.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.is_active ? "Ativa" : "Inativa"}</span></div><p className="mt-0.5 text-xs text-slate-500">{item.description || "Sem descrição"} · Ordem {item.sort_order}</p></div>
                </div>
                <div className="flex shrink-0 gap-2 pl-12 sm:pl-0">
                  <button onClick={() => editClass(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" />Editar</button>
                  <button onClick={() => void toggleActive(item)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${item.is_active ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>{item.is_active ? <><CircleOff className="h-3.5 w-3.5" />Desativar</> : <><Check className="h-3.5 w-3.5" />Ativar</>}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
