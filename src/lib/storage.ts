import fs from "fs";
import path from "path";
import { promisify } from "util";
import crypto from "crypto";

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

export function getUploadBaseDir(): string {
  const envDir = process.env.UPLOAD_DIR || "./data/uploads";
  return path.resolve(process.cwd(), envDir);
}

export function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Saves a magazine PDF to local persistent storage
 */
export async function saveMagazinePdf(
  buffer: Buffer,
  originalFileName: string
): Promise<{ relativePath: string; fileName: string; fileSize: number }> {
  const baseDir = getUploadBaseDir();
  const magazinesDir = path.join(baseDir, "magazines");
  ensureDirectoryExists(magazinesDir);

  const cleanOriginalName = path.basename(originalFileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const extension = path.extname(cleanOriginalName) || ".pdf";
  const safeFileName = `${Date.now()}_${randomSuffix}${extension}`;
  const fullPath = path.join(magazinesDir, safeFileName);

  await writeFileAsync(fullPath, buffer);
  const relativePath = path.posix.join("magazines", safeFileName);

  return {
    relativePath,
    fileName: cleanOriginalName,
    fileSize: buffer.length,
  };
}

/**
 * Saves a custom banner image to local storage
 */
export async function saveBannerImage(
  buffer: Buffer,
  originalFileName: string
): Promise<string> {
  const baseDir = getUploadBaseDir();
  const bannersDir = path.join(baseDir, "banners");
  ensureDirectoryExists(bannersDir);

  const cleanOriginalName = path.basename(originalFileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const extension = path.extname(cleanOriginalName) || ".jpg";
  const safeFileName = `banner_${Date.now()}${extension}`;
  const fullPath = path.join(bannersDir, safeFileName);

  await writeFileAsync(fullPath, buffer);
  return path.posix.join("banners", safeFileName);
}

/**
 * Resolves relative stored path to safe absolute system path
 */
export function getAbsoluteFilePath(relativePath: string): string {
  const baseDir = getUploadBaseDir();
  // Prevent path traversal attacks
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, "");
  return path.join(baseDir, safePath);
}

export function fileExists(relativePath: string): boolean {
  try {
    const fullPath = getAbsoluteFilePath(relativePath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

export function getFileStats(relativePath: string): fs.Stats | null {
  try {
    const fullPath = getAbsoluteFilePath(relativePath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.statSync(fullPath);
  } catch {
    return null;
  }
}

export async function deleteStoredFile(relativePath: string): Promise<boolean> {
  try {
    const fullPath = getAbsoluteFilePath(relativePath);
    if (fs.existsSync(fullPath)) {
      await unlinkAsync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao deletar arquivo local:", error);
    return false;
  }
}
