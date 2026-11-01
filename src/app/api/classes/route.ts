import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/auth";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const client = isAdminUser(user) ? createAdminClient() : supabase;
  const query = client.from("classes").select("*").order("sort_order").order("name");
  const { data, error } = isAdminUser(user)
    ? await query
    : await query.eq("is_active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ classes: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Acesso restrito para administradores." }, { status: 401 });

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const slug = slugify(name);
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const sortOrder = Number.isInteger(body.sort_order) ? body.sort_order : 0;
    if (name.length < 2 || name.length > 80 || !slug) {
      return NextResponse.json({ error: "Informe um nome de classe entre 2 e 80 caracteres." }, { status: 400 });
    }
    if (description.length > 500) return NextResponse.json({ error: "A descrição pode ter até 500 caracteres." }, { status: 400 });
    if (sortOrder < 0 || sortOrder > 9999) return NextResponse.json({ error: "A ordem deve ser um número entre 0 e 9999." }, { status: 400 });

    const { data, error } = await createAdminClient()
      .from("classes")
      .insert({ name, slug, description: description || null, sort_order: sortOrder })
      .select("*")
      .single();
    if (error?.code === "23505") return NextResponse.json({ error: "Já existe uma classe com esse nome." }, { status: 409 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, class: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível cadastrar a classe." }, { status: 400 });
  }
}
