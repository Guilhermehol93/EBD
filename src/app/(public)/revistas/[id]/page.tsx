import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, BookOpen, Calendar, Share2, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateLongPtBR, formatFileSize } from "@/lib/utils";
import { Magazine, ChurchSettings } from "@/lib/types";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const adminClient = createAdminClient();
  const { data: magazine } = await adminClient
    .from("magazines")
    .select("title, description")
    .eq("id", params.id)
    .single();

  if (!magazine) {
    return { title: "Revista Não Encontrada | EBD PIB Cataguases" };
  }

  return {
    title: `${magazine.title} | EBD PIB Cataguases`,
    description: magazine.description || "Lição da Escola Bíblica Dominical da Primeira Igreja Batista de Cataguases",
  };
}

export default async function MagazineDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const adminClient = createAdminClient();
  const now = new Date().toISOString();

  // 1. Fetch magazine
  const { data: magazineData } = await adminClient
    .from("magazines")
    .select("*")
    .eq("id", params.id)
    .single();

  const magazine = magazineData as Magazine | null;

  if (!magazine) {
    notFound();
  }

  // 2. If not published, check if user is admin
  if (magazine.status !== "published" || new Date(magazine.publish_at) > new Date()) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      notFound();
    }
  }

  // 3. Fetch church settings
  const { data: settingsData } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "general")
    .single();

  const settings = settingsData as ChurchSettings | null;

  const viewUrl = `/api/files/view/${magazine.id}`;
  const downloadUrl = `/api/files/download/${magazine.id}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar churchName={settings?.church_name} />

      {/* Top action bar */}
      <div className="bg-slate-950 border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
              title="Voltar para a página inicial"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-xs text-church-400 font-semibold uppercase tracking-wider">
                <span>{magazine.edition_quarter || "EBD PIB Cataguases"}</span>
                {magazine.lesson_number && (
                  <span>• Lição {String(magazine.lesson_number).padStart(2, "0")}</span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white line-clamp-1">
                {magazine.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-church-600 hover:bg-church-500 text-white shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF ({formatFileSize(magazine.file_size)})</span>
            </a>
          </div>
        </div>
      </div>

      {/* PDF Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-col">
        <div className="w-full flex-1 min-h-[75vh] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
          <iframe
            src={`${viewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full flex-1 min-h-[75vh] border-0"
            title={magazine.title}
          />
        </div>

        {/* Magazine summary details below viewer */}
        <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4 text-church-400" />
              <span>Data da Lição: {formatDateLongPtBR(magazine.lesson_date)}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
              <span>{magazine.views_count} visualizações</span>
              <span>{magazine.downloads_count} downloads</span>
            </div>
          </div>

          {magazine.description && (
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              {magazine.description}
            </p>
          )}
        </div>
      </main>

      <Footer churchName={settings?.church_name} />
    </div>
  );
}
