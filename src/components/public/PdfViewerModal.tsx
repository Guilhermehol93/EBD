"use client";

import { useState, useEffect } from "react";
import { X, Download, Maximize2, Minimize2, ExternalLink, BookOpen } from "lucide-react";
import { Magazine } from "@/lib/types";

interface PdfViewerModalProps {
  magazine: Magazine | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfViewerModal({ magazine, isOpen, onClose }: PdfViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !magazine) return null;

  const viewUrl = `/api/files/view/${magazine.id}`;
  const downloadUrl = `/api/files/download/${magazine.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 transition-all animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full ${
          isFullscreen ? "h-[98vh] max-w-[98vw]" : "h-[90vh] max-w-5xl"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 text-white">
          <div className="flex items-center gap-3 overflow-hidden pr-4">
            <div className="w-8 h-8 rounded-lg bg-church-600/30 text-church-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm sm:text-base font-bold truncate leading-tight">
                {magazine.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                Lição {magazine.lesson_number ? String(magazine.lesson_number).padStart(2, "0") : "Especial"} • {magazine.edition_quarter || "EBD PIB Cataguases"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Download button */}
            <a
              href={downloadUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-church-600 hover:bg-church-500 text-white transition-colors shadow-sm"
              download
              title="Baixar PDF no dispositivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </a>

            {/* Open in new tab */}
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors hidden sm:block"
              title={isFullscreen ? "Restaurar tamanho" : "Tela cheia"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
              title="Fechar leitor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / PDF Viewer Frame */}
        <div className="relative flex-1 bg-slate-950 w-full h-full">
          <iframe
            src={`${viewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={magazine.title}
          />
        </div>
      </div>
    </div>
  );
}
