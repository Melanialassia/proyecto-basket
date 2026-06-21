import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression("folder:basket/*")
      .sort_by("created_at", "desc")
      .max_results(8)
      .execute();

    type SearchResource = {
      public_id: string;
      secure_url: string;
      bytes: number;
      created_at: string;
      format: string;
    };

    const files = result.resources.map((r: SearchResource) => {
      const parts = r.public_id.split("/");
      return {
        id: r.public_id,
        fileName: parts[parts.length - 1] ?? r.public_id,
        fileSize: r.bytes,
        format: r.format,
        teamId: parts.length >= 2 ? parts[1] : undefined,
        cloudinaryUrl: r.secure_url,
        uploadedAt: r.created_at,
      };
    });

    return Response.json({ files });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al obtener archivos recientes";
    console.error("[upload/recent GET]", err);
    return Response.json({ error: message }, { status: 500 });
  }
}
