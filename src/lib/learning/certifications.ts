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
    // Percent of the scored exam per domain, in `domains` order (official exam guide).
    domainWeights: [24, 30, 34, 12],
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
    domainWeights: [30, 26, 24, 20],
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
    domainWeights: [20, 24, 28, 14, 14],
  },
} as const;

export type CertId = keyof typeof CERTIFICATIONS;

export function isValidCert(certId: string): certId is CertId {
  return certId in CERTIFICATIONS;
}

/** Official exam weight of each domain, keyed by domain name. */
export function domainWeights(certId: CertId): Record<string, number> {
  const cert = CERTIFICATIONS[certId];
  return Object.fromEntries(cert.domains.map((domain, index) => [domain, cert.domainWeights[index]]));
}
