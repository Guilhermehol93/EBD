"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Settings,
  History,
  ExternalLink,
  LogOut,
  Church,
  UsersRound,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

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

  return (
    <aside className="relative z-20 flex w-full shrink-0 flex-col justify-between border-b border-slate-200 bg-white text-slate-600 lg:min-h-screen lg:w-[264px] lg:border-b-0 lg:border-r lg:border-taupe-800 lg:bg-gradient-to-b lg:from-taupe-950 lg:to-taupe-900 lg:text-slate-300">
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
        <nav className="grid grid-cols-2 gap-1.5 p-2 lg:block lg:space-y-1.5 lg:p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/admin/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2.5 py-2.5 text-xs font-semibold leading-tight transition-all lg:w-full lg:gap-3 lg:px-3.5 lg:text-sm ${
                  isActive
                    ? "bg-church-700 text-white shadow-md shadow-church-900/20 lg:bg-church-600 lg:shadow-church-900/30"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:text-white/70 lg:hover:bg-white/10 lg:hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 lg:text-white/70"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
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
  );
}
