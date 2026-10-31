"use client";

import Link from "next/link";
import { PlusCircle, ExternalLink, ShieldCheck } from "lucide-react";

interface AdminHeaderProps {
  userEmail?: string | null;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-church-50 text-church-700 border border-church-100 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-church-600" />
          <span>Painel de Administração</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Portal Público</span>
        </Link>

        <Link
          href="/admin/revistas/nova"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-church-700 hover:bg-church-800 rounded-lg shadow-sm transition-all"
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
