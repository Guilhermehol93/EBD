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

  // 2. Security check: if not published, require admin auth
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
    return NextResponse.json({ error: "Arquivo PDF não encontrado no servidor." }, { status: 404 });
  }

  const stat = fs.statSync(fullFilePath);
  const fileSize = stat.size;

  // 4. Increment view counter
  adminClient
    .from("magazines")
    .update({ views_count: (magazine.views_count || 0) + 1 })
    .eq("id", magazineId)
    .then();

  // 5. Handle HTTP Range Requests for PDF streaming
  const rangeHeader = request.headers.get("range");

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }

    const chunksize = end - start + 1;
    const stream = fs.createReadStream(fullFilePath, { start, end });

    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(magazine.file_name || 'revista-ebd.pdf')}"`,
      },
    });
  }

  // Full content response
  const stream = fs.createReadStream(fullFilePath);
  const webStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Length": fileSize.toString(),
      "Content-Type": "application/pdf",
      "Accept-Ranges": "bytes",
      "Content-Disposition": `inline; filename="${encodeURIComponent(magazine.file_name || 'revista-ebd.pdf')}"`,
      "Cache-Control": "public, max-age=1800",
    },
  });
}
