import { MagazineStatus } from "@/lib/types";
import { CheckCircle2, Clock, Archive } from "lucide-react";

interface StatusBadgeProps {
  status: MagazineStatus;
  publishAt?: string;
}

export function StatusBadge({ status, publishAt }: StatusBadgeProps) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Publicada</span>
      </span>
    );
  }

  if (status === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3.5 h-3.5" />
        <span>Agendada</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      <Archive className="w-3.5 h-3.5" />
      <span>Arquivada</span>
    </span>
  );
}
