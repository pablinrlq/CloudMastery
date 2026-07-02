import Link from "next/link";
import { CERTIFICATIONS } from "@/lib/content";

const steps = [
  {
    title: "Estude pela trilha",
    text: "Módulos objetivos organizados pelos domínios oficiais do exame, com sinais de prova e armadilhas comuns em cada tópico.",
  },
  {
    title: "Treine com simulados reais",
    text: "Cronômetro e quantidade de questões no formato oficial. Correção só no final, como na prova — sem decorar gabarito.",
  },
  {
    title: "Descubra onde melhorar",
    text: "Resultado aberto por domínio mostra exatamente seus pontos fracos, com explicação comentada de cada questão errada.",
  },
  {
    title: "Saiba quando agendar",
    text: "O diagnóstico de prontidão cruza sua trilha e seus últimos simulados e avisa quando você está pronto para marcar a prova.",
  },
];

const faq = [
  {
    q: "Quanto tempo preciso estudar para o Cloud Practitioner?",
    a: "Com 1h por dia, a maioria das pessoas se prepara em 4 a 6 semanas. A trilha indica a duração estimada de cada módulo e o diagnóstico avisa quando sua média de simulados atinge a faixa segura.",
  },
  {
    q: "E para o Solutions Architect Associate?",
    a: "Partindo de alguma experiência com AWS, tipicamente 8 a 12 semanas com 1h por dia. O SAA exige raciocínio de arquitetura, então os simulados por domínio aceleram bastante.",
  },
  {
    q: "Os simulados são iguais à prova?",
    a: "Seguem o mesmo formato: mesma quantidade de questões, mesmo tempo, questões de cenário e correção apenas no final, com nota por domínio como no relatório oficial da AWS.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. A assinatura é sem fidelidade e você gerencia tudo (troca de plano, cancelamento) direto no portal de pagamento.",
  },
];

export default function LandingPage() {
  return (
    <div>
      <header className="border-b border-gray-100">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-semibold">Certificações AWS</span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Planos
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
            >
              Começar
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Passe na sua certificação AWS
          <span className="block text-orange-500">com um plano, não com sorte</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          Trilhas de estudo em português, simulados no formato oficial da prova e um
          diagnóstico que diz exatamente onde melhorar — e quando você está pronto
          para agendar o exame.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600"
          >
            Começar agora
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-gray-300 px-6 py-3 font-medium hover:border-orange-400"
          >
            Ver planos
          </Link>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-4xl gap-6 px-4 py-12 sm:grid-cols-2">
          {Object.values(CERTIFICATIONS).map((cert) => (
            <div key={cert.id} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-xs font-medium text-orange-600">{cert.code}</p>
              <h2 className="mt-1 font-semibold">{cert.name}</h2>
              <p className="mt-2 text-sm text-gray-600">
                {cert.examQuestionCount} questões · {cert.examDurationMinutes} minutos ·
                trilha completa + simulados + flashcards
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold">Como funciona</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold">Perguntas frequentes</h2>
          <div className="mt-8 space-y-4">
            {faq.map((item) => (
              <details key={item.q} className="rounded-xl bg-white p-5 shadow-sm">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-2 text-sm text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-block rounded-md bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600"
            >
              Criar conta e começar
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        AWS e os nomes das certificações são marcas da Amazon Web Services, Inc.
        Este site é um material de estudo independente, sem afiliação com a AWS.
      </footer>
    </div>
  );
}
