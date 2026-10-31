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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen text-slate-300">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-church-600 to-church-500 text-white flex items-center justify-center shadow-lg shadow-church-900/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">EBD Manager</h2>
              <p className="text-[11px] text-slate-400">PIB Cataguases</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-church-600 text-white shadow-md shadow-church-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer of sidebar */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Portal Público</span>
          </span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Novo</span>
        </Link>

        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
