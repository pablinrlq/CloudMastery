import "server-only";
import { normalizeSiteOrigin } from "@/lib/security";

function configuredSiteUrl(): URL {
  try {
    return normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL deve ser uma origem HTTP(S) válida.");
  }
}

export function siteUrl(path = "/"): URL {
  return new URL(path, configuredSiteUrl());
}
