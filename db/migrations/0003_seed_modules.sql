-- Module registry mirroring /content/<cert>/modules/*.mdx (identity: cert_id + slug).
-- Keep in sync when adding/removing MDX files.

insert into modules (cert_id, slug, title, domain, order_index) values
  ('ccp', '01-fundamentos-da-nuvem', 'Fundamentos da Computação em Nuvem', 'Conceitos de Nuvem', 1),
  ('ccp', '02-seguranca-e-iam', 'Segurança, Responsabilidade Compartilhada e IAM', 'Segurança e Conformidade', 2),
  ('ccp', '03-computacao', 'Computação: EC2, Lambda e Containers', 'Tecnologia e Serviços', 3),
  ('ccp', '04-armazenamento', 'Armazenamento: S3, EBS e EFS', 'Tecnologia e Serviços', 4),
  ('ccp', '05-redes-e-cdn', 'Redes: VPC, Route 53 e CloudFront', 'Tecnologia e Serviços', 5),
  ('ccp', '06-bancos-de-dados', 'Bancos de Dados na AWS', 'Tecnologia e Serviços', 6),
  ('ccp', '07-monitoramento-e-governanca', 'Monitoramento, Auditoria e Governança', 'Segurança e Conformidade', 7),
  ('ccp', '08-precificacao-e-suporte', 'Precificação, Cobrança e Planos de Suporte', 'Cobrança, Preços e Suporte', 8),
  ('ccp', '09-frameworks-e-migracao', 'Well-Architected, CAF e Estratégias de Migração', 'Conceitos de Nuvem', 9),
  ('ccp', '10-ia-ml-e-servicos-extras', 'IA/ML e Serviços Complementares', 'Tecnologia e Serviços', 10),
  ('saa', '01-estrategia-de-prova', 'Como Pensar na Prova SAA-C03', 'Arquiteturas Seguras', 1),
  ('saa', '02-iam-e-seguranca', 'IAM Avançado e Segurança de Arquiteturas', 'Arquiteturas Seguras', 2),
  ('saa', '03-computacao-e-escalabilidade', 'EC2, Auto Scaling e Load Balancing', 'Arquiteturas Resilientes', 3),
  ('saa', '04-s3-avancado', 'S3 Avançado', 'Arquiteturas de Alta Performance', 4),
  ('saa', '05-vpc-e-redes', 'VPC e Redes na Prática', 'Arquiteturas Seguras', 5),
  ('saa', '06-bancos-de-dados', 'Bancos de Dados para Arquitetos', 'Arquiteturas de Alta Performance', 6),
  ('saa', '07-desacoplamento', 'Desacoplamento: SQS, SNS e EventBridge', 'Arquiteturas Resilientes', 7),
  ('saa', '08-serverless', 'Serverless: Lambda, API Gateway e Padrões', 'Arquiteturas de Alta Performance', 8),
  ('saa', '09-recuperacao-de-desastres', 'Recuperação de Desastres e Continuidade', 'Arquiteturas Resilientes', 9),
  ('saa', '10-monitoramento-e-custos', 'Observabilidade, Governança e Otimização de Custos', 'Arquiteturas com Custo Otimizado', 10)
on conflict (cert_id, slug) do update
  set title = excluded.title, domain = excluded.domain, order_index = excluded.order_index;
