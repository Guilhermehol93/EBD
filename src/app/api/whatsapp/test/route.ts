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

    const instanceName =
      typeof body.instanceName === "string" && body.instanceName.trim()
        ? body.instanceName.trim()
        : process.env.WHATSAPP_INSTANCE || "pib-cataguases-ebd";
    const provider: "evolution" | "webhook" =
      body.provider === "webhook" || body.provider === "evolution"
        ? body.provider
        : process.env.WHATSAPP_PROVIDER === "webhook"
          ? "webhook"
          : "evolution";

    if (provider === "evolution") {
      const apiUrl = (process.env.WHATSAPP_API_URL || "http://evolution-api:8080").replace(/\/$/, "");
      const apiKey = process.env.WHATSAPP_API_KEY || "";

      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: "WHATSAPP_API_KEY não está configurada no servidor." },
          { status: 500 }
        );
      }

      let stateResponse: Response;
      try {
        stateResponse = await fetch(
          `${apiUrl}/instance/connectionState/${encodeURIComponent(instanceName)}`,
          {
            headers: { apikey: apiKey },
            signal: AbortSignal.timeout(5_000),
          }
        );
      } catch (error: any) {
        const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
        return NextResponse.json(
          {
            success: false,
            error: timedOut
              ? "A Evolution API não respondeu à verificação de estado em 5 segundos. Confira WHATSAPP_API_URL e os logs do container."
              : `Não foi possível acessar a Evolution API: ${error?.message || "falha de rede"}`,
          },
          { status: timedOut ? 504 : 502 }
        );
      }

      const stateData = await stateResponse.json().catch(() => null);
      if (!stateResponse.ok) {
        const error = stateResponse.status === 401
          ? "A Evolution API recusou WHATSAPP_API_KEY. Confirme se a chave é igual nos dois serviços."
          : stateResponse.status === 404
            ? `A instância "${instanceName}" não foi encontrada na Evolution API.`
            : stateData?.message || `A Evolution API respondeu HTTP ${stateResponse.status}.`;

        return NextResponse.json({ success: false, error }, { status: stateResponse.status });
      }

      const connectionState = stateData?.instance?.state;
      if (connectionState !== "open") {
        return NextResponse.json(
          {
            success: false,
            error: `A instância "${instanceName}" não está conectada (estado: ${connectionState || "desconhecido"}). Conecte-a no Evolution Manager e tente novamente.`,
            state: connectionState || "unknown",
          },
          { status: 409 }
        );
      }
    }

    const result = await sendWhatsAppMessage({
      recipient,
      message: testMessage,
      provider,
      instanceName,
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
