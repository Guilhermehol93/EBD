import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  MessageSquare,
  PlusCircle,
  ArrowRight,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Magazine } from "@/lib/types";
import { formatDatePtBR, formatDateTimePtBR, formatFileSize } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { WhatsAppBadge } from "@/components/admin/WhatsAppBadge";

export const revalidate = 0; // dynamic dashboard

export default async function AdminDashboardPage() {
  const adminClient = createAdminClient();

  // 1. Fetch all magazines
  const { data: magazinesData, error } = await adminClient
    .from("magazines")
    .select("*")
    .order("created_at", { ascending: false });

  const magazines = (magazinesData as Magazine[]) || [];
  const { data: classesData } = await adminClient.from("classes").select("id,name");
  const classesById = new Map((classesData || []).map((item) => [item.id, item.name]));

  // Compute stats
  const totalMagazines = magazines.length;
  const publishedCount = magazines.filter((m) => m.status === "published").length;
  const scheduledCount = magazines.filter((m) => m.status === "scheduled").length;
  const totalViews = magazines.reduce((acc, m) => acc + (m.views_count || 0), 0);
  const totalDownloads = magazines.reduce((acc, m) => acc + (m.downloads_count || 0), 0);
  const whatsappSentCount = magazines.filter((m) => m.whatsapp_sent).length;

  // Next scheduled magazine
  const nextScheduled = magazines
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.publish_at).getTime() - new Date(b.publish_at).getTime())[0];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white bg-gradient-to-r from-white via-white to-sky-50/70 p-5 shadow-sm shadow-slate-900/[0.03] sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Painel Geral
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão geral da Escola Bíblica Dominical e agendamento de revistas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/revistas/nova"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-church-700 hover:bg-church-800 transition-all shadow-md shadow-church-700/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload de Nova Revista</span>
          </Link>
        </div>
      </div>

      {/* Next Scheduled Magazine Banner */}
      {nextScheduled && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Próxima Liberação Agendada
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {formatDateTimePtBR(nextScheduled.publish_at)}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {nextScheduled.title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Lição {nextScheduled.lesson_number} • WhatsApp: {nextScheduled.whatsapp_scheduled ? "Disparo automático ativado 📲" : "Desativado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/revistas/${nextScheduled.id}/editar`}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors shadow-sm"
            >
              Editar Agendamento
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.03] transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Revistas
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalMagazines}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {publishedCount} publicadas • {scheduledCount} agendadas
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm shadow-slate-900/[0.03] transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Publicadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {publishedCount}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Disponíveis no portal público
          </span>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/60 p-5 shadow-sm shadow-slate-900/[0.03] transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-church-600">
              Leituras & Downloads
            </span>
            <div className="w-8 h-8 rounded-lg bg-church-50 text-church-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalViews + totalDownloads}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalViews} leituras • {totalDownloads} downloads
          </span>
        </div>

        <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/60 p-5 shadow-sm shadow-slate-900/[0.03] transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              WhatsApp Enviados
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {whatsappSentCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Disparos automáticos no grupo
          </span>
        </div>
      </div>

      {/* Recent Magazines Section */}
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-sm shadow-slate-900/[0.04]">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Revistas Recentes</h2>
            <p className="text-xs text-slate-500">Últimos arquivos adicionados ou agendados</p>
          </div>

          <Link
            href="/admin/revistas"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-church-700 hover:text-church-800 transition-colors"
          >
            <span>Ver Todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {magazines.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Nenhuma revista cadastrada ainda. Clique em &quot;Upload de Nova Revista&quot; para começar!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3">Lição / Título</th>
                  <th className="px-6 py-3">Data da Lição</th>
                  <th className="px-6 py-3">Liberação</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">WhatsApp</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {magazines.slice(0, 5).map((mag) => (
                  <tr key={mag.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{mag.title}</div>
                      <div className="text-xs text-slate-400">
                        {classesById.get(mag.class_id) || "Classe"} • {mag.edition_quarter} • Lição {mag.lesson_number} • {formatFileSize(mag.file_size)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {formatDatePtBR(mag.lesson_date)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap text-xs">
                      {formatDateTimePtBR(mag.publish_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={mag.status} publishAt={mag.publish_at} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <WhatsAppBadge
                        scheduled={mag.whatsapp_scheduled}
                        sent={mag.whatsapp_sent}
                        sentAt={mag.whatsapp_sent_at}
                      />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/revistas/${mag.id}/editar`}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Editar
                        </Link>
                        <a
                          href={`/api/files/download/${mag.id}`}
                          download
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Baixar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
