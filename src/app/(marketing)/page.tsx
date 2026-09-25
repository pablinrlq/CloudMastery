import Link from "next/link";
import { CERTIFICATIONS } from "@/lib/learning/content";
import { HeroNetwork } from "@/components/hero-network";
import { Reveal } from "@/components/reveal";

const ecosystem = [
  { label: "Compute", items: ["EC2", "Lambda"] },
  { label: "Dados & armazenamento", items: ["S3", "RDS", "DynamoDB"] },
  { label: "Redes & segurança", items: ["VPC", "CloudFront", "Route 53", "IAM"] },
  { label: "IA & operações", items: ["Bedrock", "CloudWatch", "SQS"] },
];

const readinessLog = [
  ["✓", "trilha", "78% concluída · dentro do ritmo previsto"],
  ["✓", "simulados", "4/4 na faixa de aprovação (últimos 14 dias)"],
  ["!", "gap detectado", "otimização de custo · revisão sugerida"],
  ["→", "prontidão", "sim — agendamento seguro em 9 dias"],
] as const;

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
      <section className="relative select-none overflow-hidden bg-[#080b12] pb-20 pt-16 text-white sm:pt-24 lg:pb-28 lg:pt-28">
        <div className="cm-grid-bg absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-orange-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0">
          <HeroNetwork />
        </div>
        <div className="cm-container relative">
          <div className="mx-auto max-w-4xl text-center">
            <p className="cm-fade-up mx-auto inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 font-mono text-xs text-slate-400 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="text-orange-400">$</span> trilhas ativas: CLF-C02 · SAA-C03 · AIF-C01
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

          <div className="cm-fade-up-delay-2 mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f17]/95 shadow-[0_40px_100px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
            <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-[11px] text-slate-600">zsh — cloudmastery status</span>
            </div>
            <div className="p-5 font-mono text-[13px] leading-6 sm:p-6 sm:text-sm">
              <p className="text-slate-500">
                <span className="text-emerald-400">➜</span> ~ cloudmastery status --exam SAA-C03
              </p>
              <div className="mt-3 space-y-1.5">
                {readinessLog.map(([mark, label, detail]) => (
                  <p key={label}>
                    <span className={mark === "!" ? "text-amber-400" : mark === "→" ? "text-orange-400" : "text-emerald-400"}>{mark}</span>{" "}
                    <span className="text-slate-300">{label}:</span> <span className="text-slate-500">{detail}</span>
                  </p>
                ))}
              </div>
              <p className="mt-3 text-slate-600">
                <span className="text-emerald-400">➜</span> ~ <span className="animate-pulse">▌</span>
              </p>
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
            {[["80+", "módulos autorais"], ["160+", "questões comentadas"], ["11", "labs guiados"], ["3", "certificações completas"]].map(([value, label]) => (
              <div key={label} className="bg-[#0b0f17] px-4 py-5 text-center"><p className="text-2xl font-bold tracking-tight text-white">{value}</p><p className="mt-1 text-xs text-slate-600">{label}</p></div>
            ))}
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
          <Reveal className="max-w-2xl"><p className="cm-kicker">Método CloudMastery</p><h2 className="cm-title mt-4 sm:text-5xl">Tudo que você precisa. Nada que roube seu foco.</h2><p className="cm-copy mt-5 text-lg">Cada recurso existe para reduzir incerteza e acelerar decisões melhores durante o estudo e a prova.</p></Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {features.map(([number, title, text], index) => (
              <Reveal key={number} as="article" delay={index * 90} className="cm-card-hover group rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-8">
                <div className="flex items-start justify-between gap-6"><div><p className="text-xs font-bold tracking-[0.2em] text-orange-500">{number}</p><h3 className="mt-5 text-xl font-bold tracking-[-0.025em] text-slate-950">{title}</h3><p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-600">{text}</p></div><span className="mt-1 text-2xl text-slate-200 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-orange-400" aria-hidden>↗</span></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fa] py-24 sm:py-32">
        <div className="cm-container">
          <Reveal className="max-w-2xl"><p className="cm-kicker">Ecossistema coberto</p><h2 className="cm-title mt-4 sm:text-5xl">Os mesmos serviços que sustentam produção.</h2><p className="cm-copy mt-5 text-lg">A trilha não fica só na teoria: cada domínio da prova é ligado ao serviço real da AWS, organizado como você vai encontrar em uma arquitetura de verdade.</p></Reveal>
          <Reveal delay={120} className="relative mt-14 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#0b0f17] shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]">
            <div className="cm-grid-bg absolute inset-0 opacity-40" />
            <div className="relative grid divide-y divide-white/[0.08] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {ecosystem.map((group) => (
                <div key={group.label} className="p-7 sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]" />
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 font-mono text-xs text-slate-300">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white py-24 sm:py-32">
        <div className="cm-container">
          <Reveal className="text-center"><p className="cm-kicker">Trilhas disponíveis</p><h2 className="cm-title mt-4 sm:text-5xl">Escolha sua próxima credencial.</h2></Reveal>
          <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-3">
            {Object.values(CERTIFICATIONS).map((cert, index) => (
              <Reveal key={cert.id} as="article" delay={index * 100} className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.3)] sm:p-10">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-orange-50" />
                <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-orange-600">{cert.code}</p><h3 className="relative mt-5 max-w-sm text-2xl font-bold tracking-[-0.035em] text-slate-950">{cert.name}</h3>
                <div className="relative mt-8 grid grid-cols-3 gap-3 border-y border-slate-100 py-5 text-sm"><div><p className="font-bold">{cert.examQuestionCount}</p><p className="mt-1 text-xs text-slate-400">questões</p></div><div><p className="font-bold">{cert.examDurationMinutes} min</p><p className="mt-1 text-xs text-slate-400">de prova</p></div><div><p className="font-bold">{cert.suggestedWeeks} sem.</p><p className="mt-1 text-xs text-slate-400">de trilha</p></div></div>
                <Link href="/signup" className="cm-button-secondary mt-7 w-full justify-between">Explorar esta trilha <span aria-hidden>→</span></Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="cm-container grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28"><p className="cm-kicker">Uma jornada clara</p><h2 className="cm-title mt-4 sm:text-5xl">Do primeiro módulo à data da prova.</h2><p className="cm-copy mt-5 text-lg">Sem improviso, sem planilha paralela e sem a sensação de estar estudando a coisa errada.</p></Reveal>
          <ol className="space-y-3">{steps.map(([title, text], index) => <Reveal key={title} as="li" delay={index * 100} className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-orange-200 hover:shadow-[0_16px_40px_-28px_rgba(15,23,42,0.32)] sm:p-7"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white transition group-hover:bg-orange-500">0{index + 1}</span><div><h3 className="font-bold tracking-tight">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p></div></Reveal>)}</ol>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-[#f7f8fa] py-24 sm:py-32">
        <div className="cm-container grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal><p className="cm-kicker">Perguntas frequentes</p><h2 className="cm-title mt-4">Tudo claro antes de começar.</h2></Reveal>
          <div className="space-y-3">{faq.map(([question, answer], index) => <Reveal key={question} delay={index * 70} className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"><details className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-slate-900 focus-visible:outline-none">{question}<span className="text-xl font-light text-slate-400 transition-transform duration-300 group-open:rotate-45 group-open:text-orange-500">＋</span></summary><p className="mt-4 max-w-2xl pr-8 text-sm leading-7 text-slate-600">{answer}</p></details></Reveal>)}</div>
        </div>
      </section>

      <section className="bg-[#080b12] py-24 text-white sm:py-28"><div className="cm-container"><Reveal className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] px-6 py-16 text-center sm:px-12"><div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-orange-500/15 blur-[90px]" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Sua próxima conquista</p><h2 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Pare de estudar no escuro.</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-400">Comece com direção, acompanhe sua evolução e chegue à prova sabendo por que está pronto.</p><Link href="/signup" className="cm-button-primary mt-9 min-w-52 px-7">Criar minha conta <span className="ml-2" aria-hidden>→</span></Link></div></Reveal></div></section>
    </div>
  );
}
