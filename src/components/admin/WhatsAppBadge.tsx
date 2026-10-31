import { MessageSquare, CheckCircle, Clock, AlertTriangle, MinusCircle } from "lucide-react";

interface WhatsAppBadgeProps {
  scheduled: boolean;
  sent: boolean;
  sentAt?: string | null;
}

export function WhatsAppBadge({ scheduled, sent, sentAt }: WhatsAppBadgeProps) {
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title={`Enviado em ${sentAt || 'data registrada'}`}>
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Enviado</span>
      </span>
    );
  }

  if (scheduled) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200" title="Disparo automático agendado junto com a liberação da revista">
        <Clock className="w-3.5 h-3.5" />
        <span>Agendado</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
      <MinusCircle className="w-3.5 h-3.5" />
      <span>Desativado</span>
    </span>
  );
}
