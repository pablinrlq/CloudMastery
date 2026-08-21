import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Condições para utilização e assinatura da plataforma CloudMastery.",
};

const sections = [
  ["1. Plataforma", "A CloudMastery oferece trilhas, simulados, flashcards e materiais independentes de preparação para certificações AWS. A CloudMastery não é afiliada, patrocinada ou endossada pela Amazon Web Services e não garante aprovação em exames."],
  ["2. Conta e segurança", "Você deve fornecer informações corretas, confirmar seu e-mail e manter suas credenciais protegidas. A conta é pessoal e não pode ser compartilhada. Podemos suspender acessos diante de fraude, abuso, tentativa de exploração ou violação destes termos."],
  ["3. Assinaturas e cobrança", "Planos pagos são cobrados pela Stripe no preço e periodicidade exibidos antes da confirmação. A renovação é automática até o cancelamento. O cancelamento pode ser feito pelo portal de cobrança e impede novas renovações, sem retirar o acesso já pago até o fim do período vigente, salvo exigência legal diferente."],
  ["4. Arrependimento e reembolso", "Pedidos de cancelamento e reembolso serão tratados conforme a legislação brasileira aplicável, inclusive o direito de arrependimento quando cabível. Valores, período contratado e condições aparecem no checkout antes do pagamento."],
  ["5. Uso permitido", "Você recebe licença limitada, pessoal e não transferível para estudar. É proibido copiar, revender, publicar bancos de questões, automatizar extrações, contornar controles de acesso ou usar a plataforma para atividade ilícita."],
  ["6. Disponibilidade e fase alpha", "Durante a fase alpha, recursos podem mudar e indisponibilidades podem ocorrer. Empregamos esforços razoáveis para manter segurança e continuidade, mas não prometemos operação ininterrupta. Manutenções e correções poderão alterar funcionalidades."],
  ["7. Propriedade intelectual", "Marca, interface, textos, questões, explicações e demais materiais próprios são protegidos. AWS e nomes de seus serviços e certificações pertencem à Amazon Web Services, Inc."],
  ["8. Responsabilidade e suporte", "A preparação e a decisão de realizar um exame são de responsabilidade do usuário. Dúvidas, solicitações legais e problemas de cobrança podem ser enviados pelo canal de suporte disponível dentro da plataforma."],
  ["9. Alterações", "Podemos atualizar estes termos por razões legais, técnicas ou comerciais. Mudanças relevantes serão informadas na plataforma e passam a valer na data indicada."],
] as const;

export default function TermsPage() {
  return (
    <article className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Termos de Uso</h1>
        <p className="mt-4 text-sm text-slate-500">Última atualização: 21 de agosto de 2026.</p>
        <div className="mt-10 space-y-9 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-base leading-7 text-slate-700">Ao criar uma conta ou usar a CloudMastery, você concorda com as condições abaixo.</p>
          {sections.map(([title, content]) => (
            <section key={title}>
              <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{content}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
