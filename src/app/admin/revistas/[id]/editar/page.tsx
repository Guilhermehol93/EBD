"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Download,
  Trash2,
} from "lucide-react";
import { EbdClass, Magazine, MagazineStatus } from "@/lib/types";
import { formatFileSize, formatSaoPauloDateTimeLocal, saoPauloDateTimeLocalToISOString } from "@/lib/utils";

export default function EditarRevistaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;

  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [classes, setClasses] = useState<EbdClass[]>([]);
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editionQuarter, setEditionQuarter] = useState("");
  const [lessonNumber, setLessonNumber] = useState<number | "">("");
  const [lessonDate, setLessonDate] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [status, setStatus] = useState<MagazineStatus>("scheduled");
  const [whatsappScheduled, setWhatsappScheduled] = useState(true);
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    const fetchMagazine = async () => {
      try {
        const [res, classesRes] = await Promise.all([fetch(`/api/revistas/${id}`), fetch("/api/classes", { cache: "no-store" })]);
        if (!res.ok) throw new Error("Revista não encontrada.");
        const classesData = await classesRes.json();
        if (!classesRes.ok) throw new Error(classesData.error || "Falha ao carregar classes.");
        const data: Magazine = await res.json();
        setMagazine(data);
        // Keep a currently assigned inactive class visible so the magazine can
        // remain unchanged, but don't offer inactive classes as new choices.
        setClasses(
          (classesData.classes || []).filter(
            (item: EbdClass) => item.is_active || item.id === data.class_id
          )
        );
        setClassId(data.class_id);
        setTitle(data.title);
        setDescription(data.description || "");
        setEditionQuarter(data.edition_quarter || "");
        setLessonNumber(data.lesson_number || "");
        setLessonDate(data.lesson_date ? data.lesson_date.split("T")[0] : "");
        setPublishAt(data.publish_at ? formatSaoPauloDateTimeLocal(data.publish_at) : "");
        setStatus(data.status);
        setWhatsappScheduled(data.whatsapp_scheduled);
        setCustomMessage(data.whatsapp_message_custom || "");
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMagazine();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/revistas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          class_id: classId,
          description,
          edition_quarter: editionQuarter,
          lesson_number: lessonNumber ? Number(lessonNumber) : null,
          lesson_date: lessonDate,
          publish_at: saoPauloDateTimeLocalToISOString(publishAt),
          status,
          whatsapp_scheduled: whatsappScheduled,
          whatsapp_message_custom: customMessage || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar.");

      setSuccessMsg("Informações atualizadas com sucesso!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendWhatsAppNow = async () => {
    if (!confirm("Deseja disparar agora a mensagem no WhatsApp para este estudo?")) return;

    try {
      const res = await fetch("/api/whatsapp/send-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magazineId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert("Erro no envio: " + (data.error || "Falha"));
      } else {
        alert("Mensagem disparada com sucesso no grupo!");
      }
    } catch (e: any) {
      alert("Erro na requisição: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Carregando informações da revista...
      </div>
    );
  }

  if (!magazine) {
    return (
      <div className="p-8 text-center text-rose-500">
        Revista não encontrada.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/revistas"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Revistas</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/files/download/${id}`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Arquivo ({formatFileSize(magazine.file_size)})</span>
          </a>

          <button
            type="button"
            onClick={handleSendWhatsAppNow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Disparar WhatsApp Agora</span>
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Editar Revista
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Arquivo: {magazine.file_name} ({formatFileSize(magazine.file_size)})
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Classe da EBD *</label>
              <select required value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500">
                {classes.map((item) => <option key={item.id} value={item.id}>{item.name}{item.is_active ? "" : " (inativa — classe atual)"}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Título da Lição *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Trimestre / Edição
              </label>
              <input
                type="text"
                value={editionQuarter}
                onChange={(e) => setEditionQuarter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Número da Lição
              </label>
              <input
                type="number"
                value={lessonNumber}
                onChange={(e) => setLessonNumber(e.target.value ? parseInt(e.target.value, 10) : "")}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Data do Domingo da Aula *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  required
                  value={lessonDate}
                  onChange={(e) => setLessonDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Data e Hora de Liberação Pública (horário de Brasília) *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  required
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Status da Revista
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MagazineStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              >
                <option value="scheduled">Agendada (Libera no horário programado)</option>
                <option value="published">Publicada (Visível no portal público agora)</option>
                <option value="archived">Arquivada (Oculta do destaque)</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappScheduled}
                  onChange={(e) => setWhatsappScheduled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-xs font-semibold text-slate-700">
                  Agendar envio automático no WhatsApp
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Descrição ou Referência Bíblica
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Link
            href="/admin/revistas"
            className="rounded-xl px-5 py-2.5 text-center text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 sm:text-left"
          >
            Voltar
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-church-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-church-700/20 transition-all hover:bg-church-800 disabled:opacity-50"
          >
            {saving ? (
              <span>Salvando alterações...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
