import Link from "next/link";
import { CERTIFICATIONS } from "@/lib/content";

const features = [
  ["01", "Trilha que elimina a dúvida", "Uma sequência semanal clara, com teoria objetiva, prática e revisão. Você sempre sabe o que estudar a seguir."],
  ["02", "Simulados com pressão real", "Formato e duração alinhados ao exame, dicas com penalidade e correção somente ao final da tentativa."],
  ["03", "Diagnóstico, não achismo", "Veja desempenho por domínio, tempo por questão e os pontos exatos que precisam de atenção antes da prova."],
  ["04", "Prática dentro da AWS", "Labs guiados com custo estimado e limpeza segura para transformar conceitos em experiência concreta."],
];

const steps = [
  ["Mapeie", "Escolha a certificação e veja o plano completo até a prova."],
  ["Domine", "Avance pela trilha com teoria direta, labs e flashcards."],
  ["Valide", "Faça simulados e descubra onde seu raciocínio ainda falha."],
  ["Conquiste", "Agende quando seus dados mostrarem consistência real."],
];

const faq = [
  ["Quanto tempo preciso estudar para o Cloud Practitioner?", "Com uma hora por dia, a preparação costuma levar de cinco a sete semanas. A trilha organiza esse ritmo e mostra quando sua consistência chegou à faixa segura."],
  ["E para o Solutions Architect Associate?", "Para quem já teve algum contato com AWS, a preparação costuma levar de nove a doze semanas. A trilha inclui teoria, arquitetura aplicada, labs e reta final."],
  ["A trilha de AI Practitioner está incluída?", "Sim. A trilha AIF-C01 cobre IA, machine learning, IA generativa, Amazon Bedrock, modelos de fundação, RAG, agentes, IA responsável, segurança e governança."],
  ["Os simulados seguem o formato da prova?", "Sim. Eles reproduzem quantidade de questões, duração e cenários, mas acrescentam tempo por questão, domínio mais fraco e recomendações de revisão."],
  ["O conteúdo é em português?", "Sim. Todo o conteúdo é escrito em português do Brasil para as versões atuais dos exames CLF-C02, SAA-C03 e AIF-C01."],
  ["Existe fidelidade?", "Não. Você pode gerenciar ou cancelar sua assinatura diretamente pelo portal seguro de pagamento."],
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-white text-slate-950">
      <section className="relative bg-[#080b12] pb-24 pt-16 text-white sm:pt-24 lg:pb-32 lg:pt-28">
        <div className="cm-grid-bg absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-orange-500/15 blur-[120px]" />
        <div className="cm-container relative">
          <div className="mx-auto max-w-4xl text-center">
            <p className="cm-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_14px_#fb923c]" />
              CLF-C02, SAA-C03 e AIF-C01 · conteúdo 100% em português
            </p>
            <h1 className="cm-fade-up mt-8 text-balance text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[5.2rem]">
              Sua aprovação começa com
              <span className="block bg-gradient-to-r from-orange-300 via-orange-400 to-amber-300 bg-clip-text text-transparent">clareza sobre o próximo passo.</span>
            </h1>
            <p className="cm-fade-up-delay-1 mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-400 sm:text-xl">
              Estude com uma trilha precisa, pratique em cenários reais e use seus próprios dados para decidir quando agendar a prova.
            </p>
            <div className="cm-fade-up-delay-2 mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="cm-button-primary min-w-48 px-7">Começar minha trilha <span className="ml-2" aria-hidden>→</span></Link>
              <Link href="#plataforma" className="inline-flex min-h-12 min-w-48 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-7 text-sm font-bold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/10">Conhecer a plataforma</Link>
            </div>
          </div>

          <div className="cm-fade-up-delay-2 mx-auto mt-16 max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111722]/90 p-2 shadow-[0_40px_100px_-35px_rgba(0,0,0,0.8)] backdrop-blur sm:p-3">
            <div className="overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-[#0c111b]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div><p className="text-xs font-semibold text-slate-500">DIAGNÓSTICO DE PRONTIDÃO</p><p className="mt-1 text-sm font-bold text-white">Solutions Architect Associate</p></div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">Evoluindo</span>
              </div>
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.72fr_1.28fr]">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-6">
                  <div className="flex items-end gap-2"><p className="text-6xl font-bold tracking-[-0.06em] text-white">82</p><p className="pb-2 text-xl font-semibold text-slate-500">%</p></div>
                  <p className="mt-2 text-sm text-emerald-300">Acima da faixa de aprovação</p>
                  <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[82%] rounded-full bg-gradient-to-r from-orange-500 to-amber-300" /></div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">53 acertos · 12 minutos de sobra · 1 dica utilizada</p>
                </div>
                <div className="space-y-5">
                  {[["Arquiteturas seguras", 90], ["Arquiteturas resilientes", 84], ["Alta performance", 81], ["Custo otimizado", 64]].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-xs font-medium"><span className="text-slate-300">{label}</span><span className={(value as number) < 72 ? "text-amber-300" : "text-slate-500"}>{value}%</span></div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${(value as number) < 72 ? "bg-amber-400" : "bg-slate-500"}`} style={{ width: `${value}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
            {[["80+", "módulos autorais"], ["160+", "questões comentadas"], ["11", "labs guiados"], ["3", "certificações completas"]].map(([value, label]) => (
              <div key={label} className="bg-[#0b0f17] px-4 py-5 text-center"><p className="text-2xl font-bold tracking-tight text-white">{value}</p><p className="mt-1 text-xs text-slate-600">{label}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="plataforma" className="py-24 sm:py-32">
        <div className="cm-container">
          <div className="max-w-2xl"><p className="cm-kicker">Método CloudMastery</p><h2 className="cm-title mt-4 sm:text-5xl">Tudo que você precisa. Nada que roube seu foco.</h2><p className="cm-copy mt-5 text-lg">Cada recurso existe para reduzir incerteza e acelerar decisões melhores durante o estudo e a prova.</p></div>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {features.map(([number, title, text]) => (
              <article key={number} className="cm-card-hover group rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-8">
                <div className="flex items-start justify-between gap-6"><div><p className="text-xs font-bold tracking-[0.2em] text-orange-500">{number}</p><h3 className="mt-5 text-xl font-bold tracking-[-0.025em] text-slate-950">{title}</h3><p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-600">{text}</p></div><span className="mt-1 text-2xl text-slate-200 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-orange-400" aria-hidden>↗</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-[#f7f8fa] py-24 sm:py-32">
        <div className="cm-container">
          <div className="text-center"><p className="cm-kicker">Trilhas disponíveis</p><h2 className="cm-title mt-4 sm:text-5xl">Escolha sua próxima credencial.</h2></div>
          <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-3">
            {Object.values(CERTIFICATIONS).map((cert) => (
              <article key={cert.id} className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.3)] sm:p-10">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-orange-50" />
                <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-orange-600">{cert.code}</p><h3 className="relative mt-5 max-w-sm text-2xl font-bold tracking-[-0.035em] text-slate-950">{cert.name}</h3>
                <div className="relative mt-8 grid grid-cols-3 gap-3 border-y border-slate-100 py-5 text-sm"><div><p className="font-bold">{cert.examQuestionCount}</p><p className="mt-1 text-xs text-slate-400">questões</p></div><div><p className="font-bold">{cert.examDurationMinutes} min</p><p className="mt-1 text-xs text-slate-400">de prova</p></div><div><p className="font-bold">{cert.suggestedWeeks} sem.</p><p className="mt-1 text-xs text-slate-400">de trilha</p></div></div>
                <Link href="/signup" className="cm-button-secondary mt-7 w-full justify-between">Explorar esta trilha <span aria-hidden>→</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="cm-container grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28"><p className="cm-kicker">Uma jornada clara</p><h2 className="cm-title mt-4 sm:text-5xl">Do primeiro módulo à data da prova.</h2><p className="cm-copy mt-5 text-lg">Sem improviso, sem planilha paralela e sem a sensação de estar estudando a coisa errada.</p></div>
          <ol className="space-y-3">{steps.map(([title, text], index) => <li key={title} className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-orange-200 hover:shadow-[0_16px_40px_-28px_rgba(15,23,42,0.32)] sm:p-7"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white transition group-hover:bg-orange-500">0{index + 1}</span><div><h3 className="font-bold tracking-tight">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p></div></li>)}</ol>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-[#f7f8fa] py-24 sm:py-32">
        <div className="cm-container grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div><p className="cm-kicker">Perguntas frequentes</p><h2 className="cm-title mt-4">Tudo claro antes de começar.</h2></div>
          <div className="space-y-3">{faq.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-slate-900 focus-visible:outline-none">{question}<span className="text-xl font-light text-slate-400 transition-transform duration-300 group-open:rotate-45 group-open:text-orange-500">＋</span></summary><p className="mt-4 max-w-2xl pr-8 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="bg-[#080b12] py-24 text-white sm:py-28"><div className="cm-container"><div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] px-6 py-16 text-center sm:px-12"><div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-orange-500/15 blur-[90px]" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Sua próxima conquista</p><h2 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Pare de estudar no escuro.</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-400">Comece com direção, acompanhe sua evolução e chegue à prova sabendo por que está pronto.</p><Link href="/signup" className="cm-button-primary mt-9 min-w-52 px-7">Criar minha conta <span className="ml-2" aria-hidden>→</span></Link></div></div></div></section>
    </div>
  );
}
