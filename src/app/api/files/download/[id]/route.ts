import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAbsoluteFilePath } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const magazineId = params.id;
  const adminClient = createAdminClient();

  // 1. Fetch magazine metadata
  const { data: magazine, error } = await adminClient
    .from("magazines")
    .select("*")
    .eq("id", magazineId)
    .single();

  if (error || !magazine) {
    return NextResponse.json({ error: "Revista não encontrada." }, { status: 404 });
  }

  // 2. Security check: if not published, only authenticated admin can download
  if (magazine.status !== "published" || new Date(magazine.publish_at) > new Date()) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Conteúdo ainda não disponível." }, { status: 403 });
    }
  }

  // 3. Locate physical file
  const fullFilePath = getAbsoluteFilePath(magazine.file_path);
  if (!fs.existsSync(fullFilePath)) {
    return NextResponse.json({ error: "Arquivo PDF não encontrado no servidor local." }, { status: 404 });
  }

  const stat = fs.statSync(fullFilePath);
  const fileStream = fs.createReadStream(fullFilePath);

  // 4. Increment download counter asynchronously (doesn't block download)
  adminClient
    .from("magazines")
    .update({ downloads_count: (magazine.downloads_count || 0) + 1 })
    .eq("id", magazineId)
    .then();

  // 5. Build response headers for download
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Length", stat.size.toString());
  headers.set(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(magazine.file_name || 'revista-ebd.pdf')}"`
  );
  headers.set("Cache-Control", "public, max-age=3600");

  // Convert Node readable stream to Web ReadableStream
  const webStream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => controller.enqueue(chunk));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers,
  });
}
