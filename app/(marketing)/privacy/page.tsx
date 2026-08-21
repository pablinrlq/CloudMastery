import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a CloudMastery trata e protege os dados pessoais dos usuários.",
};

const sections = [
  ["1. Dados tratados", "Tratamos dados de cadastro e autenticação, progresso de estudos, respostas e desempenho em simulados, dados técnicos de segurança e, quando houver assinatura, identificadores e status de cobrança. Os dados completos do cartão são processados pela Stripe e não são armazenados pela CloudMastery."],
  ["2. Finalidades e bases legais", "Usamos esses dados para criar e proteger sua conta, entregar o conteúdo contratado, medir progresso, prevenir fraude, prestar suporte, cumprir obrigações legais e melhorar a plataforma. O tratamento se apoia na execução do contrato, no cumprimento de obrigações legais, em interesses legítimos de segurança e melhoria e, quando aplicável, no seu consentimento."],
  ["3. Fornecedores", "Usamos fornecedores essenciais de infraestrutura e processamento, incluindo Supabase para autenticação e banco de dados, Stripe para pagamentos e Vercel para hospedagem e telemetria. Eles recebem apenas os dados necessários às respectivas funções e operam sob seus próprios termos de proteção de dados."],
  ["4. Retenção e segurança", "Mantemos os dados pelo período necessário para fornecer a plataforma, cumprir obrigações legais e resolver disputas. Aplicamos criptografia em trânsito, controles de acesso, isolamento por usuário no banco, validação de e-mail, registros técnicos e outras medidas proporcionais ao risco."],
  ["5. Seus direitos", "Nos termos da LGPD, você pode solicitar confirmação do tratamento, acesso, correção, portabilidade quando cabível, anonimização, bloqueio ou eliminação, informação sobre compartilhamentos e revisão de decisões automatizadas. Solicitações podem ser feitas pelo canal de suporte disponível dentro da plataforma."],
  ["6. Cookies e métricas", "Usamos cookies estritamente necessários para sessão e segurança. Métricas de uso e desempenho podem ser coletadas para detectar erros e melhorar a experiência, com minimização de dados."],
  ["7. Menores e alterações", "A plataforma não é destinada a menores de 18 anos sem acompanhamento do responsável. Esta política pode ser atualizada para refletir mudanças legais ou do produto; alterações relevantes serão comunicadas na plataforma."],
] as const;

export default function PrivacyPage() {
  return (
    <article className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Política de Privacidade</h1>
        <p className="mt-4 text-sm text-slate-500">Última atualização: 21 de agosto de 2026.</p>
        <div className="mt-10 space-y-9 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-base leading-7 text-slate-700">A CloudMastery respeita sua privacidade e trata dados pessoais com transparência, segurança e finalidade definida.</p>
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
