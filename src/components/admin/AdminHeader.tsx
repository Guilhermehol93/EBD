"use client";

import Link from "next/link";
import { PlusCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AdminHeaderProps {
  userEmail?: string | null;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex min-h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-church-100 bg-church-50 px-3 py-1.5 text-[11px] font-bold text-church-700 sm:text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-church-600" />
          <span>Painel de Administração</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle compact />
        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Portal Público</span>
        </Link>

        <Link
          href="/admin/revistas/nova"
          className="inline-flex items-center gap-2 rounded-xl bg-church-700 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-church-700/15 transition-all hover:-translate-y-0.5 hover:bg-church-800 sm:px-3.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Nova Revista</span>
        </Link>

        {userEmail && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-500 font-medium">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase">
              {userEmail.charAt(0)}
            </div>
            <span className="max-w-[160px] truncate">{userEmail}</span>
          </div>
        )}
      </div>
    </header>
  );
}
