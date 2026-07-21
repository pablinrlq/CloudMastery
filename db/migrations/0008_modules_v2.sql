-- Registro completo dos módulos v2 (15 CCP + 31 SAA), espelhando /content.
-- Upsert por (cert_id, slug): reordena os existentes e insere os novos.

insert into modules (cert_id, slug, title, domain, order_index) values
  -- CCP (CLF-C02) — 15 módulos em 4 semanas
  ('ccp', '01-fundamentos-da-nuvem', 'Fundamentos da Computação em Nuvem', 'Conceitos de Nuvem', 1),
  ('ccp', 'lab-conta-segura', 'Lab: Sua Conta AWS Segura do Dia Zero', 'Segurança e Conformidade', 2),
  ('ccp', '02-seguranca-e-iam', 'Segurança, Responsabilidade Compartilhada e IAM', 'Segurança e Conformidade', 3),
  ('ccp', '03-computacao', 'Computação: EC2, Lambda e Containers', 'Tecnologia e Serviços', 4),
  ('ccp', '04-armazenamento', 'Armazenamento: S3, EBS e EFS', 'Tecnologia e Serviços', 5),
  ('ccp', 'lab-site-estatico-s3', 'Lab: Site Estático no S3', 'Tecnologia e Serviços', 6),
  ('ccp', '05-redes-e-cdn', 'Redes: VPC, Route 53 e CloudFront', 'Tecnologia e Serviços', 7),
  ('ccp', '06-bancos-de-dados', 'Bancos de Dados na AWS', 'Tecnologia e Serviços', 8),
  ('ccp', '07-monitoramento-e-governanca', 'Monitoramento, Auditoria e Governança', 'Segurança e Conformidade', 9),
  ('ccp', '08-precificacao-e-suporte', 'Precificação, Cobrança e Planos de Suporte', 'Cobrança, Preços e Suporte', 10),
  ('ccp', '09-frameworks-e-migracao', 'Well-Architected, CAF e Estratégias de Migração', 'Conceitos de Nuvem', 11),
  ('ccp', '10-ia-ml-e-servicos-extras', 'IA/ML e Serviços Complementares', 'Tecnologia e Serviços', 12),
  ('ccp', 'armadilhas-e-comparacoes-ccp', 'Armadilhas e Comparações do CLF-C02', 'Conceitos de Nuvem', 13),
  ('ccp', 'glossario-ccp', 'Glossário CLF-C02', 'Conceitos de Nuvem', 14),
  ('ccp', 'reta-final-ccp', 'Reta Final: Plano de 7 Dias e Dia da Prova', 'Conceitos de Nuvem', 15),

  -- SAA (SAA-C03) — 31 módulos em 9 semanas
  ('saa', '01-estrategia-de-prova', 'Como Pensar na Prova SAA-C03', 'Arquiteturas Seguras', 1),
  ('saa', '02-iam-e-seguranca', 'IAM Avançado e Segurança de Arquiteturas', 'Arquiteturas Seguras', 2),
  ('saa', 'lab-iam-menor-privilegio', 'Lab: IAM na Prática — Menor Privilégio', 'Arquiteturas Seguras', 3),
  ('saa', '03-computacao-e-escalabilidade', 'EC2, Auto Scaling e Load Balancing', 'Arquiteturas Resilientes', 4),
  ('saa', 'lab-alta-disponibilidade', 'Lab: ALB + Auto Scaling Multi-AZ', 'Arquiteturas Resilientes', 5),
  ('saa', '04-s3-avancado', 'S3 Avançado', 'Arquiteturas de Alta Performance', 6),
  ('saa', 'lab-s3-versionamento-lifecycle', 'Lab: S3 — Versionamento, Lifecycle e Site Estático', 'Arquiteturas com Custo Otimizado', 7),
  ('saa', '05-vpc-e-redes', 'VPC e Redes na Prática', 'Arquiteturas Seguras', 8),
  ('saa', 'lab-vpc-do-zero', 'Lab: VPC do Zero — Pública, Privada e NAT', 'Arquiteturas Seguras', 9),
  ('saa', 'redes-avancadas-hibridas', 'Redes Avançadas e Conectividade Híbrida', 'Arquiteturas Seguras', 10),
  ('saa', '06-bancos-de-dados', 'Bancos de Dados para Arquitetos', 'Arquiteturas de Alta Performance', 11),
  ('saa', 'lab-rds-multi-az', 'Lab: RDS Multi-AZ e Read Replica', 'Arquiteturas Resilientes', 12),
  ('saa', 'dns-cloudfront-e-borda', 'DNS, CloudFront e Serviços de Borda', 'Arquiteturas de Alta Performance', 13),
  ('saa', '07-desacoplamento', 'Desacoplamento: SQS, SNS e EventBridge', 'Arquiteturas Resilientes', 14),
  ('saa', 'lab-fanout-sns-sqs', 'Lab: Fan-out com SNS + SQS', 'Arquiteturas Resilientes', 15),
  ('saa', 'containers-ecs-eks', 'Containers: ECS, EKS, Fargate e App Runner', 'Arquiteturas de Alta Performance', 16),
  ('saa', '08-serverless', 'Serverless: Lambda, API Gateway e Padrões', 'Arquiteturas de Alta Performance', 17),
  ('saa', 'lab-api-serverless', 'Lab: API Serverless — API Gateway + Lambda + DynamoDB', 'Arquiteturas de Alta Performance', 18),
  ('saa', 'dados-e-analytics', 'Dados e Analytics: Kinesis, Glue, Athena e Cia', 'Arquiteturas de Alta Performance', 19),
  ('saa', 'kms-e-gestao-de-segredos', 'Criptografia com KMS e Gestão de Segredos', 'Arquiteturas Seguras', 20),
  ('saa', 'seguranca-deteccao-e-resposta', 'Detecção e Resposta: GuardDuty, Macie, Inspector e Cia', 'Arquiteturas Seguras', 21),
  ('saa', '10-monitoramento-e-custos', 'Observabilidade, Governança e Otimização de Custos', 'Arquiteturas com Custo Otimizado', 22),
  ('saa', 'migracao-e-transferencia', 'Migração e Transferência de Dados', 'Arquiteturas Resilientes', 23),
  ('saa', '09-recuperacao-de-desastres', 'Recuperação de Desastres e Continuidade', 'Arquiteturas Resilientes', 24),
  ('saa', 'governanca-multi-conta', 'Organizations, Governança Multi-Conta e Custos', 'Arquiteturas Seguras', 25),
  ('saa', 'ia-ml-para-arquitetos', 'IA e ML para o Arquiteto', 'Arquiteturas de Alta Performance', 26),
  ('saa', 'well-architected-na-pratica', 'Well-Architected na Prática', 'Arquiteturas Resilientes', 27),
  ('saa', 'casos-de-arquitetura-reais', 'Casos de Arquitetura Completos', 'Arquiteturas Resilientes', 28),
  ('saa', 'armadilhas-e-comparacoes', 'Armadilhas e Comparações Definitivas', 'Arquiteturas Resilientes', 29),
  ('saa', 'glossario-saa', 'Glossário SAA', 'Arquiteturas Resilientes', 30),
  ('saa', 'reta-final-plano-14-dias', 'Reta Final: Plano de 14 Dias e Dia da Prova', 'Arquiteturas Resilientes', 31)
on conflict (cert_id, slug) do update

  set title = excluded.title, domain = excluded.domain, order_index = excluded.order_index;
