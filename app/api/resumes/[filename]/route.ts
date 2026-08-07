import { readFile } from "fs/promises";
import path from "path";

const contentTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(_: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const safeName = path.basename(filename);
  if (safeName !== filename || !process.env.OFFERTRACK_UPLOAD_DIR) return new Response("Not found", { status: 404 });
  try {
    const file = await readFile(path.join(process.env.OFFERTRACK_UPLOAD_DIR, safeName));
    return new Response(file, { headers: { "Content-Type": contentTypes[path.extname(safeName).toLowerCase()] ?? "application/octet-stream" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
