import { Calendar, Clock, MapPin, ArrowDown } from "lucide-react";
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
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-taupe-950 via-church-900 to-church-600 py-16 text-white shadow-inner sm:py-24 lg:py-28">
      {/* Background image if provided */}
      {bannerImageUrl && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-25 mix-blend-screen"
          style={{ backgroundImage: `url(${bannerImageUrl})` }}
        />
      )}

      {/* Decorative background grid and gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A2D039_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.12]" />
      <div className="pointer-events-none absolute -right-24 -top-32 z-0 h-[28rem] w-[28rem] rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 left-1/3 z-0 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Sunday date badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 shadow-lg shadow-slate-950/10 backdrop-blur-md sm:text-sm">
            <Calendar className="h-4 w-4 text-amber-300" />
            <span>Lição da Semana • {currentDateFormatted}</span>
          </div>

          {/* Banner Title */}
          <h1 className="mb-5 text-4xl font-black leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          {/* Banner Subtitle */}
          <p className="mx-auto mb-8 max-w-2xl text-base font-normal leading-relaxed text-white/85 sm:text-xl">
            {subtitle}
          </p>

          {/* Info pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-100 sm:text-sm">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur-sm">
              <Clock className="h-4 w-4 text-amber-300" />
              <span>{serviceTimes}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-gold-400" />
              <span>{churchAddress}</span>
            </div>
          </div>
          <a href="#revista-atual" className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-church-900 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-gold-50">
            Acessar a lição desta semana <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
