import { v2 as cloudinary } from "cloudinary";
import type { NextRequest } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CldResource {
  public_id: string;
  secure_url: string;
  bytes: number;
  created_at: string;
  format: string;
}

// GET /api/upload?teamId=team-1
export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("teamId");
  if (!teamId) {
    return Response.json({ error: "teamId requerido" }, { status: 400 });
  }
  try {
    const result = await cloudinary.api.resources({
      resource_type: "image",
      type: "upload",
      prefix: `basket/${teamId}/`,
      max_results: 100,
    });
    const files = result.resources.map((r: CldResource) => ({
      id: r.public_id,
      fileName: r.public_id.split("/").pop() ?? r.public_id,
      fileSize: r.bytes,
      format: r.format,
      cloudinaryUrl: r.secure_url,
      uploadedAt: r.created_at,
    }));
    return Response.json({ files });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al listar archivos";
    console.error("[upload GET]", err);
    return Response.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/upload
export async function DELETE(request: NextRequest) {
  const { publicId } = await request.json().catch(() => ({}));
  if (!publicId) {
    return Response.json({ error: "publicId requerido" }, { status: 400 });
  }
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al eliminar";
    console.error("[upload DELETE]", err);
    return Response.json({ error: message }, { status: 500 });
  }
}

// POST /api/upload
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const teamId = formData.get("teamId") as string | null;

  if (!file) {
    return Response.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: `basket/${teamId ?? "general"}`,
            public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
          },
          (error, result) => {
            if (error || !result) return reject(error ?? new Error("Upload failed"));
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          },
        );
        stream.end(buffer);
      },
    );
    return Response.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message
      : typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: unknown }).message)
        : "Error al subir el archivo";
    console.error("[upload POST]", err);
    return Response.json({ error: message }, { status: 500 });
  }
}
