import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de Uso", description: "Condições para utilização e assinatura da plataforma CloudMastery." };

const sections = [
  ["1. Plataforma", "A CloudMastery oferece trilhas, simulados, flashcards e materiais independentes de preparação para certificações AWS. A CloudMastery não é afiliada, patrocinada ou endossada pela Amazon Web Services e não garante aprovação em exames."],
  ["2. Conta e segurança", "Você deve fornecer informações corretas, confirmar seu e-mail e manter suas credenciais protegidas. A conta é pessoal e não pode ser compartilhada."],
  ["3. Assinaturas e cobrança", "Planos pagos são cobrados pela Stripe no preço e periodicidade exibidos antes da confirmação. A renovação é automática até o cancelamento."],
  ["4. Uso permitido", "Você recebe licença limitada, pessoal e não transferível para estudar. É proibido copiar, revender, publicar bancos de questões, automatizar extrações ou contornar controles de acesso."],
  ["5. Fase alpha", "Durante a fase alpha, recursos podem mudar e indisponibilidades podem ocorrer. Empregamos esforços razoáveis para manter segurança e continuidade."],
] as const;

export default function TermsPage() {
  return <article className="bg-slate-50 py-16 sm:py-24"><div className="mx-auto max-w-3xl px-5 sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Legal</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Termos de Uso</h1><p className="mt-4 text-sm text-slate-500">Última atualização: 25 de setembro de 2026.</p><div className="mt-10 space-y-9 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><p className="text-base leading-7 text-slate-700">Ao criar uma conta ou usar a CloudMastery, você concorda com as condições abaixo.</p>{sections.map(([title, content]) => <section key={title}><h2 className="text-xl font-extrabold text-slate-950">{title}</h2><p className="mt-3 leading-7 text-slate-600">{content}</p></section>)}</div></div></article>;
}
