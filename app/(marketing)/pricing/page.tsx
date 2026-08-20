import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";

export const metadata = { title: "Planos e preços" };

const features = [
  "Trilhas completas para CLF-C02 e SAA-C03",
  "Simulados no formato e tempo oficiais",
  "Análise por domínio e tempo por questão",
  "9 laboratórios práticos guiados",
  "Flashcards com revisão direcionada",
  "Diagnóstico do momento certo para a prova",
  "Novas certificações incluídas sem custo extra",
  "Cancelamento pelo portal do assinante",
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-24 text-slate-950">
      <section className="relative overflow-hidden bg-[#080b12] pb-36 pt-20 text-white sm:pt-24">
        <div className="cm-grid-bg absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[700px] -translate-x-1/2 rounded-full bg-orange-500/15 blur-[110px]" />
        <div className="cm-container relative text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Um plano. Acesso completo.</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-5xl font-bold tracking-[-0.055em] sm:text-6xl">Invista em clareza, não em mais conteúdo solto.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">Todas as ferramentas para estudar, praticar e medir sua prontidão em um único lugar.</p>
        </div>
      </section>

      <div className="cm-container relative -mt-24">
        {checkout === "cancelled" && (
          <p role="status" className="mx-auto mb-6 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-semibold text-amber-800 shadow-sm">Checkout cancelado. Nenhuma cobrança foi realizada.</p>
        )}

        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.35)] sm:p-9">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">Plano mensal</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Flexibilidade total</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">MENSAL</span></div>
            <div className="mt-8 flex items-end gap-2 border-b border-slate-100 pb-8"><span className="pb-2 text-sm font-bold text-slate-400">R$</span><span className="text-6xl font-bold tracking-[-0.06em]">39</span><span className="pb-2 text-sm text-slate-400">/mês</span></div>
            <p className="mt-7 text-sm leading-6 text-slate-600">Ideal para conhecer o método ou acelerar uma preparação já em andamento.</p>
            <CheckoutButton plan="monthly" className="cm-button-secondary mt-7 w-full">Escolher plano mensal</CheckoutButton>
          </article>

          <article className="relative overflow-hidden rounded-[1.75rem] border border-orange-400 bg-[#0d121c] p-7 text-white shadow-[0_32px_90px_-38px_rgba(249,115,22,0.45)] sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-500/15 blur-[80px]" />
            <div className="relative flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-orange-300">Plano anual</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Ritmo para ir além</h2></div><span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-bold text-slate-950">2 MESES GRÁTIS</span></div>
            <div className="relative mt-8 flex items-end gap-2 border-b border-white/10 pb-8"><span className="pb-2 text-sm font-bold text-slate-500">R$</span><span className="text-6xl font-bold tracking-[-0.06em]">390</span><span className="pb-2 text-sm text-slate-500">/ano</span></div>
            <p className="relative mt-7 text-sm leading-6 text-slate-400">Equivale a R$ 32,50 por mês. Tempo para conquistar duas ou mais certificações.</p>
            <CheckoutButton plan="annual" className="cm-button-primary mt-7 w-full">Escolher plano anual <span className="ml-2" aria-hidden>→</span></CheckoutButton>
          </article>
        </div>

        <section className="mx-auto mt-8 max-w-5xl rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.3)] sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div><p className="cm-kicker">Tudo incluído</p><h2 className="mt-4 text-2xl font-bold tracking-[-0.035em]">A mesma experiência completa em qualquer plano.</h2><p className="mt-4 text-sm leading-6 text-slate-500">Sem módulos bloqueados, pacotes adicionais ou surpresas depois da compra.</p></div>
            <ul className="grid gap-x-7 gap-y-4 sm:grid-cols-2">{features.map((feature) => <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-black text-orange-600" aria-hidden>✓</span>{feature}</li>)}</ul>
          </div>
        </section>

        <div className="mt-10 text-center"><p className="text-sm text-slate-500">Pagamento seguro processado pelo Stripe · Sem fidelidade</p><Link href="/" className="cm-link mt-4 inline-flex">← Voltar para a página inicial</Link></div>
      </div>
    </main>
  );
}
