-- Flashcards — expansão (+18 CCP, +18 SAA).

insert into flashcards (cert_id, domain, front, back) values

-- CCP
('ccp', 'Conceitos de Nuvem', 'Quais são os 6 benefícios da computação em nuvem?', 'CAPEX→OPEX · economia de escala · parar de adivinhar capacidade · velocidade/agilidade · fim do gasto com datacenter · alcance global em minutos.'),
('ccp', 'Conceitos de Nuvem', 'Região × AZ × Edge Location — defina em uma linha cada.', 'Região: área geográfica com várias AZs. AZ: datacenter(s) isolado(s) dentro da Região. Edge: ponto de cache do CloudFront/Route 53, muito mais numeroso.'),
('ccp', 'Conceitos de Nuvem', 'Elasticidade × escalabilidade', 'Elasticidade: ajustar recursos automaticamente para CIMA e para BAIXO conforme demanda. Escalabilidade: capacidade de crescer quando necessário.'),
('ccp', 'Conceitos de Nuvem', 'Os 7 Rs de migração', 'Rehost (lift-and-shift) · Replatform (pequenos ajustes) · Repurchase (virar SaaS) · Refactor (redesenhar) · Retire (desligar) · Retain (manter) · Relocate (mover hypervisor).'),
('ccp', 'Conceitos de Nuvem', 'CAF × Well-Architected', 'CAF: adoção de nuvem pela ORGANIZAÇÃO (6 perspectivas). Well-Architected: boas práticas de ARQUITETURA de workloads (6 pilares).'),
('ccp', 'Segurança e Conformidade', 'Responsabilidade compartilhada em uma frase', 'AWS é responsável pela segurança DA nuvem (infra física, hypervisor); o cliente pela segurança NA nuvem (dados, acessos, configurações).'),
('ccp', 'Segurança e Conformidade', 'Quem faz patch do SO em EC2? E em RDS?', 'EC2: o CLIENTE (IaaS — do SO para cima é seu). RDS: a AWS (serviço gerenciado).'),
('ccp', 'Segurança e Conformidade', 'Tarefas exclusivas do usuário root', 'Fechar a conta · alterar plano de suporte · alterar dados de cobrança/fiscais. Todo o resto: usuário IAM administrador.'),
('ccp', 'Segurança e Conformidade', 'GuardDuty × Inspector × Macie', 'GuardDuty: ameaças ativas (comportamento). Inspector: vulnerabilidades/CVEs (EC2, ECR, Lambda). Macie: dados sensíveis (PII) no S3.'),
('ccp', 'Segurança e Conformidade', 'Shield × WAF', 'Shield: DDoS camadas 3/4 (Standard grátis/automático). WAF: regras camada 7 — SQL injection, XSS, rate limiting.'),
('ccp', 'Segurança e Conformidade', 'AWS Artifact serve para…', 'Baixar relatórios de conformidade DA AWS (SOC, ISO, PCI) e aceitar acordos. Não confundir com Audit Manager (coleta evidências SUAS).'),
('ccp', 'Tecnologia e Serviços', 'Modelos de compra EC2 e seus cenários', 'On-Demand: imprevisível. Reserved/Savings: estável 1-3 anos (até ~72% off). Spot: interrompível (até ~90% off). Dedicated Host: licenças/compliance.'),
('ccp', 'Tecnologia e Serviços', 'S3 × EBS × EFS', 'S3: objetos via URL/API. EBS: disco de bloco de UMA instância (1 AZ). EFS: sistema de arquivos de rede elástico para VÁRIAS instâncias Linux (multi-AZ).'),
('ccp', 'Tecnologia e Serviços', 'Classes S3 da mais quente à mais fria', 'Standard → Intelligent-Tiering (padrão desconhecido) → Standard-IA → One Zone-IA → Glacier Instant → Glacier Flexible → Glacier Deep Archive.'),
('ccp', 'Tecnologia e Serviços', 'SQS × SNS × EventBridge', 'SQS: fila durável (1 grupo consumidor). SNS: pub/sub para N assinantes. EventBridge: barramento de eventos com regras e integrações SaaS.'),
('ccp', 'Tecnologia e Serviços', 'CloudFront × Global Accelerator', 'CloudFront: CDN, cacheia CONTEÚDO nas edges. Global Accelerator: acelera CONEXÕES TCP/UDP pela backbone, com 2 IPs estáticos.'),
('ccp', 'Tecnologia e Serviços', 'Athena em uma linha', 'SQL serverless direto sobre arquivos no S3, pagando por consulta — sem carregar dados em banco.'),
('ccp', 'Cobrança, Preços e Suporte', 'Calculator × Cost Explorer × Budgets × CUR', 'Calculator: estimar ANTES. Cost Explorer: analisar DEPOIS (+ previsão). Budgets: ALERTAR limites. CUR: relatório mais DETALHADO.'),

-- SAA
('saa', 'Arquiteturas Seguras', 'Ordem de avaliação de políticas IAM', '1) Deny explícito? Negado. 2) Algum Allow aplicável (dentro de SCP/boundary)? Permitido. 3) Nada permite? Negado (default deny).'),
('saa', 'Arquiteturas Seguras', 'Acesso cross-account padrão', 'Role na conta-recurso com trust policy para a conta-consumidora + sts:AssumeRole. Sem credenciais permanentes.'),
('saa', 'Arquiteturas Seguras', 'SSE-S3 × SSE-KMS × SSE-C', 'SSE-S3: chaves do S3, zero gestão. SSE-KMS: auditoria via CloudTrail + controle/rotação (resposta para compliance). SSE-C: cliente manda a chave a cada request.'),
('saa', 'Arquiteturas Seguras', 'Secrets Manager × Parameter Store', 'Secrets Manager: rotação automática nativa (RDS), pago por segredo. Parameter Store: parâmetros/segredos simples, standard grátis, sem rotação nativa.'),
('saa', 'Arquiteturas Seguras', 'Gateway Endpoint × Interface Endpoint', 'Gateway: S3 e DynamoDB, via route table, GRÁTIS. Interface (PrivateLink): demais serviços, ENI com IP privado, pago por hora+GB.'),
('saa', 'Arquiteturas Seguras', 'Session Manager elimina…', 'Bastion hosts, chaves SSH e portas abertas — shell via agente SSM + IAM, com auditoria de sessões.'),
('saa', 'Arquiteturas Resilientes', 'Multi-AZ × Read Replica (RDS)', 'Multi-AZ: réplica SÍNCRONA standby, failover automático de DNS, não atende leitura. Read replica: ASSÍNCRONA, atende leitura, promoção manual.'),
('saa', 'Arquiteturas Resilientes', 'As 4 estratégias de DR (barata→cara)', 'Backup & Restore (RTO horas) → Pilot Light (dezenas de min) → Warm Standby (minutos) → Multi-site ativo-ativo (~zero). Escolha a mais barata que cumpre o RTO/RPO.'),
('saa', 'Arquiteturas Resilientes', 'RPO × RTO', 'RPO: quantos DADOS posso perder (tempo desde a última réplica/backup). RTO: quanto TEMPO posso ficar fora do ar.'),
('saa', 'Arquiteturas Resilientes', 'Fan-out clássico', 'SNS (broadcast) → múltiplas filas SQS (durabilidade) → consumidores independentes no próprio ritmo.'),
('saa', 'Arquiteturas Resilientes', 'SQS Standard × FIFO', 'Standard: throughput ilimitado, at-least-once (duplicatas possíveis), ordem não garantida. FIFO: ordem estrita + exactly-once, com MessageGroupId por fluxo.'),
('saa', 'Arquiteturas Resilientes', 'Placement groups', 'Cluster: juntos, latência mínima (HPC). Spread: hardware distinto, máx 7/AZ (instâncias críticas). Partition: grupos isolados (Hadoop/Kafka).'),
('saa', 'Arquiteturas de Alta Performance', 'DAX × ElastiCache', 'DAX: cache drop-in SÓ para DynamoDB (microssegundos, sem mudar código). ElastiCache: cache genérico Redis/Memcached (exige lógica na aplicação).'),
('saa', 'Arquiteturas de Alta Performance', 'RDS Proxy resolve…', 'Esgotamento de conexões (ex: Lambdas em massa) — multiplexa conexões efêmeras em pool estável para o RDS/Aurora.'),
('saa', 'Arquiteturas de Alta Performance', 'Kinesis Streams × Firehose', 'Streams: tempo real, ordem por shard, replay, múltiplos consumidores. Firehose: entrega gerenciada near-real-time para S3/Redshift/OpenSearch, sem replay.'),
('saa', 'Arquiteturas de Alta Performance', 'Números da Lambda que eliminam alternativas', 'Timeout máx 15 min · payload síncrono ~6 MB · cold start mitigado por provisioned concurrency · API Gateway timeout 29 s.'),
('saa', 'Arquiteturas com Custo Otimizado', 'As 6 alavancas de custo', 'Modelo de compra (Spot/Savings) · rightsizing · classe de storage/lifecycle · transferência (endpoints, CloudFront, mesma AZ) · serverless para intermitente · desligar ociosos.'),
('saa', 'Arquiteturas com Custo Otimizado', 'NAT caro falando com S3 — solução?', 'Gateway VPC Endpoint (grátis) na route table: tráfego S3/DynamoDB sai do NAT (que cobra por GB processado).')

on conflict do nothing;
