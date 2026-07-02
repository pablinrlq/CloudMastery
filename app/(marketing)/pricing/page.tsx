import { CheckoutButton } from "@/components/checkout-button";

export const metadata = {
  title: "Planos e preços",
};

const includedFeatures = [
  "Trilhas completas: Cloud Practitioner (CLF-C02) e Solutions Architect Associate (SAA-C03)",
  "Simulados cronometrados no formato oficial da prova",
  "Resultado com análise por domínio: veja exatamente onde melhorar",
  "Banco de questões com explicações comentadas",
  "Flashcards de revisão",
  "Diagnóstico de prontidão: saiba quando você está pronto para agendar a prova",
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-center text-3xl font-bold">
        Invista na sua certificação AWS
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
        Acesso completo a todas as trilhas, simulados e ferramentas de estudo.
        Cancele quando quiser.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold">Mensal</h2>
          <p className="mt-2 text-4xl font-bold">
            R$ 39<span className="text-base font-normal text-gray-500">/mês</span>
          </p>
          <CheckoutButton
            plan="monthly"
            className="mt-6 w-full rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            Assinar plano mensal
          </CheckoutButton>
        </div>

        <div className="relative rounded-2xl border-2 border-orange-500 p-8">
          <span className="absolute -top-3 left-8 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
            2 meses grátis
          </span>
          <h2 className="text-lg font-semibold">Anual</h2>
          <p className="mt-2 text-4xl font-bold">
            R$ 390<span className="text-base font-normal text-gray-500">/ano</span>
          </p>
          <CheckoutButton
            plan="annual"
            className="mt-6 w-full rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            Assinar plano anual
          </CheckoutButton>
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-gray-50 p-8">
        <h3 className="font-semibold">Tudo incluso em qualquer plano:</h3>
        <ul className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
          {includedFeatures.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span aria-hidden className="text-orange-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
