"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  Calendar,
  Clock,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
} from "lucide-react";
import { formatFileSize, getNextSunday, saoPauloDateTimeLocalToISOString } from "@/lib/utils";
import { EbdClass } from "@/lib/types";

export default function NovaRevistaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested next Sunday
  const nextSunday = getNextSunday();
  const defaultSundayDate = nextSunday.toISOString().split("T")[0];
  const defaultPublishAt = `${defaultSundayDate}T08:00`;

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [classes, setClasses] = useState<EbdClass[]>([]);
  const [classId, setClassId] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editionQuarter, setEditionQuarter] = useState("4º Trimestre / 2026");
  const [lessonNumber, setLessonNumber] = useState<number | "">(1);
  const [lessonDate, setLessonDate] = useState(defaultSundayDate);
  const [publishAt, setPublishAt] = useState(defaultPublishAt);
  const [whatsappScheduled, setWhatsappScheduled] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/classes", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha ao carregar as classes.");
        const activeClasses = (data.classes || []).filter((item: EbdClass) => item.is_active);
        setClasses(activeClasses);
        setClassId(activeClasses.find((item: EbdClass) => item.slug === "geral")?.id || activeClasses[0]?.id || "");
      })
      .catch((error) => setErrorMsg(error.message));
  }, []);

  // File drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Apenas arquivos PDF são aceitos.");
      return;
    }
    setErrorMsg(null);
    setFile(selectedFile);

    // Auto-fill title from file name if empty
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(cleanName);
    }
  };

  // WhatsApp Message Preview computation
  const previewDirectLink = typeof window !== "undefined"
    ? `${window.location.origin}/revistas/[id-gerado]`
    : "http://localhost:3000/revistas/[id-gerado]";

  const previewMessage = customMessage || (
    `📖 *Escola Bíblica Dominical - PIB Cataguases*\n\n` +
    `A Paz do Senhor! Já está disponível a revista da EBD para o estudo desta semana!\n\n` +
    `📌 *${title || "Título da Lição"}*\n` +
    `📅 *Data:* ${lessonDate ? lessonDate.split("-").reverse().join("/") : "DD/MM/AAAA"}\n` +
    `📖 *Lição:* ${lessonNumber ? String(lessonNumber).padStart(2, "0") : "01"} | ${editionQuarter}\n\n` +
    `👉 Acesse a página da revista:\n${previewDirectLink}\n\n` +
    `_"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." (Sl 119:105)_`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Selecione o arquivo PDF da revista.");
      return;
    }
    if (!title || !lessonDate || !publishAt) {
      setErrorMsg("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("class_id", classId);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("edition_quarter", editionQuarter);
      formData.append("lesson_number", String(lessonNumber));
      formData.append("lesson_date", lessonDate);
      formData.append("publish_at", saoPauloDateTimeLocalToISOString(publishAt));
      formData.append("whatsapp_scheduled", String(whatsappScheduled));
      if (customMessage) {
        formData.append("whatsapp_message_custom", customMessage);
      }

      const res = await fetch("/api/revistas/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Erro ao salvar a revista.");
        setLoading(false);
        return;
      }

      router.push("/admin/revistas");
      router.refresh();
    } catch (err: any) {
      setErrorMsg("Erro na requisição de upload: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/revistas"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Revistas</span>
        </Link>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload e Agendamento de Revista
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Envie o PDF da lição semanal e defina o horário de liberação e disparo no WhatsApp.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: File Upload Box */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-church-100 text-church-700 text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>Arquivo PDF da Revista</span>
          </h2>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              dragActive
                ? "border-church-500 bg-church-50/50"
                : file
                ? "border-emerald-400 bg-emerald-50/30"
                : "border-slate-300 hover:border-church-400 bg-slate-50 hover:bg-slate-100/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2 text-emerald-700">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-slate-900 mt-1">{file.name}</p>
                <p className="text-xs text-slate-500 font-mono">
                  Tamanho: {formatFileSize(file.size)} • Clique para trocar de arquivo
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-church-600" />
                </div>
                <p className="font-bold text-sm text-slate-800 mt-1">
                  Arraste o arquivo PDF aqui ou clique para selecionar
                </p>
                <p className="text-xs text-slate-500">
                  O arquivo será salvo com segurança no disco local do servidor (custo zero de storage)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Metadata Details */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-church-100 text-church-700 text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>Informações da Lição</span>
          </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Classe da EBD *</label>
              <select required value={classId} onChange={(e) => setClassId(e.target.value)} disabled={classes.length === 0} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500">
                {classes.length === 0 ? <option value="">Cadastre uma classe primeiro</option> : classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              {classes.length === 0 && <p className="mt-1.5 text-xs text-amber-700">Cadastre uma classe em Administração → Classes antes de enviar a revista.</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Título da Lição / Revista *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Lição 05 - O Fruto do Espírito: Amor e Alegria"
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
                placeholder="4º Trimestre / 2026"
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
                min="1"
                max="52"
                placeholder="5"
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
              <span className="text-[11px] text-slate-400 mt-1 block">
                O arquivo só ficará visível publicamente a partir deste momento.
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Descrição ou Referência Bíblica (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Texto Áureo: Gl 5:22. Leitura Bíblica em Classe: Gálatas 5:16-26."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: WhatsApp Automation */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-church-100 text-church-700 text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Automação do WhatsApp</span>
            </h2>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappScheduled}
                onChange={(e) => setWhatsappScheduled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-xs font-semibold text-slate-700">
                {whatsappScheduled ? "Disparo Agendado Ativo" : "Desativado"}
              </span>
            </label>
          </div>

          {whatsappScheduled && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-church-600 shrink-0 mt-0.5" />
                <span>
                  O robô do sistema disparará a mensagem automaticamente para o grupo da EBD no momento exato da liberação do material (<strong>{publishAt ? publishAt.replace("T", " às ") : ""}</strong>).
                </span>
              </div>

              {/* Message preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Prévia da Mensagem que o Grupo Receberá:</span>
                </label>
                <div className="bg-emerald-950/90 text-emerald-100 font-sans text-xs p-4 rounded-2xl border border-emerald-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {previewMessage}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Link
            href="/admin/revistas"
            className="rounded-xl px-5 py-2.5 text-center text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 sm:text-left"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-church-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-church-700/20 transition-all hover:bg-church-800 disabled:opacity-50"
          >
            {loading ? (
              <span>Salvando e processando...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar e Agendar Revista</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
