import { createAdminClient } from "./supabase/admin";
import { dispatchMagazineWhatsApp } from "./whatsapp";

let isJobRunning = false;

/**
 * Checks for scheduled magazines that have reached their publication time,
 * marks them as 'published', and triggers WhatsApp dispatch if scheduled.
 */
export async function processScheduledMagazines() {
  if (isJobRunning) {
    return { skipped: true, reason: "Execução anterior ainda em andamento" };
  }

  isJobRunning = true;
  const now = new Date().toISOString();

  try {
    const supabase = createAdminClient();

    // 1. Fetch scheduled magazines due for publication
    const { data: dueMagazines, error } = await supabase
      .from("magazines")
      .select("*")
      .eq("status", "scheduled")
      .lte("publish_at", now);

    if (error) {
      console.error("[CRON] Erro ao buscar revistas agendadas:", error.message);
      return { success: false, error: error.message };
    }

    if (!dueMagazines || dueMagazines.length === 0) {
      return { success: true, processed: 0, message: "Nenhuma revista agendada para liberar no momento." };
    }

    console.log(`[CRON] Encontradas ${dueMagazines.length} revistas para publicação automática.`);

    const results = [];

    for (const mag of dueMagazines) {
      // 2. Update status to 'published'
      const { error: updateError } = await supabase
        .from("magazines")
        .update({ status: "published" })
        .eq("id", mag.id);

      if (updateError) {
        console.error(`[CRON] Erro ao atualizar status da revista ${mag.id}:`, updateError.message);
        results.push({ id: mag.id, title: mag.title, status: "failed_status_update" });
        continue;
      }

      console.log(`[CRON] Revista "${mag.title}" (ID: ${mag.id}) publicada com sucesso.`);

      // 3. Dispatch WhatsApp if scheduled and not sent yet
      let whatsappStatus = "not_scheduled";
      if (mag.whatsapp_scheduled && !mag.whatsapp_sent) {
        try {
          console.log(`[CRON] Disparando WhatsApp para a revista "${mag.title}"...`);
          const waResult = await dispatchMagazineWhatsApp(mag.id);
          whatsappStatus = waResult.success ? "sent" : `failed: ${waResult.error}`;
        } catch (waErr: any) {
          whatsappStatus = `error: ${waErr.message}`;
          console.error(`[CRON] Erro no envio do WhatsApp da revista ${mag.id}:`, waErr);
        }
      }

      results.push({
        id: mag.id,
        title: mag.title,
        status: "published",
        whatsapp: whatsappStatus,
      });
    }

    return {
      success: true,
      processed: dueMagazines.length,
      timestamp: now,
      results,
    };
  } catch (err: any) {
    console.error("[CRON] Falha no processamento agendado:", err);
    return { success: false, error: err.message };
  } finally {
    isJobRunning = false;
  }
}

/**
 * Initializes the node-cron background task (runs every 60 seconds)
 */
export function initBackgroundCron() {
  if (process.env.NODE_ENV === "test") return;

  // Avoid initializing multiple times in dev hot-reloads
  if ((global as any).__ebd_cron_initialized) {
    return;
  }
  (global as any).__ebd_cron_initialized = true;

  try {
    const cron = require("node-cron");
    console.log("[EBD SCHEDULER] Inicializando agendador interno (verificação a cada 60s)...");

    // Run every minute: "* * * * *"
    cron.schedule("* * * * *", async () => {
      try {
        await processScheduledMagazines();
      } catch (e) {
        console.error("[EBD SCHEDULER] Erro não tratado no ciclo do cron:", e);
      }
    });

    console.log("[EBD SCHEDULER] Agendador ativo e monitorando publicações da EBD.");
  } catch (err) {
    console.error("[EBD SCHEDULER] Não foi possível carregar node-cron:", err);
  }
}
