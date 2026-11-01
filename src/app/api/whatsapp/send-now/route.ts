import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dispatchMagazineWhatsApp } from "@/lib/whatsapp";
import { isAdminUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { magazineId } = await request.json();

    if (!magazineId) {
      return NextResponse.json({ error: "magazineId é obrigatório." }, { status: 400 });
    }

    const result = await dispatchMagazineWhatsApp(magazineId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Falha no envio da mensagem." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mensagem disparada com sucesso no grupo do WhatsApp!",
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro no disparo de WhatsApp." }, { status: 500 });
  }
}
