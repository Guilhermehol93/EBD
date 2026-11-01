import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { isAdminUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const recipient = body.recipient || process.env.WHATSAPP_GROUP_JID;

    if (!recipient) {
      return NextResponse.json(
        { error: "Nenhum número ou ID de grupo informado para teste." },
        { status: 400 }
      );
    }

    const testMessage =
      body.message ||
      `🔔 *Teste de Conexão - EBD PIB Cataguases*\n\n` +
      `A integração do WhatsApp está funcionando com 100% de sucesso no servidor local!\n\n` +
      `📅 *Horário do teste:* ${new Date().toLocaleString("pt-BR")}`;

    const result = await sendWhatsAppMessage({
      recipient,
      message: testMessage,
      // Destination and credentials are server-controlled to prevent SSRF.
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Falha ao enviar mensagem de teste.", data: result.data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mensagem de teste enviada com sucesso!",
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro no teste de WhatsApp." }, { status: 500 });
  }
}
