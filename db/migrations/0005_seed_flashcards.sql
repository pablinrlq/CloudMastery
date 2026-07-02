-- Seed inicial de flashcards (12 por certificação para o MVP).

insert into flashcards (cert_id, domain, front, back) values
-- CCP
('ccp', 'Conceitos de Nuvem', 'Região vs Zona de Disponibilidade', 'Região = área geográfica com várias AZs. AZ = um ou mais datacenters isolados dentro da Região. Alta disponibilidade = múltiplas AZs.'),
('ccp', 'Conceitos de Nuvem', 'Elasticidade vs Escalabilidade', 'Elasticidade: ajustar recursos automaticamente conforme a demanda (sobe E desce). Escalabilidade: capacidade de crescer para suportar mais carga.'),
('ccp', 'Conceitos de Nuvem', 'Os 6 benefícios da nuvem', 'CAPEX→OPEX · economia de escala · sem adivinhar capacidade · velocidade/agilidade · sem gastar com datacenter · alcance global em minutos.'),
('ccp', 'Segurança e Conformidade', 'Responsabilidade compartilhada em uma frase', 'AWS: segurança DA nuvem (físico, hypervisor). Cliente: segurança NA nuvem (dados, IAM, configuração, patches de SO em EC2).'),
('ccp', 'Segurança e Conformidade', 'CloudTrail vs CloudWatch vs Config', 'CloudTrail: QUEM chamou a API. CloudWatch: COMO está a performance (métricas/logs/alarmes). Config: recursos ESTÃO CONFIGURADOS conforme regras?'),
('ccp', 'Segurança e Conformidade', 'IAM Role', 'Identidade com credenciais TEMPORÁRIAS, assumida por serviços ou usuários. Resposta padrão para "EC2 acessa S3 sem armazenar credenciais".'),
('ccp', 'Tecnologia e Serviços', 'Modelos de compra EC2', 'On-Demand: imprevisível. Reserved/Savings: estável 1-3 anos (~72% off). Spot: interrompível (~90% off). Dedicated Host: licenças/compliance.'),
('ccp', 'Tecnologia e Serviços', 'S3 vs EBS vs EFS', 'S3: objetos via API/URL. EBS: disco de bloco de UMA instância (single-AZ). EFS: sistema de arquivos de rede para VÁRIAS instâncias Linux (multi-AZ).'),
('ccp', 'Tecnologia e Serviços', 'SQS vs SNS', 'SQS: fila — desacopla, 1 grupo consome. SNS: pub/sub — 1 evento notifica N assinantes. Fan-out: SNS → várias filas SQS.'),
('ccp', 'Cobrança, Preços e Suporte', 'Pricing Calculator vs Cost Explorer vs Budgets', 'Calculator: estimar ANTES. Explorer: analisar DEPOIS (histórico/tendência). Budgets: ALERTAR ao ultrapassar limite.'),
('ccp', 'Cobrança, Preços e Suporte', 'Plano de suporte com TAM dedicado', 'Enterprise. (On-Ramp tem pool de TAMs; Business é o mais barato com 24/7 telefone/chat e Trusted Advisor completo.)'),
('ccp', 'Cobrança, Preços e Suporte', 'O que a fatura consolidada muda?', 'Organizations agrega o uso de todas as contas → atinge faixas de desconto por volume mais rápido. Uma fatura, várias contas.'),

-- SAA
('saa', 'Arquiteturas Seguras', 'Ordem de avaliação de políticas IAM', '1) Deny explícito? Negado. 2) Algum Allow aplicável? Permitido. 3) Nada? Negado (default deny). SCP/boundary limitam o teto.'),
('saa', 'Arquiteturas Seguras', 'Gateway Endpoint vs Interface Endpoint', 'Gateway: S3/DynamoDB, via route table, GRÁTIS. Interface (PrivateLink): demais serviços, ENI com IP privado, pago.'),
('saa', 'Arquiteturas Seguras', 'Secrets Manager vs Parameter Store', 'Secrets Manager: rotação automática nativa (RDS), pago. Parameter Store: armazenamento seguro de config, grátis no tier padrão, sem rotação nativa.'),
('saa', 'Arquiteturas Resilientes', 'RDS Multi-AZ vs Read Replica', 'Multi-AZ: réplica SÍNCRONA standby, failover AUTOMÁTICO, não atende leitura → disponibilidade. Read replica: ASSÍNCRONA, atende leitura, promoção manual → performance.'),
('saa', 'Arquiteturas Resilientes', 'As 4 estratégias de DR (barato → caro)', 'Backup & Restore (RTO horas) → Pilot Light (núcleo ligado) → Warm Standby (tudo em escala reduzida) → Multi-site ativo-ativo (RTO~0). Escolha a mais barata que atende RTO/RPO.'),
('saa', 'Arquiteturas Resilientes', 'SQS Standard vs FIFO', 'Standard: throughput ilimitado, at-least-once (pode duplicar), sem ordem. FIFO: ordem garantida, exactly-once, ~3k msg/s com batch.'),
('saa', 'Arquiteturas de Alta Performance', 'DAX vs ElastiCache', 'DAX: cache drop-in SÓ para DynamoDB, microssegundos, sem mudar código. ElastiCache (Redis/Memcached): cache genérico, exige lógica na aplicação.'),
('saa', 'Arquiteturas de Alta Performance', 'ALB vs NLB', 'ALB: camada 7, rotas por path/host, WAF. NLB: camada 4 TCP/UDP, IP estático, latência ultra baixa, milhões de req/s.'),
('saa', 'Arquiteturas de Alta Performance', 'Limites da Lambda que decidem questões', '15 min de timeout · ~6 MB payload síncrono · cold start (mitiga com provisioned concurrency) · conexões RDS (usa RDS Proxy).'),
('saa', 'Arquiteturas com Custo Otimizado', 'NAT Gateway caro demais — alternativa?', 'Se o destino é S3/DynamoDB: Gateway Endpoint (grátis, sem internet). NAT só para o que realmente precisa de saída à internet.'),
('saa', 'Arquiteturas com Custo Otimizado', 'Compute Savings Plans vs Reserved Instances', 'Savings Plans: desconto por compromisso de $/hora, flexível (família, região, SO). RI padrão: preso à configuração; RI conversível fica no meio.'),
('saa', 'Arquiteturas com Custo Otimizado', 'Mínimos de dias das classes S3', 'Standard-IA/One Zone-IA: 30 dias. Glacier Flexible: 90. Deep Archive: 180. Objetos < 128 KB não compensam em IA.');
