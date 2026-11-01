"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Settings,
  History,
  ExternalLink,
  LogOut,
  UsersRound,
  Menu,
} from "lucide-react";
import { MobileDrawer } from "@/components/MobileDrawer";

export function AdminSidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    {
      label: "Painel Geral",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Revistas da EBD",
      href: "/admin/revistas",
      icon: BookOpen,
    },
    {
      label: "Classes",
      href: "/admin/classes",
      icon: UsersRound,
    },
    {
      label: "Nova Revista",
      href: "/admin/revistas/nova",
      icon: PlusCircle,
    },
    {
      label: "Configurações & Banner",
      href: "/admin/configuracoes",
      icon: Settings,
    },
    {
      label: "Logs do WhatsApp",
      href: "/admin/logs",
      icon: History,
    },
  ];

  const renderLinks = (onNavigate?: () => void) => links.map((link) => {
    const Icon = link.icon;
    const isActive = link.href === "/admin/dashboard"
      ? pathname === link.href
      : pathname.startsWith(link.href);

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={`flex min-h-12 min-w-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold leading-tight transition-all ${
          isActive
            ? "bg-church-700 text-white shadow-md shadow-church-900/20 lg:bg-church-600 lg:shadow-church-900/30"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:text-white/70 lg:hover:bg-white/10 lg:hover:text-white"
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 lg:text-white/70"}`} aria-hidden="true" />
        <span>{link.label}</span>
      </Link>
    );
  });

  return (
    <>
      <div className="flex min-h-16 items-center justify-between border-b border-taupe-200 bg-white px-4 dark:border-taupe-800 dark:bg-taupe-950 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-church-700 to-church-400 text-white shadow-md">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-taupe-900 dark:text-white">EBD Manager</p>
            <p className="truncate text-xs text-taupe-600 dark:text-taupe-300">Administração</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu administrativo"
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-navigation"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-taupe-200 bg-white text-taupe-800 shadow-sm transition-colors hover:bg-taupe-50 dark:border-taupe-700 dark:bg-taupe-900 dark:text-white dark:hover:bg-taupe-800"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <MobileDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="Menu administrativo">
        <nav id="admin-mobile-navigation" aria-label="Navegação administrativa" className="flex flex-col gap-1.5">
          {renderLinks(() => setMenuOpen(false))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-taupe-100 pt-4 dark:border-taupe-800">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-taupe-700 transition-colors hover:bg-taupe-100 dark:text-taupe-200 dark:hover:bg-taupe-800"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Ver Portal Público
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Encerrar Sessão
            </button>
          </form>
        </div>
      </MobileDrawer>

      <aside className="relative z-20 hidden w-[264px] shrink-0 flex-col justify-between border-r border-taupe-800 bg-gradient-to-b from-taupe-950 to-taupe-900 text-slate-300 lg:flex lg:min-h-screen">
        <div>
        {/* Brand */}
        <div className="border-b border-slate-100 p-4 lg:border-slate-800 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-church-600 to-sky-400 text-white shadow-lg shadow-church-900/30 lg:h-11 lg:w-11">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 lg:text-white">EBD Manager</h2>
              <p className="text-[11px] text-slate-500 lg:text-white/70">PIB Cataguases · Administração</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5 p-4" aria-label="Navegação administrativa">
          {renderLinks()}
        </nav>
        </div>

        {/* Footer of sidebar */}
        <div className="flex items-center gap-2 border-t border-slate-100 p-2 lg:block lg:space-y-2 lg:border-slate-800 lg:p-4">
        <Link
          href="/"
          target="_blank"
          className="hidden items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:flex lg:text-white/70 lg:hover:bg-white/10 lg:hover:text-white"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Portal Público</span>
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">Novo</span>
        </Link>

        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 lg:justify-start lg:px-3.5 lg:py-2.5 lg:text-rose-400 lg:hover:bg-rose-950/30 lg:hover:text-rose-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </form>
        </div>
      </aside>
    </>
  );
}
