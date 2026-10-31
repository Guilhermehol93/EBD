"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Download, Search, Calendar, ChevronRight, Eye } from "lucide-react";
import { Magazine } from "@/lib/types";
import { formatDatePtBR, formatFileSize } from "@/lib/utils";
import { PdfViewerModal } from "./PdfViewerModal";

interface PreviousMagazinesProps {
  magazines: Magazine[];
  showViewAllLink?: boolean;
}

export function PreviousMagazines({ magazines, showViewAllLink = true }: PreviousMagazinesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);

  const filtered = magazines.filter((m) => {
    const q = searchTerm.toLowerCase();
    const titleMatch = m.title.toLowerCase().includes(q);
    const descMatch = (m.description || "").toLowerCase().includes(q);
    const quarterMatch = (m.edition_quarter || "").toLowerCase().includes(q);
    const numberMatch = m.lesson_number ? String(m.lesson_number).includes(q) : false;
    return titleMatch || descMatch || quarterMatch || numberMatch;
  });

  return (
    <section className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-church-700">
              Arquivo de Lições
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Revistas Anteriores
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Consulte e estude os materiais das semanas passadas
            </p>
          </div>

          {/* Search box */}
          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por lição ou tema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-sm text-slate-500 text-sm">
            {searchTerm ? "Nenhuma revista encontrada com o termo pesquisado." : "Nenhuma lição anterior cadastrada."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((mag) => (
              <div
                key={mag.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-church-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-church-50 text-church-700">
                      {mag.lesson_number ? `Lição ${String(mag.lesson_number).padStart(2, "0")}` : "Especial"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDatePtBR(mag.lesson_date)}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 group-hover:text-church-700 transition-colors line-clamp-2 mb-2 text-base">
                    {mag.title}
                  </h3>

                  {mag.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {mag.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatFileSize(mag.file_size)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMagazine(mag)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-church-700 bg-church-50 hover:bg-church-100 transition-colors"
                      title="Visualizar online"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ler</span>
                    </button>

                    <a
                      href={`/api/files/download/${mag.id}`}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      title="Baixar arquivo PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showViewAllLink && (
          <div className="mt-8 text-center">
            <Link
              href="/arquivo"
              className="inline-flex items-center gap-2 text-sm font-semibold text-church-700 hover:text-church-800 transition-colors"
            >
              <span>Ver todas as lições arquivadas</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <PdfViewerModal
        magazine={selectedMagazine}
        isOpen={!!selectedMagazine}
        onClose={() => setSelectedMagazine(null)}
      />
    </section>
  );
}
