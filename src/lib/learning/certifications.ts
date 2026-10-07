// Static facts about each certification track. Client-safe (no filesystem):
// content.ts re-exports it for the server, credentials and tests import it directly.

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
