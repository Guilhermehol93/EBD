"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Image as ImageIcon,
  Upload,
  MessageSquare,
  Globe,
  Share2,
  CheckCircle2,
  AlertCircle,
  Send,
  RefreshCw,
  Info,
} from "lucide-react";
import { ChurchSettings } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function AdminConfiguracoesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [churchName, setChurchName] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [churchAddress, setChurchAddress] = useState("");
  const [serviceTimes, setServiceTimes] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialWhatsappGroup, setSocialWhatsappGroup] = useState("");
  const [socialWebsite, setSocialWebsite] = useState("");
  const [whatsappApiProvider, setWhatsappApiProvider] = useState<"evolution" | "webhook">("evolution");
  const [whatsappInstanceName, setWhatsappInstanceName] = useState("");
  const [whatsappGroupJid, setWhatsappGroupJid] = useState("");
  const [whatsappDefaultMessage, setWhatsappDefaultMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "general")
      .single();

    if (!error && data) {
      setSettings(data);
      setChurchName(data.church_name || "");
      setSiteTitle(data.site_title || "");
      setBannerTitle(data.banner_title || "");
      setBannerSubtitle(data.banner_subtitle || "");
      setBannerImageUrl(data.banner_image_url || "");
      setChurchAddress(data.church_address || "");
      setServiceTimes(data.service_times || "");
      setSocialInstagram(data.social_instagram || "");
      setSocialYoutube(data.social_youtube || "");
      setSocialFacebook(data.social_facebook || "");
      setSocialWhatsappGroup(data.social_whatsapp_group || "");
      setSocialWebsite(data.social_website || "");
      setWhatsappApiProvider(data.whatsapp_api_provider || "evolution");
      setWhatsappInstanceName(data.whatsapp_instance_name || "");
      setWhatsappGroupJid(data.whatsapp_group_jid || "");
      setWhatsappDefaultMessage(data.whatsapp_default_message || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setUploadingBanner(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files/banner", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha no upload do banner.");
      }

      setBannerImageUrl(data.bannerUrl);
      showToast("Banner enviado e atualizado com sucesso!");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("settings")
        .upsert({
          id: "general",
          church_name: churchName,
          site_title: siteTitle,
          banner_title: bannerTitle,
          banner_subtitle: bannerSubtitle,
          banner_image_url: bannerImageUrl,
          church_address: churchAddress,
          service_times: serviceTimes,
          social_instagram: socialInstagram,
          social_youtube: socialYoutube,
          social_facebook: socialFacebook,
          social_whatsapp_group: socialWhatsappGroup,
          social_website: socialWebsite,
          whatsapp_api_provider: whatsappApiProvider,
          whatsapp_instance_name: whatsappInstanceName,
          whatsapp_group_jid: whatsappGroupJid,
          whatsapp_default_message: whatsappDefaultMessage,
        });

      if (error) throw error;
      showToast("Configurações salvas com sucesso!");
    } catch (err: any) {
      setErrorMessage("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!whatsappGroupJid) {
      alert("Por favor informe o Grupo JID ou número de telefone para o teste.");
      return;
    }

    setTestingWa(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: whatsappGroupJid,
          provider: whatsappApiProvider,
          instanceName: whatsappInstanceName,
        }),
        signal: AbortSignal.timeout(25_000),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setErrorMessage("Falha no teste: " + (data.error || "Erro de conexão"));
      } else {
        showToast("Mensagem de teste enviada com sucesso no WhatsApp.");
      }
    } catch (err: any) {
      const message = err?.name === "TimeoutError"
        ? "O teste excedeu 25 segundos sem resposta. Verifique a conexão e os logs da Evolution API."
        : err?.message || "Erro na requisição de teste.";
      setErrorMessage(message);
    } finally {
      setTestingWa(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-church-600" />
        <p className="text-xs">Carregando configurações do sistema...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white shadow-2xl animate-in slide-in-from-bottom duration-200 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Configurações & Personalização
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Personalize banners, redes sociais, dados da igreja e parâmetros do WhatsApp.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Banner Customization */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-church-600" />
            <span>Banner do Portal Público</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Título do Banner Principal
              </label>
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="Escola Bíblica Dominical"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Subtítulo / Lema
              </label>
              <input
                type="text"
                value={bannerSubtitle}
                onChange={(e) => setBannerSubtitle(e.target.value)}
                placeholder="Crescendo na Graça e no Conhecimento da Palavra de Deus"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Imagem de Fundo do Banner (Local)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-center text-xs font-bold leading-tight text-slate-700 transition-colors hover:bg-slate-200 sm:w-auto sm:px-4"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>{uploadingBanner ? "Enviando imagem..." : "Selecionar Nova Imagem de Banner"}</span>
                </button>

                {bannerImageUrl && (
                  <span className="w-full min-w-0 max-w-sm truncate text-xs text-slate-500 sm:w-auto">
                    Atual: {bannerImageUrl}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Church Info */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-church-600" />
            <span>Identidade da Igreja</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Nome da Igreja
              </label>
              <input
                type="text"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                placeholder="Primeira Igreja Batista de Cataguases"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Título da Aba / Navegador
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="EBD Digital - PIB Cataguases"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Endereço da Igreja
              </label>
              <input
                type="text"
                value={churchAddress}
                onChange={(e) => setChurchAddress(e.target.value)}
                placeholder="Rua Nogueira Neves, Cataguases - MG"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Horários de Reunião
              </label>
              <input
                type="text"
                value={serviceTimes}
                onChange={(e) => setServiceTimes(e.target.value)}
                placeholder="Domingos às 09:00h (EBD) e 19:30h (Culto)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-church-600" />
            <span>Redes Sociais & Links Públicos</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Link do Instagram
              </label>
              <input
                type="text"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                placeholder="https://instagram.com/pibcataguases"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Link do YouTube
              </label>
              <input
                type="text"
                value={socialYoutube}
                onChange={(e) => setSocialYoutube(e.target.value)}
                placeholder="https://youtube.com/@pibcataguases"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Link do Facebook
              </label>
              <input
                type="text"
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                placeholder="https://facebook.com/pibcataguases"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Link de Convite do Grupo do WhatsApp
              </label>
              <input
                type="text"
                value={socialWhatsappGroup}
                onChange={(e) => setSocialWhatsappGroup(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Site Oficial da Igreja
              </label>
              <input
                type="text"
                value={socialWebsite}
                onChange={(e) => setSocialWebsite(e.target.value)}
                placeholder="https://pibcataguases.com.br"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Integration Settings */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Configuração do WhatsApp (Self-Hosted)</span>
            </h2>

            <button
              type="button"
              onClick={handleTestWhatsApp}
              disabled={testingWa}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testingWa ? "Testando..." : "Testar Conexão"}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span>
                As credenciais mestras (URL e Chave de API) são carregadas com segurança a partir das variáveis de ambiente (.env). Aqui você define o JID do grupo de destino e o nome da instância.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Provedor de WhatsApp
              </label>
              <select
                value={whatsappApiProvider}
                onChange={(e) => setWhatsappApiProvider(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              >
                <option value="evolution">Evolution API (Self-Hosted no Docker)</option>
                <option value="webhook">Webhook HTTP Genérico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Nome da Instância
              </label>
              <input
                type="text"
                value={whatsappInstanceName}
                onChange={(e) => setWhatsappInstanceName(e.target.value)}
                placeholder="pib-cataguases-ebd"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                ID do Grupo no WhatsApp (JID) ou Telefone de Teste
              </label>
              <input
                type="text"
                value={whatsappGroupJid}
                onChange={(e) => setWhatsappGroupJid(e.target.value)}
                placeholder="Ex: 120363028372648291@g.us ou 5532999999999"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Para grupos, utilize o formato que termina com @g.us. Para testes individuais, use DDI+DDD+Número.
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Modelo da Mensagem Padrão (Template)
              </label>
              <textarea
                rows={5}
                value={whatsappDefaultMessage}
                onChange={(e) => setWhatsappDefaultMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-church-500/20 focus:border-church-500 leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Variáveis: {'{titulo}'}, {'{data}'}, {'{link}'}, {'{numero}'}, {'{trimestre}'}. Use *texto* para negrito e _texto_ para itálico no WhatsApp.
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-church-700 px-3 py-3 text-center text-sm font-bold leading-tight text-white shadow-md shadow-church-700/20 transition-all hover:bg-church-800 disabled:opacity-50 sm:w-auto sm:px-6"
          >
            {saving ? (
              <span>Salvando configurações...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Todas as Configurações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
