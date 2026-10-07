import { getPublicCredential } from "@/lib/credentials/server";
import { renderCredentialImage } from "@/lib/credentials/og-image";

// Stable download URL for the share image (the opengraph-image route gets a
// generated suffix, so it can't be linked to directly).
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const credential = await getPublicCredential(code);
  if (!credential) return new Response("Credencial não encontrada", { status: 404 });

  const image = await renderCredentialImage(credential.code);
  image.headers.set("Content-Disposition", `attachment; filename="cloudmastery-${credential.code}.png"`);
  image.headers.set("Cache-Control", "public, max-age=3600");
  return image;
}
