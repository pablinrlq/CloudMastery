import "server-only";
import { isLoopbackHostname, normalizeSiteOrigin } from "@/lib/security";

function vercelPublicUrl(): URL | null {
  const hostname =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  if (!hostname) return null;

  try {
    return normalizeSiteOrigin(`https://${hostname}`);
  } catch {
    return null;
  }
}

function configuredSiteUrl(): URL {
  try {
    const configured = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);

    // Prevent a stale local value from leaking into confirmation emails on Vercel.
    if (process.env.VERCEL === "1" && isLoopbackHostname(configured.hostname)) {
      const deployedUrl = vercelPublicUrl();
      if (deployedUrl) return deployedUrl;
      throw new Error("URL pública da Vercel indisponível.");
    }

    return configured;
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL deve ser uma origem HTTP(S) válida.");
  }
}

export function siteUrl(path = "/"): URL {
  return new URL(path, configuredSiteUrl());
}
