"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlusCircle,
  Search,
  Download,
  Eye,
  Trash2,
  Edit,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { EbdClass, Magazine } from "@/lib/types";
import { formatDatePtBR, formatDateTimePtBR, formatFileSize } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { WhatsAppBadge } from "@/components/admin/WhatsAppBadge";
import { createClient } from "@/lib/supabase/client";

export default function AdminRevistasPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [classes, setClasses] = useState<EbdClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "published" | "scheduled" | "archived">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMagazines = async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data, error }, classesResponse] = await Promise.all([
      supabase.from("magazines").select("*").order("created_at", { ascending: false }),
      fetch("/api/classes", { cache: "no-store" }),
    ]);

    if (!error && data) {
      setMagazines(data as Magazine[]);
    }
    if (classesResponse.ok) {
      const classesData = await classesResponse.json();
      setClasses(classesData.classes || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMagazines();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir a revista "${title}"?\nO arquivo PDF será apagado permanentemente do disco.`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/revistas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Revista excluída com sucesso.");
        setMagazines(magazines.filter((m) => m.id !== id));
      } else {
        alert("Erro ao excluir: " + (data.error || "Falha desconhecida"));
      }
    } catch (e: any) {
      alert("Erro na requisição: " + e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendWhatsAppNow = async (id: string, title: string) => {
    if (!confirm(`Disparar mensagem no WhatsApp agora para a revista "${title}"?`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch("/api/whatsapp/send-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magazineId: id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Mensagem enviada com sucesso no grupo do WhatsApp!");
        fetchMagazines();
      } else {
        alert("Erro no envio do WhatsApp: " + (data.error || "Falha na comunicação"));
      }
    } catch (e: any) {
      alert("Erro na requisição: " + e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredMagazines = magazines.filter((m) => {
    if (filterTab !== "all" && m.status !== filterTab) return false;
    const q = searchTerm.toLowerCase();
    const titleMatch = m.title.toLowerCase().includes(q);
    const quarterMatch = (m.edition_quarter || "").toLowerCase().includes(q);
    const classMatch = (classes.find((item) => item.id === m.class_id)?.name || "").toLowerCase().includes(q);
    const numberMatch = m.lesson_number ? String(m.lesson_number).includes(q) : false;
    return titleMatch || quarterMatch || classMatch || numberMatch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white shadow-2xl animate-in slide-in-from-bottom duration-200 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gerenciamento de Revistas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre, agende a liberação e monitore os downloads e envios de WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMagazines}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/revistas/nova"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-church-700 hover:bg-church-800 transition-all shadow-md shadow-church-700/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload de Nova Revista</span>
          </Link>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterTab === "all"
                ? "bg-church-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Todas ({magazines.length})
          </button>
          <button
            onClick={() => setFilterTab("published")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterTab === "published"
                ? "bg-church-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Publicadas ({magazines.filter((m) => m.status === "published").length})
          </button>
          <button
            onClick={() => setFilterTab("scheduled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterTab === "scheduled"
                ? "bg-church-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Agendadas ({magazines.filter((m) => m.status === "scheduled").length})
          </button>
          <button
            onClick={() => setFilterTab("archived")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterTab === "archived"
                ? "bg-church-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Arquivadas ({magazines.filter((m) => m.status === "archived").length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar revistas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-church-600" />
            <p className="text-xs">Carregando revistas...</p>
          </div>
        ) : filteredMagazines.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-700">Nenhuma revista encontrada</p>
            <p className="text-xs text-slate-400 mt-1">
              Tente mudar o filtro ou pesquise por outro termo.
            </p>
          </div>
        ) : (
          <>
          <div className="space-y-3 p-3 2xl:hidden">
            {filteredMagazines.map((mag) => (
              <article key={mag.id} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h2 className="break-words font-bold leading-snug text-slate-900">{mag.title}</h2><p className="mt-1 break-words text-xs text-slate-500">{classes.find((item) => item.id === mag.class_id)?.name || "Classe"} · {mag.edition_quarter} · Lição {mag.lesson_number || "especial"}</p></div>
                  <StatusBadge status={mag.status} publishAt={mag.publish_at} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-3 text-xs">
                  <div><span className="block text-slate-400">Data da aula</span><span className="font-medium text-slate-700">{formatDatePtBR(mag.lesson_date)}</span></div>
                  <div><span className="block text-slate-400">Liberação</span><span className="font-medium text-slate-700">{formatDateTimePtBR(mag.publish_at)}</span></div>
                  <div><span className="block text-slate-400">Leituras / Downloads</span><span className="font-mono text-slate-700">{mag.views_count || 0} / {mag.downloads_count || 0}</span></div>
                  <div className="flex items-center gap-1"><WhatsAppBadge scheduled={mag.whatsapp_scheduled} sent={mag.whatsapp_sent} sentAt={mag.whatsapp_sent_at} />{!mag.whatsapp_sent && <button onClick={() => handleSendWhatsAppNow(mag.id, mag.title)} disabled={actionLoadingId === mag.id} className="rounded p-1 text-slate-500 hover:bg-slate-200" title="Enviar no WhatsApp"><MessageSquare className="h-4 w-4" /></button>}</div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3">
                  <Link href={`/admin/revistas/${mag.id}/editar`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-church-700 px-3 py-2 text-xs font-semibold text-white"><Edit className="h-3.5 w-3.5" />Editar</Link>
                  <a href={`/revistas/${mag.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700"><ExternalLink className="h-3.5 w-3.5" />Ver</a>
                  <a href={`/api/files/download/${mag.id}`} download className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700"><Download className="h-3.5 w-3.5" />Baixar</a>
                  <button onClick={() => handleDelete(mag.id, mag.title)} disabled={actionLoadingId === mag.id} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"><Trash2 className="h-3.5 w-3.5" />Excluir</button>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto 2xl:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Título / Lição</th>
                  <th className="px-6 py-3.5">Data da Lição</th>
                  <th className="px-6 py-3.5">Disponibilização</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">WhatsApp</th>
                  <th className="px-6 py-3.5 text-center">Leituras / Downloads</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMagazines.map((mag) => (
                  <tr key={mag.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 leading-snug">{mag.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {classes.find((item) => item.id === mag.class_id)?.name || "Classe"} • {mag.edition_quarter} • Lição {mag.lesson_number} • {formatFileSize(mag.file_size)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs font-medium">
                      {formatDatePtBR(mag.lesson_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">
                      {formatDateTimePtBR(mag.publish_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={mag.status} publishAt={mag.publish_at} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <WhatsAppBadge
                          scheduled={mag.whatsapp_scheduled}
                          sent={mag.whatsapp_sent}
                          sentAt={mag.whatsapp_sent_at}
                        />
                        {!mag.whatsapp_sent && (
                          <button
                            onClick={() => handleSendWhatsAppNow(mag.id, mag.title)}
                            disabled={actionLoadingId === mag.id}
                            className="p-1 rounded text-slate-400 hover:text-church-600 hover:bg-slate-100 transition-colors"
                            title="Disparar no WhatsApp agora"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-mono text-slate-600">
                      <span>{mag.views_count || 0}</span> / <span>{mag.downloads_count || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View online */}
                        <a
                          href={`/revistas/${mag.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-church-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Abrir página pública"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Download file */}
                        <a
                          href={`/api/files/download/${mag.id}`}
                          download
                          className="p-1.5 text-slate-500 hover:text-church-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Baixar arquivo PDF local"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {/* Edit */}
                        <Link
                          href={`/admin/revistas/${mag.id}/editar`}
                          className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Editar informações"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(mag.id, mag.title)}
                          disabled={actionLoadingId === mag.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Excluir revista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
