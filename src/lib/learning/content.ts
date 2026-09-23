import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "@/lib/frontmatter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ModuleFrontmatter = {
  title: string;
  description: string;
  domain: string;
  order: number;
  durationMinutes: number;
  /** teoria (padrão), lab (mão na massa) ou revisao (reta final) */
  type?: "teoria" | "lab" | "revisao";
  /** semana sugerida no mapa de estudos */
  week?: number;
};

export type ModuleMeta = ModuleFrontmatter & {
  slug: string;
  certId: string;
};

export type ModuleContent = ModuleMeta & {
  body: string; // raw MDX, compiled at render time via next-mdx-remote/rsc
};

export function getModules(certId: string): ModuleMeta[] {
  const dir = path.join(CONTENT_DIR, certId, "modules");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = parseFrontmatter<ModuleFrontmatter>(raw);
      return { ...data, slug, certId };
    })
    .sort((a, b) => a.order - b.order);
}

export function getModule(certId: string, slug: string): ModuleContent | null {
  const filePath = path.join(CONTENT_DIR, certId, "modules", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = parseFrontmatter<ModuleFrontmatter>(raw);
  return { ...data, slug, certId, body: content };
}

export const CERTIFICATIONS = {
  ccp: {
    id: "ccp",
    name: "AWS Certified Cloud Practitioner",
    code: "CLF-C02",
    examDurationMinutes: 90,
    examQuestionCount: 65,
    suggestedWeeks: 7,
    domains: [
      "Conceitos de Nuvem",
      "Segurança e Conformidade",
      "Tecnologia e Serviços",
      "Cobrança, Preços e Suporte",
    ],
  },
  saa: {
    id: "saa",
    name: "AWS Certified Solutions Architect – Associate",
    code: "SAA-C03",
    examDurationMinutes: 130,
    examQuestionCount: 65,
    suggestedWeeks: 9,
    domains: [
      "Arquiteturas Seguras",
      "Arquiteturas Resilientes",
      "Arquiteturas de Alta Performance",
      "Arquiteturas com Custo Otimizado",
    ],
  },
  aif: {
    id: "aif",
    name: "AWS Certified AI Practitioner",
    code: "AIF-C01",
    examDurationMinutes: 90,
    examQuestionCount: 65,
    suggestedWeeks: 6,
    domains: [
      "Fundamentos de IA e ML",
      "Fundamentos de IA Generativa",
      "Aplicações de Modelos de Fundação",
      "Diretrizes para IA Responsável",
      "Segurança, Conformidade e Governança para Soluções de IA",
    ],
  },
} as const;

export type CertId = keyof typeof CERTIFICATIONS;

export function isValidCert(certId: string): certId is CertId {
  return certId in CERTIFICATIONS;
}
