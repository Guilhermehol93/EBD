import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";

interface FooterProps {
  churchName?: string;
}

export function Footer({ churchName = "Primeira Igreja Batista de Cataguases" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-church-700 text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{churchName}</p>
              <p className="text-xs text-slate-500">Escola Bíblica Dominical • EBD Revista Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <Link href="/arquivo" className="hover:text-white transition-colors">
              Arquivo de Lições
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Acesso Restrito</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} {churchName}. Todos os direitos reservados.
          </p>
          <p className="italic text-center sm:text-right">
            &quot;Examinais as Escrituras, porque vós cuidais ter nelas a vida eterna, e são elas que de mim testificam.&quot; (João 5:39)
          </p>
        </div>
      </div>
    </footer>
  );
}
