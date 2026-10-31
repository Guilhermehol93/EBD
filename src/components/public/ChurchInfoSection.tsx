import { MapPin, Clock, MessageSquare, Globe, ExternalLink } from "lucide-react";
import { ChurchSettings } from "@/lib/types";

interface ChurchInfoSectionProps {
  settings?: ChurchSettings | null;
}

export function ChurchInfoSection({ settings }: ChurchInfoSectionProps) {
  const churchName = settings?.church_name || "Primeira Igreja Batista de Cataguases";
  const address = settings?.church_address || "Cataguases - MG";
  const serviceTimes = settings?.service_times || "Domingos às 09:00h (EBD) e 19:30h (Culto)";
  const instagram = settings?.social_instagram || "https://instagram.com/pibcataguases";
  const youtube = settings?.social_youtube || "https://youtube.com/@pibcataguases";
  const facebook = settings?.social_facebook || "https://facebook.com/pibcataguases";
  const whatsappGroup = settings?.social_whatsapp_group;
  const website = settings?.social_website || "https://pibcataguases.com.br";

  return (
    <section id="horarios" className="py-12 sm:py-16 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Church Schedule & Location */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8">
            <span className="text-xs font-bold uppercase tracking-wider text-church-700">
              Comunhão & Aprendizado
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 mb-4">
              Venha estudar a Palavra conosco!
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-church-100 text-church-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Horários de Reunião</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{serviceTimes}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-church-100 text-church-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Localização</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{address}</p>
                  <span className="text-xs text-slate-500 font-medium">{churchName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Community */}
          <div className="lg:col-span-5 bg-gradient-to-br from-church-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-church-300">
              Conecte-se Conosco
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 mb-2">
              Redes & Comunidade
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Acompanhe as transmissões dos cultos, reflexões diárias e novidades da PIB Cataguases.
            </p>

            {whatsappGroup && (
              <a
                href={whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mb-4 inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Entrar no Grupo Oficial do WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <span>📷 Instagram</span>
                </a>
              )}
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <span>▶️ YouTube</span>
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <span>👥 Facebook</span>
                </a>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Site Oficial</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
