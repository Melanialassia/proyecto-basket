import { v2 as cloudinary } from "cloudinary";
import type { NextRequest } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/file?publicId=basket/team-1/file.pdf&resourceType=raw
// Genera una URL firmada y redirige → el browser abre el PDF inline
export async function GET(request: NextRequest) {
  const publicId = request.nextUrl.searchParams.get("publicId");
  const resourceType = (request.nextUrl.searchParams.get("resourceType") ?? "image") as "image" | "raw";

  if (!publicId) {
    return Response.json({ error: "publicId requerido" }, { status: 400 });
  }

  // URL firmada válida por 1 hora
  const signedUrl = cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "upload",
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });

  // Redirige al browser directamente a la URL firmada
  return Response.redirect(signedUrl, 302);
}
