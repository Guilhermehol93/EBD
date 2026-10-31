import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteStoredFile } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminClient = createAdminClient();
  const { data: magazine, error } = await adminClient
    .from("magazines")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !magazine) {
    return NextResponse.json({ error: "Revista não encontrada." }, { status: 404 });
  }

  return NextResponse.json(magazine);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const adminClient = createAdminClient();

    const allowedUpdates: Record<string, any> = {};
    const fields = [
      "title",
      "description",
      "edition_quarter",
      "lesson_number",
      "lesson_date",
      "publish_at",
      "status",
      "whatsapp_scheduled",
      "whatsapp_message_custom",
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        allowedUpdates[field] = body[field];
      }
    }

    const { data: updated, error } = await adminClient
      .from("magazines")
      .update(allowedUpdates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, magazine: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // 1. Get magazine to obtain file path
  const { data: magazine } = await adminClient
    .from("magazines")
    .select("file_path")
    .eq("id", params.id)
    .single();

  // 2. Delete from database
  const { error } = await adminClient
    .from("magazines")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. Delete physical local file from disk
  if (magazine?.file_path) {
    await deleteStoredFile(magazine.file_path);
  }

  return NextResponse.json({ success: true });
}
