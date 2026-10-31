"use client";

import { useState } from "react";
import { BookOpen, Download, Eye, Calendar, Sparkles, CheckCircle2, Share2 } from "lucide-react";
import { Magazine } from "@/lib/types";
import { formatDateLongPtBR, formatFileSize } from "@/lib/utils";
import { PdfViewerModal } from "./PdfViewerModal";

interface FeaturedMagazineProps {
  magazine: Magazine | null;
}

export function FeaturedMagazine({ magazine }: FeaturedMagazineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!magazine) return;
    const shareUrl = window.location.origin + `/revistas/${magazine.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: magazine.title,
          text: `Confira a revista da EBD da PIB Cataguases: ${magazine.title}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or failed
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!magazine) {
    return (
      <div id="revista-atual" className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-xl shadow-slate-100">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-church-50 border border-church-100 flex items-center justify-center text-church-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Nenhuma Revista Publicada no Momento
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base mb-6">
            A revista para a próxima aula da Escola Bíblica Dominical será disponibilizada em breve. Volte no próximo domingo pela manhã!
          </p>
        </div>
      </div>
    );
  }

  const downloadUrl = `/api/files/download/${magazine.id}`;

  return (
    <div id="revista-atual" className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-10">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-church-950/5 overflow-hidden transition-all hover:shadow-church-950/10">
        <div className="p-6 sm:p-8 md:p-10">
          {/* Top badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-church-50 text-church-700 border border-church-100">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                Revista em Destaque
              </span>
              {magazine.edition_quarter && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {magazine.edition_quarter}
                </span>
              )}
              {magazine.lesson_number !== null && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Lição {String(magazine.lesson_number).padStart(2, "0")}
                </span>
              )}
            </div>

            {/* Lesson date */}
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500">
              <Calendar className="w-4 h-4 text-church-600" />
              <span>{formatDateLongPtBR(magazine.lesson_date)}</span>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Visual Cover / Icon Box */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative group w-full max-w-[240px] aspect-[3/4] rounded-2xl bg-gradient-to-tr from-church-900 via-church-800 to-church-700 p-6 flex flex-col justify-between text-white shadow-xl shadow-church-900/20 transform group-hover:-translate-y-1 transition-transform cursor-pointer"
                   onClick={() => setIsModalOpen(true)}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-church-200">
                    EBD PIB Cataguases
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-gold-300">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <div className="my-auto text-center py-4">
                  <span className="text-3xl font-black text-white/90 block mb-1">
                    {magazine.lesson_number ? `LIÇÃO ${magazine.lesson_number}` : "ESTUDO"}
                  </span>
                  <div className="w-10 h-0.5 bg-gold-400 mx-auto mb-2" />
                  <p className="text-xs text-church-100 font-medium line-clamp-3">
                    {magazine.title}
                  </p>
                </div>

                <div className="text-[10px] text-center text-church-200 border-t border-white/10 pt-2 font-mono">
                  {formatFileSize(magazine.file_size)} • PDF
                </div>
              </div>
            </div>

            {/* Details & CTA Actions */}
            <div className="md:col-span-8 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                {magazine.title}
              </h2>

              {magazine.description ? (
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  {magazine.description}
                </p>
              ) : (
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Acesse o material completo de estudo para a aula deste domingo na Escola Bíblica Dominical da Primeira Igreja Batista de Cataguases.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-church-700 hover:bg-church-800 transition-all shadow-lg shadow-church-700/25 hover:shadow-church-700/40 transform hover:-translate-y-0.5 active:translate-y-0 flex-1 sm:flex-initial"
                >
                  <Eye className="w-5 h-5 text-white" />
                  <span>Ler Revista Online</span>
                </button>

                <a
                  href={downloadUrl}
                  download
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex-1 sm:flex-initial shadow-sm"
                >
                  <Download className="w-5 h-5 text-slate-600" />
                  <span>Baixar PDF ({formatFileSize(magazine.file_size)})</span>
                </a>

                <button
                  onClick={handleShare}
                  className="p-3.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                  title="Compartilhar lição"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Read/Download stats */}
              <div className="flex items-center gap-6 text-xs text-slate-400 font-medium pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{magazine.views_count || 0} leituras online</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>{magazine.downloads_count || 0} downloads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded PDF Viewer Modal */}
      <PdfViewerModal
        magazine={magazine}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
