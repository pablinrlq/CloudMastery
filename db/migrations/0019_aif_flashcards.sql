insert into public.flashcards (cert_id, domain, front, back) values
  ('aif', 'Fundamentos de IA e ML', 'Classificação vs. regressão', 'Classificação prevê categorias; regressão prevê valores numéricos contínuos.'),
  ('aif', 'Fundamentos de IA e ML', 'Treino, validação e teste', 'Treino ajusta parâmetros, validação orienta escolhas e teste estima generalização final em dados não usados nas decisões.'),
  ('aif', 'Fundamentos de IA e ML', 'Overfitting', 'Bom desempenho no treino e fraco em novos dados; o modelo aprendeu particularidades em vez de generalizar.'),
  ('aif', 'Fundamentos de IA e ML', 'Precision vs. recall', 'Precision mede a qualidade dos positivos previstos; recall mede quantos positivos reais foram encontrados.'),
  ('aif', 'Fundamentos de IA e ML', 'Data drift vs. concept drift', 'Data drift muda a distribuição de entrada; concept drift muda a relação entre entrada e resultado.'),

  ('aif', 'Fundamentos de IA Generativa', 'Foundation model', 'Modelo treinado em larga escala e adaptável a muitas tarefas por prompting, RAG ou customização.'),
  ('aif', 'Fundamentos de IA Generativa', 'Token', 'Unidade processada pelo modelo; contexto e cobrança normalmente são medidos em tokens, não em palavras.'),
  ('aif', 'Fundamentos de IA Generativa', 'Temperature', 'Parâmetro de amostragem: menor favorece consistência; maior aumenta diversidade e aleatoriedade.'),
  ('aif', 'Fundamentos de IA Generativa', 'Embedding', 'Representação vetorial de significado usada em busca semântica, recomendação, clustering e RAG.'),
  ('aif', 'Fundamentos de IA Generativa', 'Hallucination', 'Conteúdo plausível, mas incorreto ou não sustentado por evidência.'),

  ('aif', 'Aplicações de Modelos de Fundação', 'RAG', 'Recupera conhecimento externo relevante e o adiciona ao contexto do modelo para gerar resposta fundamentada.'),
  ('aif', 'Aplicações de Modelos de Fundação', 'RAG vs. fine-tuning', 'RAG injeta conhecimento atual/citável; fine-tuning adapta comportamento ou tarefa alterando pesos.'),
  ('aif', 'Aplicações de Modelos de Fundação', 'Prompt injection indireta', 'Instrução maliciosa escondida em conteúdo externo, como página ou documento recuperado.'),
  ('aif', 'Aplicações de Modelos de Fundação', 'Agente de IA', 'Sistema em que o modelo planeja e seleciona ferramentas; autorização e validação continuam fora do modelo.'),
  ('aif', 'Aplicações de Modelos de Fundação', 'Groundedness', 'Grau em que a resposta é sustentada pelo contexto ou pelas fontes fornecidas.'),

  ('aif', 'Diretrizes para IA Responsável', 'Fairness', 'Avaliação e mitigação de desempenho ou impacto injustamente diferente entre grupos relevantes.'),
  ('aif', 'Diretrizes para IA Responsável', 'Human-in-the-loop', 'Pessoa revisa ou aprova decisões, especialmente com alto impacto, baixa confiança ou caso inédito.'),
  ('aif', 'Diretrizes para IA Responsável', 'Transparência', 'Comunicar uso de IA, finalidade, limitações e fontes ou origem do conteúdo quando aplicável.'),
  ('aif', 'Diretrizes para IA Responsável', 'Accountability', 'Responsáveis, aprovações, métricas, evidências e resposta a incidentes claramente definidos.'),
  ('aif', 'Diretrizes para IA Responsável', 'Variável proxy', 'Feature que indiretamente representa um atributo sensível, mesmo quando ele foi removido.'),

  ('aif', 'Segurança, Conformidade e Governança para Soluções de IA', 'Least privilege para ferramentas', 'Cada ferramenta recebe somente ações e recursos necessários; argumentos são validados fora do modelo.'),
  ('aif', 'Segurança, Conformidade e Governança para Soluções de IA', 'Proteção de logs de IA', 'Minimizar, mascarar, criptografar, controlar acesso e definir retenção porque prompts e outputs podem conter dados sensíveis.'),
  ('aif', 'Segurança, Conformidade e Governança para Soluções de IA', 'Model card', 'Documento sobre finalidade, versão, dados, avaliação, limitações e uso recomendado de um modelo.'),
  ('aif', 'Segurança, Conformidade e Governança para Soluções de IA', 'Data lineage', 'Rastreabilidade da origem, transformações, versões e uso dos dados ao longo do ciclo de vida.'),
  ('aif', 'Segurança, Conformidade e Governança para Soluções de IA', 'Residência de dados', 'Requisito sobre locais/Regiões onde dados são armazenados e processados; exige validar o fluxo real do serviço.')
on conflict (cert_id, md5(front)) do update set
  domain = excluded.domain,
  back = excluded.back;
