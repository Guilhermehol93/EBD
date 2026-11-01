"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isAdminUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("E-mail ou senha incorretos. Verifique suas credenciais.");
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setErrorMsg("A autenticação foi concluída sem retornar um usuário. Tente novamente.");
        setLoading(false);
        return;
      }

      if (!isAdminUser(data.user)) {
        await supabase.auth.signOut();
        setErrorMsg("E-mail e senha válidos, mas esta conta não tem permissão para acessar o painel administrativo. Entre em contato com o responsável pelo sistema.");
        setLoading(false);
        return;
      }

      setLoading(false);
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg("Falha ao comunicar com o servidor de autenticação.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-sky-100 p-4 sm:p-6 lg:p-8 dark:from-navy-900 dark:via-church-950 dark:to-slate-900">
      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-church-500/10 rounded-full blur-3xl pointer-events-none dark:bg-church-500/10" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none dark:bg-gold-500/10" />

      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to public link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Portal Público da EBD</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-10 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-church-600 to-church-500 text-white flex items-center justify-center shadow-lg shadow-church-900/50">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Acesso Administrativo
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              Escola Bíblica Dominical • PIB Cataguases
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                E-mail do Administrador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@pibcataguases.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/30 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/30 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-church-600 hover:bg-church-500 disabled:opacity-50 transition-all shadow-lg shadow-church-700/30"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
            <p className="text-[11px] text-slate-600 dark:text-slate-500">
              Autenticação segura via Supabase Auth. Acesso restrito a administradores autorizados da PIB Cataguases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
