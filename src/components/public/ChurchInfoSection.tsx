import { MapPin, Clock, MessageSquare, Globe, ExternalLink } from "lucide-react";
import { ChurchSettings } from "@/lib/types";
function SocialIcon({ name }: { name: "instagram" | "youtube" | "facebook" }) {
  const common = { className: "w-4 h-4 shrink-0", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true as const };
  if (name === "instagram") return <svg {...common} className="w-4 h-4 shrink-0 text-[#E4405F]"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm4.2 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.2-3.5a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z" /></svg>;
  if (name === "youtube") return <svg {...common} className="w-4 h-4 shrink-0 text-[#FF0000]"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" /></svg>;
  return <svg {...common} className="w-4 h-4 shrink-0 text-[#1877F2]"><path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5h-2.9V24C19.6 23.1 24 18.1 24 12.1Z" /></svg>;
}

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
                  <SocialIcon name="instagram" />
                  <span>Instagram</span>
                </a>
              )}
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <SocialIcon name="youtube" />
                  <span>YouTube</span>
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <SocialIcon name="facebook" />
                  <span>Facebook</span>
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
