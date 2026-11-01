"use client";

import { useState, useEffect } from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Play,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { WhatsAppLog } from "@/lib/types";
import { formatDateTimePtBR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [cronFeedback, setCronFeedback] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("logs_whatsapp")
      .select("*, magazine:magazines(title, lesson_number)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleForceCronCheck = async () => {
    setTriggeringCron(true);
    setCronFeedback(null);

    try {
      const res = await fetch("/api/cron/check-scheduled");
      const data = await res.json();
      if (res.ok) {
        setCronFeedback(
          `Verificação concluída: ${data.processed || 0} revista(s) processada(s). ${data.message || ""}`
        );
        fetchLogs();
      } else {
        setCronFeedback(`Erro na verificação: ${data.error || "Falha"}`);
      }
    } catch (e: any) {
      setCronFeedback("Erro ao disparar verificação: " + e.message);
    } finally {
      setTriggeringCron(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Logs do WhatsApp & Agendamento
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Histórico completo de disparos automáticos e diagnósticos de envio.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Atualizar logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleForceCronCheck}
            disabled={triggeringCron}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-church-700 px-3 py-2.5 text-center text-xs font-bold leading-tight text-white shadow-md shadow-church-700/20 transition-all hover:bg-church-800 disabled:opacity-50 sm:flex-initial sm:px-4 sm:text-sm"
          >
            <Play className={`w-4 h-4 ${triggeringCron ? "animate-spin" : ""}`} />
            <span>{triggeringCron ? "Verificando..." : "Forçar Verificação de Agendados Agora"}</span>
          </button>
        </div>
      </div>

      {/* Cron Feedback Banner */}
      {cronFeedback && (
        <div className="p-4 rounded-2xl bg-church-50 border border-church-200 text-church-900 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-church-600" />
          <span>{cronFeedback}</span>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-church-600" />
            <p className="text-xs">Carregando histórico de logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-700">Nenhum log registrado ainda</p>
            <p className="text-xs text-slate-400 mt-1">
              Os registros de envio do WhatsApp aparecerão aqui assim que as mensagens forem disparadas.
            </p>
          </div>
        ) : (
          <>
          <div className="space-y-3 p-3 2xl:hidden">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const isSuccess = log.status === "success";
              return (
                <article key={log.id} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="break-all font-mono text-xs text-slate-700">{log.recipient}</p><p className="mt-1 text-xs text-slate-500">{formatDateTimePtBR(log.created_at)}</p></div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${isSuccess ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                      {isSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{isSuccess ? "Sucesso" : "Falha"}
                    </span>
                  </div>
                  <p className="mt-3 break-words text-sm font-semibold text-slate-800">{log.magazine?.title ? `Lição ${log.magazine.lesson_number || "?"}: ${log.magazine.title}` : "Teste manual"}</p>
                  <p className={`mt-2 break-words text-xs leading-5 ${log.error_message ? "font-semibold text-rose-600" : "text-slate-600"}`}>{log.error_message || (log.message ? `${log.message.substring(0, 120)}${log.message.length > 120 ? "…" : ""}` : "Sem mensagem")}</p>
                  <button onClick={() => setExpandedLogId(isExpanded ? null : log.id)} className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm" aria-label={isExpanded ? "Ocultar detalhes" : "Ver detalhes da resposta"}>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                  </button>
                </article>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto 2xl:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Data / Hora</th>
                  <th className="px-6 py-3.5">Destinatário</th>
                  <th className="px-6 py-3.5">Revista Relacionada</th>
                  <th className="px-6 py-3.5">Mensagem / Erro</th>
                  <th className="px-6 py-3.5 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const isSuccess = log.status === "success";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sucesso</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Falha</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        {formatDateTimePtBR(log.created_at)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-700">
                        {log.recipient}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-slate-800">
                        {log.magazine?.title ? (
                          <span>
                            Lição {log.magazine.lesson_number || "?"}: {log.magazine.title}
                          </span>
                        ) : (
                          <span className="text-slate-400">Teste Manual</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {log.error_message ? (
                          <span className="text-rose-600 font-semibold">{log.error_message}</span>
                        ) : (
                          <span>{log.message?.substring(0, 50)}...</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Ver detalhes da resposta"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Expanded payload modal/card if any */}
      {expandedLogId && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs text-slate-200 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="break-words font-bold uppercase text-church-400">Payload e Resposta Completa do Provedor</span>
            <button
              onClick={() => setExpandedLogId(null)}
              className="text-slate-400 hover:text-white"
            >
              Fechar
            </button>
          </div>
          <pre className="max-w-full overflow-x-auto break-words rounded-xl bg-slate-950 p-3 text-slate-300 sm:p-4">
            {JSON.stringify(logs.find((l) => l.id === expandedLogId), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
