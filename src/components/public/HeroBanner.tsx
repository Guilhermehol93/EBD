import Link from "next/link";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { formatDateLongPtBR } from "@/lib/utils";

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  bannerImageUrl?: string | null;
  serviceTimes?: string;
  churchAddress?: string;
  sundayDate?: string;
}

export function HeroBanner({
  title = "Escola Bíblica Dominical",
  subtitle = "Crescendo na Graça e no Conhecimento da Palavra de Deus",
  bannerImageUrl,
  serviceTimes = "Domingos às 09:00h",
  churchAddress = "Cataguases - MG",
  sundayDate,
}: HeroBannerProps) {
  const currentDateFormatted = sundayDate
    ? formatDateLongPtBR(sundayDate)
    : formatDateLongPtBR(new Date().toISOString());

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-church-950 to-church-900 text-white py-14 sm:py-20 lg:py-24 shadow-inner">
      {/* Background image if provided */}
      {bannerImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url(${bannerImageUrl})` }}
        />
      )}

      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-church-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="max-w-3xl">
          {/* Sunday date badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium text-church-200 mb-6">
            <Calendar className="w-3.5 h-3.5 text-gold-400" />
            <span>Lição da Semana • {currentDateFormatted}</span>
          </div>

          {/* Banner Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {title}
          </h1>

          {/* Banner Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed mb-8 max-w-2xl">
            {subtitle}
          </p>

          {/* Info pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-slate-200">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-gold-400" />
              <span>{serviceTimes}</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-church-400" />
              <span>{churchAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
