"use client";

import Link from "next/link";
import { BookOpen, Lock, Church } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  churchName?: string;
}

export function Navbar({ churchName = "Primeira Igreja Batista de Cataguases" }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:h-20 sm:gap-4">
          {/* Logo & Church Name */}
          <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-church-900 via-church-700 to-sky-500 text-white shadow-lg shadow-church-900/15 transition-transform group-hover:scale-105 sm:h-11 sm:w-11">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-church-700 sm:text-xs sm:tracking-wider">
                Escola Bíblica Dominical
              </span>
              <span className="max-w-[44vw] truncate text-sm font-bold leading-tight tracking-tight text-slate-900 sm:max-w-[240px] sm:text-lg lg:max-w-[280px]">
                {churchName}
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex xl:gap-6">
            <Link href="/" className="hover:text-church-700 transition-colors">
              Início
            </Link>
            <Link href="/#revista-atual" className="hover:text-church-700 transition-colors">
              Revista Atual
            </Link>
            <Link href="/arquivo" className="hover:text-church-700 transition-colors">
              Revistas Anteriores
            </Link>
            <Link href="/minha-classe" className="hover:text-church-700 transition-colors">
              Minha Classe
            </Link>
            <Link href="/#horarios" className="hover:text-church-700 transition-colors">
              Horários & Endereço
            </Link>
          </nav>

          {/* Admin link */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <ThemeToggle compact />
            <Link
              href="/admin/login"
              className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-church-200 hover:bg-church-50 hover:text-church-800 sm:px-3.5 sm:py-2.5 sm:text-sm"
              title="Acesso de Administradores"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Painel Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
