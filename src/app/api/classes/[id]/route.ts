import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/auth";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Acesso restrito para administradores." }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ error: "Classe inválida." }, { status: 400 });

  try {
    const body = await request.json();
    const updates: Record<string, string | number | boolean | null> = {};
    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 2 || name.length > 80 || !slugify(name)) {
        return NextResponse.json({ error: "Informe um nome de classe entre 2 e 80 caracteres." }, { status: 400 });
      }
      updates.name = name;
      updates.slug = slugify(name);
    }
    if (body.description !== undefined) {
      if (typeof body.description !== "string" || body.description.trim().length > 500) {
        return NextResponse.json({ error: "A descrição pode ter até 500 caracteres." }, { status: 400 });
      }
      updates.description = body.description.trim() || null;
    }
    if (body.sort_order !== undefined) {
      if (!Number.isInteger(body.sort_order) || body.sort_order < 0 || body.sort_order > 9999) {
        return NextResponse.json({ error: "A ordem deve ser um número entre 0 e 9999." }, { status: 400 });
      }
      updates.sort_order = body.sort_order;
    }
    if (body.is_active !== undefined) {
      if (typeof body.is_active !== "boolean") return NextResponse.json({ error: "Estado da classe inválido." }, { status: 400 });
      if (!body.is_active) {
        const { count, error } = await createAdminClient()
          .from("magazines")
          .select("id", { count: "exact", head: true })
          .eq("class_id", params.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (count) return NextResponse.json({ error: "Esta classe tem revistas vinculadas. Mova os materiais para outra classe antes de desativá-la." }, { status: 409 });
      }
      updates.is_active = body.is_active;
    }
    if (!Object.keys(updates).length) return NextResponse.json({ error: "Nenhuma alteração recebida." }, { status: 400 });

    const { data, error } = await createAdminClient()
      .from("classes")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error?.code === "23505") return NextResponse.json({ error: "Já existe uma classe com esse nome." }, { status: 409 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, class: data });
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar a classe." }, { status: 400 });
  }
}
