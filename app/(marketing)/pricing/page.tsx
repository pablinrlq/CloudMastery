import { CheckoutButton } from "@/components/checkout-button";

export const metadata = {
  title: "Planos e preços",
};

const includedFeatures = [
  "Trilhas completas: Cloud Practitioner (CLF-C02) e Solutions Architect (SAA-C03)",
  "Todas as certificações futuras inclusas (Developer e SysOps em breve)",
  "Simulados no formato oficial com dicas estilo AWS Jam",
  "Análise de tempo por questão e desempenho por domínio",
  "Recomendações de estudo baseadas nos seus erros",
  "9 labs práticos guiados com custo estimado",
  "Flashcards de revisão espaçada",
  "Diagnóstico de prontidão: saiba QUANDO agendar a prova",
];

export default function PricingPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
          Invista na sua carreira em nuvem
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
          Um profissional certificado AWS ganha em média R$ 2.000+ a mais por mês.
          A CloudMastery custa menos que um lanche por semana.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="cm-card-hover rounded-2xl border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900">Mensal</h2>
            <p className="mt-1 text-sm text-gray-500">Para quem quer testar o método</p>
            <p className="mt-4 text-5xl font-extrabold text-gray-900">
              R$ 39
              <span className="text-base font-normal text-gray-500">/mês</span>
            </p>
            <CheckoutButton
              plan="monthly"
              className="mt-6 w-full rounded-xl border-2 border-orange-500 px-4 py-3 font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50"
            >
              Assinar plano mensal
            </CheckoutButton>
          </div>

          <div className="cm-card-hover relative rounded-2xl border-2 border-orange-500 bg-gradient-to-b from-orange-50/60 to-white p-8">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-orange-500/30">
              MAIS POPULAR · 2 MESES GRÁTIS
            </span>
            <h2 className="text-lg font-bold text-gray-900">Anual</h2>
            <p className="mt-1 text-sm text-gray-500">
              Tempo de sobra para 2+ certificações
            </p>
            <p className="mt-4 text-5xl font-extrabold text-gray-900">
              R$ 390
              <span className="text-base font-normal text-gray-500">/ano</span>
            </p>
            <p className="mt-1 text-xs font-medium text-green-600">
              equivale a R$ 32,50/mês
            </p>
            <CheckoutButton
              plan="annual"
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-orange-500/40 disabled:opacity-50"
            >
              Assinar plano anual
            </CheckoutButton>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h3 className="font-bold text-gray-900">Tudo incluso em qualquer plano:</h3>
          <ul className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
            {includedFeatures.map((feature) => (
              <li key={feature} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-[9px] font-bold text-white"
                >
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Sem fidelidade. Cancele em 2 cliques no portal do assinante.
        </p>
      </div>
    </div>
  );
}
