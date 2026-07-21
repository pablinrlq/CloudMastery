import Link from "next/link";
import { CERTIFICATIONS } from "@/lib/content";

const features = [
  {
    icon: "🗺️",
    title: "Trilha semanal guiada",
    text: "46 módulos organizados por semanas de estudo: teoria direta ao ponto, labs práticos com custo estimado e módulos de reta final.",
  },
  {
    icon: "⏱️",
    title: "Simulados no formato oficial",
    text: "Mesmo número de questões e tempo da prova real. O cronômetro não te corta: estourou, ele conta negativo e registra o excedente.",
  },
  {
    icon: "💡",
    title: "Dicas com penalidade",
    text: "Travou? Use a dica — mas a questão passa a valer meio ponto, como num AWS Jam. Você treina a decisão sob pressão, não a decoreba.",
  },
  {
    icon: "📊",
    title: "Análise de tempo por questão",
    text: "A plataforma mede quanto você levou em cada questão e mostra onde você trava — mesmo nas que acertou.",
  },
  {
    icon: "🎯",
    title: "Recomendações inteligentes",
    text: "Foi mal em um domínio? O resultado aponta exatamente quais módulos revisar, do seu ponto mais fraco para o mais forte.",
  },
  {
    icon: "🧪",
    title: "Labs mão na massa",
    text: "9 laboratórios guiados na sua própria conta AWS, com validação, custo estimado e limpeza — porque a prova cobra quem já fez.",
  },
];

const steps = [
  {
    title: "Estude pela trilha",
    text: "Módulos objetivos pelos domínios oficiais, com sinais de prova e armadilhas em cada tópico.",
  },
  {
    title: "Treine como na prova",
    text: "Simulados cronometrados no formato oficial, correção só no final — sem decorar gabarito.",
  },
  {
    title: "Veja onde melhorar",
    text: "Nota por domínio, tempo por questão e questões comentadas uma a uma.",
  },
  {
    title: "Agende com confiança",
    text: "O diagnóstico cruza trilha + simulados e avisa quando você está pronto de verdade.",
  },
];

const faq = [
  {
    q: "Quanto tempo preciso estudar para o Cloud Practitioner?",
    a: "Com 1h por dia, a maioria das pessoas se prepara em 4 a 6 semanas. A trilha CCP é organizada em 4 semanas, com duração estimada por módulo, e o diagnóstico avisa quando sua média de simulados atinge a faixa segura.",
  },
  {
    q: "E para o Solutions Architect Associate?",
    a: "Partindo de alguma experiência com AWS, tipicamente 9 a 12 semanas com 1h por dia. A trilha SAA tem 31 módulos em 9 semanas, incluindo 7 labs práticos e módulos de reta final.",
  },
  {
    q: "Os simulados são iguais à prova?",
    a: "Seguem o mesmo formato: mesma quantidade de questões, mesmo tempo, questões de cenário e correção apenas no final, com nota por domínio como no relatório oficial da AWS — e ainda medem seu tempo por questão, o que a prova real não te conta.",
  },
  {
    q: "O conteúdo é em português?",
    a: "100% em português do Brasil, escrito para as versões atuais dos exames (CLF-C02 e SAA-C03). E a prova oficial também pode ser feita em português.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. A assinatura é sem fidelidade e você gerencia tudo (troca de plano, cancelamento) direto no portal de pagamento.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <div className="cm-grid-bg absolute inset-0" />
        <div className="cm-hero-glow absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-20 text-center sm:pt-28">
          <p className="cm-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
            Trilhas CLF-C02 e SAA-C03 completas — 100% em português
          </p>
          <h1 className="cm-fade-up mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Domine a nuvem.
            <span className="block bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Conquiste sua certificação AWS.
            </span>
          </h1>
          <p className="cm-fade-up-delay-1 mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            A CloudMastery une trilha semanal, simulados no formato oficial e
            análise de dados do seu desempenho — tempo por questão, pontos fracos
            por domínio e o momento certo de agendar a prova.
          </p>
          <div className="cm-fade-up-delay-2 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3.5 font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:scale-[1.02] hover:shadow-orange-500/50 sm:w-auto"
            >
              Começar agora →
            </Link>
            <Link
              href="/pricing"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur transition hover:border-white/30 hover:bg-white/10 sm:w-auto"
            >
              Ver planos
            </Link>
          </div>

          {/* stats */}
          <div className="cm-fade-up-delay-2 mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ["46", "módulos autorais"],
              ["9", "labs guiados"],
              ["130+", "questões comentadas"],
              ["2", "certificações (e contando)"],
            ].map(([n, label]) => (
              <div key={label}>
                <p className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-3xl font-extrabold text-transparent">
                  {n}
                </p>
                <p className="mt-1 text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MOCK DO RESULTADO ---------- */}
      <section className="relative bg-gray-950 pb-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-gray-500">
                cloudmastery — resultado do simulado
              </span>
            </div>
            <div className="grid gap-8 p-8 sm:grid-cols-[auto_1fr]">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-white">82%</p>
                <p className="mt-1 text-sm text-green-400">Acima da aprovação</p>
                <p className="mt-3 text-xs text-gray-500">
                  53 de 65 · 1 dica usada
                  <br />
                  ⏱ 12 min de sobra
                </p>
              </div>
              <div className="space-y-3">
                {[
                  ["Arquiteturas Seguras", 90, false],
                  ["Arquiteturas Resilientes", 84, false],
                  ["Alta Performance", 81, false],
                  ["Custo Otimizado", 64, true],
                ].map(([domain, pct, weak]) => (
                  <div key={domain as string}>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">{domain}</span>
                      <span className={weak ? "font-semibold text-red-400" : "text-gray-400"}>
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-white/10">
                      <div
                        className={`h-2 rounded-full ${
                          weak
                            ? "bg-gradient-to-r from-red-500 to-red-400"
                            : "bg-gradient-to-r from-orange-500 to-amber-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-200">
                  📚 Recomendação: revise{" "}
                  <span className="font-semibold">Observabilidade, Governança e Otimização de Custos</span>{" "}
                  antes do próximo simulado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CERTIFICAÇÕES ---------- */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Escolha sua próxima conquista
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
            Trilhas completas hoje — e as próximas certificações já no radar.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(CERTIFICATIONS).map((cert) => (
              <div
                key={cert.id}
                className="cm-card-hover rounded-2xl border border-gray-200 bg-white p-6"
              >
                <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  {cert.code}
                </span>
                <h3 className="mt-3 font-bold text-gray-900">{cert.name}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {cert.examQuestionCount} questões · {cert.examDurationMinutes} min ·
                  trilha semanal + labs + simulados + flashcards
                </p>
                <Link
                  href="/signup"
                  className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Começar a trilha →
                </Link>
              </div>
            ))}
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
              <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                EM BREVE
              </span>
              <h3 className="mt-3 font-bold text-gray-500">
                Developer Associate & SysOps
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Assinantes têm acesso a todas as novas certificações sem pagar nada a
                mais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Feita para aprovar, não para assistir
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Cada recurso existe por um motivo: transformar estudo em aprovação — com
            dados, não com achismo.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="cm-card-hover rounded-2xl border border-gray-200 bg-white p-6"
              >
                <span className="text-2xl" aria-hidden>
                  {f.icon}
                </span>
                <h3 className="mt-3 font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- COMO FUNCIONA ---------- */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">Como funciona</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 font-bold text-white shadow-lg shadow-orange-500/25">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Perguntas frequentes
          </h2>
          <div className="mt-10 space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-gray-200 bg-white p-5"
              >
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                  {item.q}
                  <span className="ml-4 text-orange-500 transition group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section className="relative overflow-hidden bg-gray-950 py-20 text-center text-white">
        <div className="cm-hero-glow absolute inset-0 rotate-180" />
        <div className="relative mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Sua certificação está a{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              uma trilha
            </span>{" "}
            de distância
          </h2>
          <p className="mt-4 text-gray-300">
            Comece hoje. Estude com método. Agende a prova quando os dados disserem
            que você está pronto.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-10 py-4 font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:scale-[1.02]"
          >
            Criar minha conta →
          </Link>
        </div>
      </section>
    </div>
  );
}
