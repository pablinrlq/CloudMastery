import Link from "next/link";
import { CERTIFICATIONS } from "@/lib/content";
import { FeatureIcon, type FeatureIconName } from "@/components/feature-icon";

const features: Array<{
  icon: FeatureIconName;
  title: string;
  text: string;
}> = [
  {
    icon: "route",
    title: "Trilha que elimina a dúvida",
    text: "Uma sequência clara de teoria, prática e revisão. Você sempre sabe qual é o próximo passo.",
  },
  {
    icon: "timer",
    title: "Simulados com pressão real",
    text: "Tempo, quantidade de questões e cenários alinhados ao formato atual de cada exame.",
  },
  {
    icon: "insights",
    title: "Diagnóstico, não achismo",
    text: "Desempenho por domínio, tempo por questão e recomendações objetivas para sua revisão.",
  },
  {
    icon: "practice",
    title: "Arquitetura aplicada",
    text: "Cenários técnicos que conectam o serviço da AWS à decisão que um arquiteto precisa tomar.",
  },
];

const platformNumbers = [
  ["89", "módulos publicados"],
  ["162", "questões explicadas"],
  ["83", "flashcards de revisão"],
  ["3", "certificações completas"],
];

const faq = [
  [
    "Posso criar a conta sem pagar?",
    "Sim. O cadastro é gratuito. A assinatura libera as trilhas completas, simulados, flashcards e diagnósticos.",
  ],
  [
    "Quanto tempo preciso estudar para o Cloud Practitioner?",
    "Com uma hora por dia, a preparação costuma levar de cinco a sete semanas. A trilha organiza o ritmo e mostra sua evolução.",
  ],
  [
    "A trilha de AI Practitioner está incluída?",
    "Sim. A trilha AIF-C01 cobre fundamentos de IA e ML, IA generativa, Amazon Bedrock, RAG, agentes, IA responsável, segurança e governança.",
  ],
  [
    "Os simulados seguem o formato da prova?",
    "Sim. Eles reproduzem quantidade de questões, duração e estilo dos cenários, além de detalhar tempo e desempenho por domínio.",
  ],
  [
    "O conteúdo é em português?",
    "Sim. Todo o conteúdo é escrito em português do Brasil para CLF-C02, SAA-C03 e AIF-C01.",
  ],
  [
    "Existe fidelidade?",
    "Não. Você pode gerenciar ou cancelar sua assinatura pelo portal seguro de pagamento.",
  ],
];

const scoreRows = [
  ["Conceitos de nuvem", "84%", "84%"],
  ["Segurança", "76%", "76%"],
  ["Tecnologia", "68%", "68%"],
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-white text-slate-950">
      <section className="relative isolate overflow-hidden bg-[#080c13] pb-20 pt-14 text-white sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24">
        <div className="cm-grid-bg absolute inset-0 -z-20 opacity-70" />
        <div className="cm-hero-glow absolute inset-0 -z-10" />
        <div className="pointer-events-none absolute -right-56 top-10 -z-10 h-[560px] w-[560px] rounded-full bg-indigo-500/10 blur-[130px]" />

        <div className="cm-container grid items-center gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(480px,0.98fr)] lg:gap-12">
          <div className="max-w-3xl">
            <p className="cm-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_14px_#fb923c]" />
              CLF-C02, SAA-C03 e AIF-C01 em português
            </p>
            <h1 className="cm-fade-up-delay-1 mt-7 text-balance text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-[4.45rem]">
              Passe na sua certificação AWS
              {" "}
              <span className="block bg-gradient-to-r from-orange-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                sem perder tempo.
              </span>
            </h1>
            <p className="cm-fade-up-delay-2 mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-300 sm:text-xl">
              Trilhas guiadas, simulados no formato oficial e diagnósticos que mostram
              exatamente quando você está pronto para agendar a prova.
            </p>
            <div className="cm-fade-up-delay-2 mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="cm-button-primary min-w-48 px-7">
                Criar conta grátis
                <span className="ml-2" aria-hidden>→</span>
              </Link>
              <Link
                href="#planos"
                className="inline-flex min-h-12 min-w-48 items-center justify-center rounded-xl border border-white/15 bg-white/[0.055] px-7 text-sm font-bold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/15 active:translate-y-0"
              >
                Ver planos e preços
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Cadastro gratuito. Assine apenas quando quiser liberar a experiência completa.
            </p>
          </div>

          <div className="cm-fade-up-delay-2 relative mx-auto w-full max-w-[590px] lg:mx-0">
            <div className="pointer-events-none absolute -inset-10 rounded-full bg-orange-500/10 blur-[80px]" />
            <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#111822]/90 p-4 shadow-[0_40px_100px_-35px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-5">
              <div className="flex items-center justify-between border-b border-white/10 px-1 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Diagnóstico de prontidão</p>
                  <p className="mt-1.5 text-sm font-bold text-white">Cloud Practitioner · CLF-C02</p>
                </div>
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-bold text-amber-300">EM EVOLUÇÃO</span>
              </div>

              <div className="grid gap-4 py-5 sm:grid-cols-[0.7fr_1.3fr]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                  <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[conic-gradient(#fb923c_0_74%,rgba(255,255,255,0.08)_74%_100%)]">
                    <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-[#111822]">
                      <strong className="text-3xl tracking-[-0.05em] text-white">74%</strong>
                      <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">prontidão</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-slate-400">Falta consolidar um domínio para chegar à faixa segura.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Desempenho por domínio</span>
                    <span className="text-slate-500">últimas tentativas</span>
                  </div>
                  <div className="mt-5 space-y-5">
                    {scoreRows.map(([label, value, width]) => (
                      <div key={label}>
                        <div className="mb-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">{label}</span>
                          <span className="font-bold text-white">{value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="cm-metric-fill h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300"
                            style={{ width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-orange-400/15 bg-orange-400/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300">Próxima melhor ação</p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">Revisar tecnologia e serviços AWS</p>
                </div>
                <span className="text-xs font-bold text-orange-300">12 min →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Conteúdo disponível" className="border-b border-slate-200 bg-white">
        <div className="cm-container grid grid-cols-2 divide-x divide-slate-200 lg:grid-cols-4">
          {platformNumbers.map(([value, label], index) => (
            <div key={label} className={`px-3 py-7 text-center sm:py-9 ${index === 2 ? "border-t border-slate-200 lg:border-t-0" : ""} ${index === 3 ? "border-t border-slate-200 lg:border-t-0" : ""}`}>
              <p className="text-2xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-3xl">{value}</p>
              <p className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="metodo" className="scroll-mt-24 bg-[#f5f7fa] py-20 sm:py-28">
        <div className="cm-container">
          <div className="max-w-3xl">
            <p className="cm-kicker">Feita para aprovar</p>
            <h2 className="cm-title mt-4 sm:text-5xl">Tudo que entra na tela precisa mover você para a prova.</h2>
            <p className="cm-copy mt-5 max-w-2xl text-lg">Sem biblioteca infinita, sem conteúdo solto e sem emoji tentando explicar recurso sério.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="cm-card-hover group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_14px_45px_-34px_rgba(15,23,42,0.35)] sm:p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-orange-300 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-[0_10px_28px_rgba(249,115,22,0.25)]">
                  <FeatureIcon name={feature.icon} />
                </span>
                <h3 className="mt-6 text-lg font-bold tracking-[-0.025em] text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="trilhas" className="scroll-mt-24 py-20 sm:py-28">
        <div className="cm-container">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="cm-kicker">Trilhas disponíveis</p>
              <h2 className="cm-title mt-4 sm:text-5xl">Uma plataforma. Três próximos níveis.</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-500">Comece pela base, aprofunde arquitetura ou domine os fundamentos de IA generativa na AWS.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {Object.values(CERTIFICATIONS).map((cert, index) => (
              <article key={cert.id} className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_18px_55px_-38px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_26px_65px_-38px_rgba(15,23,42,0.4)] sm:p-8">
                <span className="absolute right-6 top-6 text-5xl font-black tracking-[-0.08em] text-slate-100 transition-colors group-hover:text-orange-50">0{index + 1}</span>
                <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-orange-600">{cert.code}</p>
                <h3 className="relative mt-5 min-h-16 max-w-xs text-xl font-bold tracking-[-0.035em] text-slate-950">{cert.name}</h3>
                <dl className="relative mt-7 grid grid-cols-3 gap-3 border-y border-slate-100 py-5 text-sm">
                  <div><dt className="text-xs text-slate-400">Questões</dt><dd className="mt-1 font-bold">{cert.examQuestionCount}</dd></div>
                  <div><dt className="text-xs text-slate-400">Duração</dt><dd className="mt-1 font-bold">{cert.examDurationMinutes} min</dd></div>
                  <div><dt className="text-xs text-slate-400">Trilha</dt><dd className="mt-1 font-bold">{cert.suggestedWeeks} sem.</dd></div>
                </dl>
                <Link href="/signup" className="cm-button-secondary relative mt-6 w-full justify-between">
                  Explorar trilha <span aria-hidden>→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="scroll-mt-24 border-y border-slate-200 bg-[#f5f7fa] py-20 sm:py-28">
        <div className="cm-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="cm-kicker">Preço sem surpresa</p>
            <h2 className="cm-title mt-4 sm:text-5xl">Escolha o ritmo. O acesso é completo.</h2>
            <p className="cm-copy mx-auto mt-5 max-w-2xl text-lg">As três certificações, simulados, flashcards e toda nova atualização em qualquer plano.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] sm:p-9">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">Mensal</p><h3 className="mt-2 text-2xl font-bold tracking-[-0.035em]">Flexibilidade total</h3></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-slate-600">CANCELE QUANDO QUISER</span></div>
              <p className="mt-8 flex items-end gap-2 border-b border-slate-100 pb-7"><span className="pb-2 text-sm font-bold text-slate-400">R$</span><strong className="text-6xl tracking-[-0.065em]">39</strong><span className="pb-2 text-sm text-slate-400">/mês</span></p>
              <p className="mt-6 text-sm leading-6 text-slate-600">Ideal para uma preparação focada ou para conhecer o método no seu ritmo.</p>
              <Link href="/signup" className="cm-button-secondary mt-7 w-full">Criar conta grátis</Link>
            </article>

            <article className="relative overflow-hidden rounded-[1.75rem] border border-orange-400 bg-[#101722] p-7 text-white shadow-[0_34px_90px_-44px_rgba(249,115,22,0.48)] sm:p-9">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
              <div className="relative flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-orange-300">Anual</p><h3 className="mt-2 text-2xl font-bold tracking-[-0.035em]">Ritmo para ir além</h3></div><span className="rounded-full bg-orange-400 px-3 py-1 text-[10px] font-black tracking-[0.12em] text-slate-950">2 MESES GRÁTIS</span></div>
              <p className="relative mt-8 flex items-end gap-2 border-b border-white/10 pb-7"><span className="pb-2 text-sm font-bold text-slate-500">R$</span><strong className="text-6xl tracking-[-0.065em]">390</strong><span className="pb-2 text-sm text-slate-500">/ano</span></p>
              <p className="relative mt-6 text-sm leading-6 text-slate-400">Equivale a R$ 32,50 por mês para conquistar duas ou mais certificações.</p>
              <Link href="/signup" className="cm-button-primary relative mt-7 w-full">Começar pelo plano anual <span className="ml-2" aria-hidden>→</span></Link>
            </article>
          </div>
          <p className="mt-7 text-center text-xs text-slate-500">Pagamento processado pelo Stripe · Sem fidelidade · Acesso liberado após a confirmação</p>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="cm-container grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="cm-kicker">Confiança com transparência</p>
            <h2 className="cm-title mt-4 sm:text-5xl">Números reais antes de promessas.</h2>
            <p className="cm-copy mt-5 text-lg">Ainda não publicamos taxa de aprovação ou avaliações sem uma base auditável. O que mostramos é exatamente o que já está disponível para estudar.</p>
            <Link href="/signup" className="cm-button-primary mt-8">Conhecer a plataforma</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {platformNumbers.map(([value, label]) => (
              <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-7">
                <p className="text-4xl font-extrabold tracking-[-0.055em] text-slate-950">{value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{label}</p>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="cm-metric-fill h-full w-[82%] rounded-full bg-gradient-to-r from-orange-500 to-amber-300" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#f5f7fa] py-20 sm:py-28">
        <div className="cm-container grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div><p className="cm-kicker">Perguntas frequentes</p><h2 className="cm-title mt-4">Tudo claro antes de começar.</h2></div>
          <div className="space-y-3">
            {faq.map(([question, answer]) => (
              <details key={question} className="group rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_30px_-26px_rgba(15,23,42,0.3)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30">{question}<span className="text-xl font-light text-slate-400 transition-transform duration-300 group-open:rotate-45 group-open:text-orange-500">＋</span></summary>
                <p className="mt-4 max-w-2xl pr-8 text-sm leading-7 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#080c13] py-20 text-white sm:py-24">
        <div className="cm-container">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] px-6 py-14 text-center sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[480px] -translate-x-1/2 rounded-full bg-orange-500/18 blur-[95px]" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Sua próxima conquista começa aqui</p>
              <h2 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">Pare de estudar no escuro.</h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-400">Crie sua conta, escolha uma trilha e transforme cada hora de estudo em progresso mensurável.</p>
              <Link href="/signup" className="cm-button-primary mt-9 min-w-52 px-7">Criar conta grátis <span className="ml-2" aria-hidden>→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
