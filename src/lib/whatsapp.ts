import { createAdminClient } from "./supabase/admin";
import { formatDatePtBR, getPublicAppUrl } from "./utils";
import { Magazine, ChurchSettings } from "./types";

export interface SendWhatsAppParams {
  recipient: string;
  message: string;
  provider?: 'evolution' | 'webhook';
  apiUrl?: string;
  apiKey?: string;
  instanceName?: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  data?: any;
  error?: string;
}

const WHATSAPP_REQUEST_TIMEOUT_MS = 20_000;

/**
 * Sends a WhatsApp text message through Evolution API or Generic Webhook
 */
export async function sendWhatsAppMessage(params: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const provider = params.provider || process.env.WHATSAPP_PROVIDER || 'evolution';
  const apiUrl = (params.apiUrl || process.env.WHATSAPP_API_URL || 'http://localhost:8080').replace(/\/$/, '');
  const apiKey = params.apiKey || process.env.WHATSAPP_API_KEY || '';
  const instance = params.instanceName || process.env.WHATSAPP_INSTANCE || 'pib-cataguases-ebd';
  const recipient = params.recipient || process.env.WHATSAPP_GROUP_JID || '';

  if (!recipient) {
    return {
      success: false,
      error: 'Destinatário (JID do grupo ou número) do WhatsApp não foi configurado.',
    };
  }

  try {
    if (provider === 'evolution') {
      const endpoint = `${apiUrl}/message/sendText/${encodeURIComponent(instance)}`;

      // Evolution API accepts numbers like '5532999999999' or group jids like '120363028372648291@g.us'
      const payload = {
        number: recipient,
        text: params.message,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(WHATSAPP_REQUEST_TIMEOUT_MS),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = responseData?.message || responseData?.error || `Erro HTTP ${response.status}: ${response.statusText}`;
        return {
          success: false,
          data: responseData,
          error: errorMsg,
        };
      }

      return {
        success: true,
        data: responseData,
      };
    } else {
      // Generic Webhook POST
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          recipient,
          message: params.message,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(WHATSAPP_REQUEST_TIMEOUT_MS),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          data: responseData,
          error: `Erro Webhook HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: responseData,
      };
    }
  } catch (err: any) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      return {
        success: false,
        error: 'A API do WhatsApp não respondeu em 20 segundos. Confira se a Evolution API está ativa e se a instância está conectada.',
      };
    }

    return {
      success: false,
      error: err.message || 'Falha de conexão com a API do WhatsApp.',
    };
  }
}

/**
 * Formats the release announcement message using magazine metadata
 */
export function buildMagazineWhatsAppMessage(
  magazine: Magazine,
  templateString?: string
): string {
  const baseUrl = getPublicAppUrl();
  let directLink: string;
  try {
    const url = new URL(baseUrl);
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/revistas/${magazine.id}`;
    directLink = url.toString();
  } catch {
    directLink = `${baseUrl.replace(/\/$/, "")}/revistas/${magazine.id}`;
  }

  const defaultTemplate =
    templateString ||
    process.env.WHATSAPP_DEFAULT_MESSAGE ||
    '📖 *Escola Bíblica Dominical - PIB Cataguases*\n\n' +
      'A Paz do Senhor! Já está disponível a revista da EBD para o estudo desta semana!\n\n' +
      '📌 *{titulo}*\n' +
      '📅 *Data:* {data}\n' +
      '📖 *Lição:* {numero} | {trimestre}\n\n' +
      '👉 Acesse agora para ler online ou baixar o PDF:\n{link}\n\n' +
      '_"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." (Sl 119:105)_';

  const formattedDate = formatDatePtBR(magazine.lesson_date);
  const lessonNumber = magazine.lesson_number ? String(magazine.lesson_number).padStart(2, '0') : 'Especial';
  const quarter = magazine.edition_quarter || 'Trimestre Atual';

  let msg = defaultTemplate
    .replace(/{titulo}/g, magazine.title)
    .replace(/{data}/g, formattedDate)
    .replace(/{link}/g, directLink)
    .replace(/{numero}/g, lessonNumber)
    .replace(/{trimestre}/g, quarter);

  // Templates saved through environment variables or the settings form can
  // contain literal backslash-n sequences; convert them to actual line breaks.
  return msg.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n");
}

/**
 * Dispatches the WhatsApp message for a given magazine and logs to DB
 */
export async function dispatchMagazineWhatsApp(magazineId: string): Promise<SendWhatsAppResult> {
  const supabase = createAdminClient();

  // 1. Fetch magazine details
  const { data: magazine, error: magError } = await supabase
    .from('magazines')
    .select('*')
    .eq('id', magazineId)
    .single();

  if (magError || !magazine) {
    return { success: false, error: 'Revista não encontrada.' };
  }

  // 2. Fetch church settings for WhatsApp configuration
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'general')
    .single();

  const recipient = settings?.whatsapp_group_jid || process.env.WHATSAPP_GROUP_JID || '';
  const rawMessage = magazine.whatsapp_message_custom || buildMagazineWhatsAppMessage(magazine, settings?.whatsapp_default_message);
  const messageText = rawMessage.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n");

  // 3. Send message
  const result = await sendWhatsAppMessage({
    recipient,
    message: messageText,
    provider: settings?.whatsapp_api_provider,
    apiUrl: process.env.WHATSAPP_API_URL,
    apiKey: process.env.WHATSAPP_API_KEY,
    instanceName: settings?.whatsapp_instance_name,
  });

  // 4. Log in database
  await supabase.from('logs_whatsapp').insert({
    magazine_id: magazine.id,
    recipient,
    status: result.success ? 'success' : 'failed',
    message: messageText,
    response_payload: result.data || null,
    error_message: result.error || null,
  });

  // 5. If successful, update magazine record
  if (result.success) {
    await supabase
      .from('magazines')
      .update({
        whatsapp_sent: true,
        whatsapp_sent_at: new Date().toISOString(),
      })
      .eq('id', magazine.id);
  }

  return result;
}
