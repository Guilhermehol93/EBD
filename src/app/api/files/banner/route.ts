import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { saveBannerImage, getAbsoluteFilePath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const fileParam = request.nextUrl.searchParams.get("file");
  if (!fileParam) {
    return NextResponse.json({ error: "Parâmetro file não informado." }, { status: 400 });
  }

  // Prevent directory traversal
  const safePath = path.normalize(fileParam).replace(/^(\.\.[\/\\])+/, "");
  if (!safePath.startsWith("banners") && !safePath.startsWith("magazines")) {
    return NextResponse.json({ error: "Caminho não autorizado." }, { status: 403 });
  }

  const fullPath = getAbsoluteFilePath(safePath);
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  }

  const stat = fs.statSync(fullPath);
  const ext = path.extname(fullPath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  const contentType = mimeMap[ext] || "application/octet-stream";

  const fileStream = fs.createReadStream(fullPath);
  const webStream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => controller.enqueue(chunk));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const relativePath = await saveBannerImage(buffer, file.name);
    const bannerUrl = `/api/files/banner?file=${encodeURIComponent(relativePath)}`;

    // Update settings table with new banner URL
    const adminClient = createAdminClient();
    await adminClient
      .from("settings")
      .update({ banner_image_url: bannerUrl })
      .eq("id", "general");

    return NextResponse.json({
      success: true,
      bannerUrl,
      relativePath,
    });
  } catch (err: any) {
    console.error("Erro no upload do banner:", err);
    return NextResponse.json({ error: err.message || "Erro no upload." }, { status: 500 });
  }
}
