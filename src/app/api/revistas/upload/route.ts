import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteStoredFile, saveMagazinePdf } from "@/lib/storage";
import { dispatchMagazineWhatsApp } from "@/lib/whatsapp";
import { isAdminUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // 1. Verify admin auth
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Acesso restrito para administradores." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const edition_quarter = (formData.get("edition_quarter") as string) || "4Âº Trimestre / 2026";
    const lesson_number_str = formData.get("lesson_number") as string;
    const lesson_date = formData.get("lesson_date") as string;
    const publish_at_str = formData.get("publish_at") as string;
    const whatsapp_scheduled = formData.get("whatsapp_scheduled") === "true";
    const whatsapp_message_custom = (formData.get("whatsapp_message_custom") as string) || null;

    if (!file || !title || !lesson_date || !publish_at_str) {
      return NextResponse.json(
        { error: "Arquivo PDF, TÃ­tulo, Data da LiÃ§Ã£o e HorÃ¡rio de PublicaÃ§Ã£o sÃ£o obrigatÃ³rios." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Apenas arquivos PDF sÃ£o permitidos para as revistas da EBD." },
        { status: 400 }
      );
    }

    // 2. Save physical file to local volume
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo excede o limite de 25 MB." }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json({ error: "O conteúdo enviado não é um PDF válido." }, { status: 400 });
    }
    const { relativePath, fileName, fileSize } = await saveMagazinePdf(buffer, file.name);

    // 3. Determine status based on publication date/time
    const publishDate = new Date(publish_at_str);
    const now = new Date();
    const isNow = publishDate <= now;
    const status = isNow ? "published" : "scheduled";

    // 4. Save metadata to Supabase Postgres
    const adminClient = createAdminClient();
    const { data: magazine, error: dbError } = await adminClient
      .from("magazines")
      .insert({
        title,
        description,
        edition_quarter,
        lesson_number: lesson_number_str ? parseInt(lesson_number_str, 10) : null,
        lesson_date,
        file_path: relativePath,
        file_name: fileName,
        file_size: fileSize,
        publish_at: publishDate.toISOString(),
        status,
        whatsapp_scheduled,
        whatsapp_sent: false,
        whatsapp_message_custom,
      })
      .select()
      .single();

    if (dbError || !magazine) {
      await deleteStoredFile(relativePath);
      console.error("Erro ao salvar no banco:", dbError);
      return NextResponse.json(
        { error: dbError?.message || "Erro ao salvar no banco de dados." },
        { status: 500 }
      );
    }

    // 5. If immediate publication and WhatsApp is scheduled, trigger WhatsApp now
    let waSent = false;
    if (status === "published" && whatsapp_scheduled) {
      try {
        const waResult = await dispatchMagazineWhatsApp(magazine.id);
        waSent = waResult.success;
      } catch (waErr) {
        console.error("Falha no disparo imediato do WhatsApp:", waErr);
      }
    }

    return NextResponse.json({
      success: true,
      magazine,
      whatsappSentImmediately: waSent,
    });
  } catch (err: any) {
    console.error("Erro no processamento do upload:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno durante upload." },
      { status: 500 }
    );
  }
}
