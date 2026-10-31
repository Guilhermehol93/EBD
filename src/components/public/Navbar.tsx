"use client";

import Link from "next/link";
import { BookOpen, Lock, Church } from "lucide-react";

interface NavbarProps {
  churchName?: string;
}

export function Navbar({ churchName = "Primeira Igreja Batista de Cataguases" }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Church Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-church-800 to-church-600 flex items-center justify-center text-white shadow-md shadow-church-900/10 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wider uppercase text-church-700">
                Escola Bíblica Dominical
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight line-clamp-1">
                {churchName}
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-church-700 transition-colors">
              Início
            </Link>
            <Link href="/#revista-atual" className="hover:text-church-700 transition-colors">
              Revista Atual
            </Link>
            <Link href="/arquivo" className="hover:text-church-700 transition-colors">
              Revistas Anteriores
            </Link>
            <Link href="/#horarios" className="hover:text-church-700 transition-colors">
              Horários & Endereço
            </Link>
          </nav>

          {/* Admin link */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-all border border-slate-200 shadow-sm"
              title="Acesso de Administradores"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Painel Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
