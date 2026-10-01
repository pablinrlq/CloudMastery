import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade", description: "Como a CloudMastery trata e protege os dados pessoais dos usuários." };

const sections = [
  ["1. Dados tratados", "Tratamos dados de cadastro e autenticação, progresso de estudos, respostas e desempenho em simulados, dados técnicos de segurança e, quando houver assinatura, identificadores e status de cobrança. Os dados completos do cartão são processados pela Stripe e não são armazenados pela CloudMastery."],
  ["2. Finalidades e bases legais", "Usamos esses dados para criar e proteger sua conta, entregar o conteúdo contratado, medir progresso, prevenir fraude, prestar suporte, cumprir obrigações legais e melhorar a plataforma."],
  ["3. Fornecedores", "Usamos infraestrutura de banco de dados e autenticação, Stripe para pagamentos e Vercel para hospedagem e telemetria. Eles recebem apenas os dados necessários às respectivas funções."],
  ["4. Retenção e segurança", "Mantemos os dados pelo período necessário para fornecer a plataforma, cumprir obrigações legais e resolver disputas. Aplicamos criptografia em trânsito, controles de acesso e validação de e-mail."],
  ["5. Seus direitos", "Nos termos da LGPD, você pode solicitar confirmação do tratamento, acesso, correção, portabilidade quando cabível, anonimização, bloqueio ou eliminação."],
] as const;

export default function PrivacyPage() {
  return <article className="bg-slate-50 py-16 sm:py-24"><div className="mx-auto max-w-3xl px-5 sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Legal</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Política de Privacidade</h1><p className="mt-4 text-sm text-slate-500">Última atualização: 25 de setembro de 2026.</p><div className="mt-10 space-y-9 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><p className="text-base leading-7 text-slate-700">A CloudMastery respeita sua privacidade e trata dados pessoais com transparência, segurança e finalidade definida.</p>{sections.map(([title, content]) => <section key={title}><h2 className="text-xl font-extrabold text-slate-950">{title}</h2><p className="mt-3 leading-7 text-slate-600">{content}</p></section>)}</div></div></article>;
}
