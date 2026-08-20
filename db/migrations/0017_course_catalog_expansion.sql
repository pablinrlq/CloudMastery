-- Adds the AI Practitioner track and registers the expanded premium curriculum.

insert into public.certifications (
  id, name, code, exam_duration_minutes, exam_question_count, passing_score
) values
  ('aif', 'AWS Certified AI Practitioner', 'AIF-C01', 90, 65, 700)
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  exam_duration_minutes = excluded.exam_duration_minutes,
  exam_question_count = excluded.exam_question_count,
  passing_score = excluded.passing_score;

insert into public.modules (cert_id, slug, title, domain, order_index) values
  -- New CLF-C02 sections matching the 21-topic curriculum.
  ('ccp', '00-introducao-ao-clf-c02', 'Introdução ao AWS Certified Cloud Practitioner', 'Conceitos de Nuvem', 1),
  ('ccp', '00-guia-e-materiais', 'Guia do Curso e Materiais de Estudo', 'Conceitos de Nuvem', 2),
  ('ccp', '06-ec2-instance-storage', 'Armazenamento de Instâncias EC2', 'Tecnologia e Serviços', 6),
  ('ccp', '07-elb-auto-scaling', 'Elastic Load Balancing e Auto Scaling Groups', 'Tecnologia e Serviços', 7),
  ('ccp', '10-outros-servicos-computacao', 'Outros Serviços de Computação: ECS, Lambda, Batch e Lightsail', 'Tecnologia e Serviços', 10),
  ('ccp', '11-deployments-infraestrutura-em-escala', 'Implantações e Gerenciamento de Infraestrutura em Escala', 'Tecnologia e Serviços', 11),
  ('ccp', '12-infraestrutura-global-aws', 'Infraestrutura Global da AWS', 'Conceitos de Nuvem', 12),
  ('ccp', '13-integracoes-em-nuvem', 'Integrações em Nuvem', 'Tecnologia e Serviços', 13),
  ('ccp', '16-seguranca-e-conformidade', 'Segurança e Conformidade', 'Segurança e Conformidade', 16),
  ('ccp', '19-identidade-avancada', 'Identidade Avançada', 'Segurança e Conformidade', 19),
  ('ccp', '20-outros-servicos-aws', 'Outros Serviços AWS', 'Tecnologia e Serviços', 20),

  -- New SAA-C03 sections completing the 33-topic curriculum.
  ('saa', '00-guia-e-materiais-saa', 'Guia do Curso e Materiais do SAA-C03', 'Arquiteturas Seguras', 2),
  ('saa', '03-primeiros-passos-aws', 'Primeiros Passos com a AWS', 'Arquiteturas Seguras', 3),
  ('saa', '05-fundamentos-ec2', 'Fundamentos do Amazon EC2', 'Arquiteturas de Alta Performance', 5),
  ('saa', '07-armazenamento-instancias-ec2', 'Armazenamento de Instâncias EC2', 'Arquiteturas de Alta Performance', 7),
  ('saa', '08-alta-disponibilidade-elb-asg', 'Alta Disponibilidade e Escalabilidade: ELB e Auto Scaling', 'Arquiteturas Resilientes', 8),
  ('saa', '10-route-53', 'Amazon Route 53', 'Arquiteturas Resilientes', 10),
  ('saa', '12-introducao-amazon-s3', 'Introdução ao Amazon S3', 'Arquiteturas de Alta Performance', 12),
  ('saa', '14-seguranca-amazon-s3', 'Segurança do Amazon S3', 'Arquiteturas Seguras', 14),
  ('saa', '16-armazenamento-aws-extras', 'Serviços Adicionais de Armazenamento AWS', 'Arquiteturas de Alta Performance', 16),
  ('saa', '20-arquiteturas-serverless', 'Discussões de Arquitetura Serverless', 'Arquiteturas Resilientes', 20),
  ('saa', '21-bancos-de-dados-aws', 'Bancos de Dados na AWS', 'Arquiteturas de Alta Performance', 21),
  ('saa', '25-iam-avancado', 'Identity and Access Management Avançado', 'Arquiteturas Seguras', 25),
  ('saa', '30-outros-servicos-saa', 'Outros Serviços Importantes para o SAA-C03', 'Arquiteturas de Alta Performance', 30),
  ('saa', '31-whitepapers-e-arquiteturas', 'Whitepapers e Arquiteturas AWS', 'Arquiteturas com Custo Otimizado', 31),
  ('saa', '33-proximos-passos-saa', 'Conclusão e Próximos Passos do Solutions Architect Associate', 'Arquiteturas Resilientes', 33),

  -- AIF-C01 premium track.
  ('aif', '01-introducao-aif-c01', 'Introdução ao AWS Certified AI Practitioner', 'Fundamentos de IA e ML', 1),
  ('aif', '02-fundamentos-ia-ml', 'Fundamentos de Inteligência Artificial e Machine Learning', 'Fundamentos de IA e ML', 2),
  ('aif', '03-ciclo-de-vida-ml', 'Ciclo de Vida de Machine Learning', 'Fundamentos de IA e ML', 3),
  ('aif', '04-metricas-e-valor-de-negocio', 'Métricas, Qualidade e Valor de Negócio', 'Fundamentos de IA e ML', 4),
  ('aif', '05-fundamentos-ia-generativa', 'Fundamentos de IA Generativa', 'Fundamentos de IA Generativa', 5),
  ('aif', '06-foundation-models-tokens-inferencia', 'Foundation Models, Tokens e Inferência', 'Fundamentos de IA Generativa', 6),
  ('aif', '07-amazon-bedrock-nova-ecossistema', 'Amazon Bedrock, Amazon Nova e Ecossistema de IA AWS', 'Fundamentos de IA Generativa', 7),
  ('aif', '08-engenharia-de-prompts', 'Engenharia de Prompts', 'Aplicações de Modelos de Fundação', 8),
  ('aif', '09-rag-knowledge-bases-vetores', 'RAG, Knowledge Bases e Busca Vetorial', 'Aplicações de Modelos de Fundação', 9),
  ('aif', '10-agentes-e-automacao', 'Agentes, Ferramentas e Automação com IA', 'Aplicações de Modelos de Fundação', 10),
  ('aif', '11-customizacao-e-avaliacao-fm', 'Customização e Avaliação de Foundation Models', 'Aplicações de Modelos de Fundação', 11),
  ('aif', '12-ia-responsavel', 'Diretrizes para IA Responsável', 'Diretrizes para IA Responsável', 12),
  ('aif', '13-seguranca-e-privacidade-ia', 'Segurança e Privacidade em Soluções de IA', 'Segurança, Conformidade e Governança para Soluções de IA', 13),
  ('aif', '14-governanca-conformidade-ia', 'Governança e Conformidade para IA', 'Segurança, Conformidade e Governança para Soluções de IA', 14),
  ('aif', '15-arquiteturas-e-revisao-aif', 'Arquiteturas, Comparações e Revisão do AIF-C01', 'Aplicações de Modelos de Fundação', 15),
  ('aif', '16-lab-prompts-e-avaliacao', 'Lab: Prompts, Saída Estruturada e Avaliação', 'Aplicações de Modelos de Fundação', 16),
  ('aif', '17-lab-design-rag-seguro', 'Lab: Design de um RAG Seguro', 'Segurança, Conformidade e Governança para Soluções de IA', 17)
on conflict (cert_id, slug) do update set
  title = excluded.title,
  domain = excluded.domain,
  order_index = excluded.order_index;

-- Existing all-access subscribers receive the newly included certification.
update public.subscriptions
set cert_access = array_append(cert_access, 'aif')
where (status in ('trialing', 'active'))
  and not ('all' = any(cert_access))
  and not ('aif' = any(cert_access));
