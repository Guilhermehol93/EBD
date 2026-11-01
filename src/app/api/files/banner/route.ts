import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deleteStoredFile, saveBannerImage, getAbsoluteFilePath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const fileParam = request.nextUrl.searchParams.get("file");
  if (!fileParam) {
    return NextResponse.json({ error: "Parâmetro file não informado." }, { status: 400 });
  }

  // Prevent directory traversal
  const safePath = path.normalize(fileParam);
  if (path.isAbsolute(fileParam) || safePath.split(path.sep)[0] !== "banners" || safePath.split(path.sep).length !== 2) {
    return NextResponse.json({ error: "Caminho não autorizado." }, { status: 403 });
  }

  let fullPath: string;
  try { fullPath = getAbsoluteFilePath(safePath); } catch { return NextResponse.json({ error: "Caminho não autorizado." }, { status: 403 }); }
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

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const allowedTypes: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
    const extension = path.extname(file.name).toLowerCase();
    if (file.size > 5 * 1024 * 1024 || allowedTypes[extension] !== file.type) {
      return NextResponse.json({ error: "Envie uma imagem JPG, PNG ou WebP de até 5 MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const signatureValid = extension === ".png" ? buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : extension === ".webp" ? buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP" : buffer[0] === 0xff && buffer[1] === 0xd8;
    if (!signatureValid) return NextResponse.json({ error: "Conteúdo de imagem inválido." }, { status: 400 });

    const relativePath = await saveBannerImage(buffer, file.name);
    const bannerUrl = `/api/files/banner?file=${encodeURIComponent(relativePath)}`;

    // Update settings table with new banner URL
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("settings")
      .update({ banner_image_url: bannerUrl })
      .eq("id", "general");
    if (error) {
      await deleteStoredFile(relativePath);
      return NextResponse.json({ error: "Não foi possível atualizar as configurações do banner." }, { status: 500 });
    }

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
