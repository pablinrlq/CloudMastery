import { renderCredentialImage } from "@/lib/credentials/og-image";

export const alt = "Credencial verificável da CloudMastery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return renderCredentialImage(code);
}
