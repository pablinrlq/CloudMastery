-- Seed inicial do banco de questões (originais, PT-BR).
-- 12 por certificação (3 por domínio) para o MVP; expandir continuamente.

insert into questions (cert_id, domain, prompt, choices, correct_choice_ids, explanation, difficulty) values

-- ===================== CCP: Conceitos de Nuvem =====================
('ccp', 'Conceitos de Nuvem',
 'Uma startup quer lançar seu produto sem comprar servidores, pagando apenas pelos recursos que consumir a cada mês. Qual benefício da computação em nuvem esse cenário descreve?',
 '[{"id":"a","text":"Trocar despesa variável por despesa de capital"},{"id":"b","text":"Trocar despesa de capital (CAPEX) por despesa variável (OPEX)"},{"id":"c","text":"Economia de escala do datacenter próprio"},{"id":"d","text":"Alta disponibilidade automática"}]',
 '{b}',
 'Pagar conforme o uso, sem investimento antecipado em hardware, é a troca de CAPEX por OPEX — um dos seis benefícios da nuvem. A alternativa A inverte os termos.',
 'easy'),

('ccp', 'Conceitos de Nuvem',
 'Uma aplicação precisa continuar funcionando mesmo se um datacenter inteiro da AWS ficar indisponível. Qual prática atende esse requisito com menor complexidade?',
 '[{"id":"a","text":"Implantar em múltiplas Zonas de Disponibilidade na mesma Região"},{"id":"b","text":"Implantar em uma única AZ com instâncias maiores"},{"id":"c","text":"Usar apenas edge locations do CloudFront"},{"id":"d","text":"Contratar Direct Connect"}]',
 '{a}',
 'AZs são agrupamentos isolados de datacenters; distribuir a aplicação em múltiplas AZs protege contra a falha de um datacenter sem a complexidade de uma arquitetura multi-região.',
 'easy'),

('ccp', 'Conceitos de Nuvem',
 'Qual estratégia de migração corresponde a mover uma aplicação para a AWS sem nenhuma alteração, o mais rápido possível?',
 '[{"id":"a","text":"Refactor"},{"id":"b","text":"Repurchase"},{"id":"c","text":"Rehost (lift and shift)"},{"id":"d","text":"Retire"}]',
 '{c}',
 'Rehost ("lift and shift") move a carga como está. Refactor redesenha, repurchase troca por SaaS e retire desativa.',
 'easy'),

-- ===================== CCP: Segurança e Conformidade =====================
('ccp', 'Segurança e Conformidade',
 'No modelo de responsabilidade compartilhada, quais itens são responsabilidade do CLIENTE ao usar Amazon EC2? (Escolha DUAS)',
 '[{"id":"a","text":"Aplicar patches no sistema operacional convidado"},{"id":"b","text":"Manutenção física dos servidores"},{"id":"c","text":"Configurar as regras dos security groups"},{"id":"d","text":"Segurança do hypervisor"}]',
 '{a,c}',
 'Em EC2 (IaaS), o cliente gerencia do sistema operacional para cima: patches do SO e configuração de firewall (security groups). Hardware e hypervisor são da AWS.',
 'medium'),

('ccp', 'Segurança e Conformidade',
 'Uma aplicação em EC2 precisa ler objetos de um bucket S3 sem armazenar credenciais na instância. Qual é a prática recomendada?',
 '[{"id":"a","text":"Criar um usuário IAM e salvar as chaves de acesso no código"},{"id":"b","text":"Anexar uma IAM role à instância EC2"},{"id":"c","text":"Tornar o bucket público"},{"id":"d","text":"Compartilhar as credenciais do usuário root"}]',
 '{b}',
 'IAM roles fornecem credenciais temporárias automaticamente à instância — sem segredos hardcoded. Chaves no código e bucket público violam boas práticas; root nunca se compartilha.',
 'easy'),

('ccp', 'Segurança e Conformidade',
 'O time de auditoria precisa baixar os relatórios de conformidade da AWS (SOC 2, ISO 27001) para uma certificação interna. Qual serviço fornece esses documentos?',
 '[{"id":"a","text":"AWS Artifact"},{"id":"b","text":"AWS Config"},{"id":"c","text":"Amazon Inspector"},{"id":"d","text":"AWS CloudTrail"}]',
 '{a}',
 'AWS Artifact é o portal self-service de relatórios de conformidade e acordos. Config avalia configuração de recursos, Inspector varre vulnerabilidades e CloudTrail audita chamadas de API.',
 'easy'),

-- ===================== CCP: Tecnologia e Serviços =====================
('ccp', 'Tecnologia e Serviços',
 'Um processamento em lote pode ser interrompido e retomado sem prejuízo. Qual modelo de compra de EC2 oferece o MAIOR desconto para esse cenário?',
 '[{"id":"a","text":"On-Demand"},{"id":"b","text":"Reserved Instances"},{"id":"c","text":"Spot Instances"},{"id":"d","text":"Dedicated Hosts"}]',
 '{c}',
 'Spot usa capacidade ociosa com até ~90% de desconto, com a contrapartida de poder ser interrompido — perfeito para cargas tolerantes a interrupção.',
 'easy'),

('ccp', 'Tecnologia e Serviços',
 'Uma empresa precisa compartilhar um sistema de arquivos entre dezenas de instâncias EC2 Linux simultaneamente, com escala automática. Qual serviço usar?',
 '[{"id":"a","text":"Amazon EBS"},{"id":"b","text":"Amazon EFS"},{"id":"c","text":"Instance Store"},{"id":"d","text":"S3 Glacier"}]',
 '{b}',
 'EFS é o sistema de arquivos de rede (NFS) elástico e multi-AZ montável por várias instâncias. EBS anexa a uma instância por vez; instance store é efêmero; Glacier é arquivamento.',
 'easy'),

('ccp', 'Tecnologia e Serviços',
 'Qual serviço executa código em resposta a eventos, sem provisionar servidores, cobrando apenas pelo tempo de execução?',
 '[{"id":"a","text":"Amazon EC2"},{"id":"b","text":"AWS Lambda"},{"id":"c","text":"Amazon Lightsail"},{"id":"d","text":"Elastic Beanstalk"}]',
 '{b}',
 'Lambda é o serviço serverless orientado a eventos com cobrança por requisição e duração. EC2 e Lightsail provisionam servidores; Beanstalk orquestra recursos por baixo.',
 'easy'),

-- ===================== CCP: Cobrança, Preços e Suporte =====================
('ccp', 'Cobrança, Preços e Suporte',
 'O time financeiro quer receber um alerta automático quando o gasto mensal previsto ultrapassar R$ 5.000. Qual ferramenta usar?',
 '[{"id":"a","text":"AWS Pricing Calculator"},{"id":"b","text":"AWS Budgets"},{"id":"c","text":"AWS Cost and Usage Report"},{"id":"d","text":"AWS Artifact"}]',
 '{b}',
 'Budgets permite definir limites e disparar alertas (inclusive por previsão). Calculator estima antes do uso; CUR detalha o histórico; Artifact é conformidade.',
 'easy'),

('ccp', 'Cobrança, Preços e Suporte',
 'Qual é o plano de suporte MAIS BARATO que inclui acesso 24/7 por telefone e chat com engenheiros de suporte?',
 '[{"id":"a","text":"Basic"},{"id":"b","text":"Developer"},{"id":"c","text":"Business"},{"id":"d","text":"Enterprise"}]',
 '{c}',
 'Business é o primeiro plano com suporte 24/7 por telefone/chat e Trusted Advisor completo. Developer é e-mail em horário comercial; Basic não tem suporte técnico.',
 'medium'),

('ccp', 'Cobrança, Preços e Suporte',
 'Uma empresa com várias contas AWS quer agregar o uso para atingir faixas de desconto por volume. Qual recurso permite isso?',
 '[{"id":"a","text":"Fatura consolidada do AWS Organizations"},{"id":"b","text":"AWS Cost Explorer"},{"id":"c","text":"Savings Plans individuais por conta"},{"id":"d","text":"Tags de alocação de custo"}]',
 '{a}',
 'A fatura consolidada agrega o consumo de todas as contas da organização, alcançando descontos por volume mais rapidamente. Cost Explorer analisa, não desconta.',
 'medium'),

-- ===================== SAA: Arquiteturas Seguras =====================
('saa', 'Arquiteturas Seguras',
 'Instâncias EC2 em subnets privadas precisam gravar objetos no S3. O tráfego não pode passar pela internet e a solução deve ter o MENOR custo. O que fazer?',
 '[{"id":"a","text":"Criar um NAT Gateway em cada AZ"},{"id":"b","text":"Criar um VPC Gateway Endpoint para o S3"},{"id":"c","text":"Criar um Interface Endpoint (PrivateLink) para o S3"},{"id":"d","text":"Anexar um Internet Gateway à VPC"}]',
 '{b}',
 'Gateway Endpoints (S3 e DynamoDB) mantêm o tráfego na rede da AWS sem custo adicional. NAT Gateway resolve, mas custa por hora e por GB; Interface Endpoint também é pago.',
 'medium'),

('saa', 'Arquiteturas Seguras',
 'Uma aplicação Lambda precisa de credenciais de banco com rotação automática a cada 30 dias. Qual serviço atende com MENOS esforço operacional?',
 '[{"id":"a","text":"SSM Parameter Store (SecureString)"},{"id":"b","text":"AWS Secrets Manager com rotação automática"},{"id":"c","text":"Variáveis de ambiente criptografadas"},{"id":"d","text":"Arquivo criptografado no S3"}]',
 '{b}',
 'Secrets Manager tem rotação automática nativa (integrada ao RDS). Parameter Store armazena com segurança, mas a rotação exigiria Lambda customizada.',
 'medium'),

('saa', 'Arquiteturas Seguras',
 'Um requisito de conformidade exige criptografia em repouso no S3 com trilha de auditoria de CADA uso da chave e rotação gerenciável. Qual opção atende?',
 '[{"id":"a","text":"SSE-S3"},{"id":"b","text":"SSE-KMS"},{"id":"c","text":"Criptografia no cliente sem KMS"},{"id":"d","text":"Desabilitar criptografia e usar bucket policy"}]',
 '{b}',
 'SSE-KMS registra o uso da chave no CloudTrail e permite políticas e rotação da chave. SSE-S3 criptografa, mas sem auditoria por chave nem controle de acesso granular.',
 'medium'),

-- ===================== SAA: Arquiteturas Resilientes =====================
('saa', 'Arquiteturas Resilientes',
 'Durante picos, pedidos enviados diretamente do front-end para o serviço de processamento estão sendo perdidos quando o serviço fica sobrecarregado. Qual mudança torna a arquitetura mais resiliente?',
 '[{"id":"a","text":"Aumentar o tamanho das instâncias do serviço"},{"id":"b","text":"Introduzir uma fila SQS entre o front-end e o processamento"},{"id":"c","text":"Mover o serviço para uma única AZ maior"},{"id":"d","text":"Adicionar CloudFront na frente do front-end"}]',
 '{b}',
 'A fila absorve picos e garante durabilidade das mensagens; consumidores processam no próprio ritmo (e podem escalar pela profundidade da fila). Scale-up ajuda, mas não elimina perda em rajadas.',
 'medium'),

('saa', 'Arquiteturas Resilientes',
 'Um banco RDS MySQL precisa de failover automático em caso de falha da AZ, sem alterações na aplicação. O que configurar?',
 '[{"id":"a","text":"Read replica na mesma Região"},{"id":"b","text":"Implantação Multi-AZ"},{"id":"c","text":"Snapshot diário automatizado"},{"id":"d","text":"Read replica em outra Região"}]',
 '{b}',
 'Multi-AZ mantém uma réplica síncrona standby com failover automático de DNS. Read replicas exigem promoção manual e servem para leitura, não para failover automático.',
 'easy'),

('saa', 'Arquiteturas Resilientes',
 'Uma empresa exige RTO de aproximadamente 10 minutos e RPO de segundos para seu sistema crítico, com o menor custo que atenda esses objetivos. Qual estratégia de DR escolher?',
 '[{"id":"a","text":"Backup & Restore"},{"id":"b","text":"Pilot Light"},{"id":"c","text":"Warm Standby"},{"id":"d","text":"Multi-site ativo-ativo"}]',
 '{c}',
 'Warm standby mantém o ambiente completo em escala reduzida com replicação contínua: RTO de minutos e RPO de segundos. Ativo-ativo também atende, mas custa mais — e a questão pede o menor custo suficiente.',
 'hard'),

-- ===================== SAA: Arquiteturas de Alta Performance =====================
('saa', 'Arquiteturas de Alta Performance',
 'Uma tabela DynamoDB sofre leituras intensas dos mesmos itens e a latência precisa cair para microssegundos SEM alterar o código da aplicação. Qual solução?',
 '[{"id":"a","text":"Amazon ElastiCache for Redis"},{"id":"b","text":"DynamoDB Accelerator (DAX)"},{"id":"c","text":"Read replicas do DynamoDB"},{"id":"d","text":"Aumentar RCUs provisionadas"}]',
 '{b}',
 'DAX é o cache compatível com a API do DynamoDB (drop-in, sem mudança de código) com leituras em microssegundos. ElastiCache exigiria lógica de cache na aplicação.',
 'medium'),

('saa', 'Arquiteturas de Alta Performance',
 'Relatórios analíticos pesados estão degradando um banco Aurora de produção. Como isolar a carga analítica com MENOR impacto?',
 '[{"id":"a","text":"Executar os relatórios em uma Aurora Replica usando o reader endpoint"},{"id":"b","text":"Aumentar a instância writer"},{"id":"c","text":"Migrar tudo para DynamoDB"},{"id":"d","text":"Agendar os relatórios para o horário de pico"}]',
 '{a}',
 'Aurora Replicas atendem leituras através do reader endpoint, isolando a carga analítica do writer. Scale-up do writer não separa as cargas.',
 'medium'),

('saa', 'Arquiteturas de Alta Performance',
 'Usuários fazem upload de arquivos de 2 GB para uma aplicação. Hoje os arquivos passam por uma Lambda que grava no S3, e uploads estão falhando. Qual é a melhor correção?',
 '[{"id":"a","text":"Aumentar a memória da Lambda"},{"id":"b","text":"Gerar presigned URLs do S3 para upload direto do cliente"},{"id":"c","text":"Trocar Lambda por EC2"},{"id":"d","text":"Compactar os arquivos antes do upload"}]',
 '{b}',
 'O payload síncrono da Lambda é limitado (~6 MB) — arquivos grandes não devem trafegar por ela. Presigned URL permite upload direto e seguro ao S3, removendo a Lambda do caminho dos dados.',
 'medium'),

-- ===================== SAA: Custo Otimizado =====================
('saa', 'Arquiteturas com Custo Otimizado',
 'Uma frota EC2 tem uso estável e previsível há 12 meses e deve continuar assim. Qual opção reduz MAIS o custo mantendo flexibilidade de família de instância e Região?',
 '[{"id":"a","text":"Compute Savings Plans"},{"id":"b","text":"Standard Reserved Instances zonais"},{"id":"c","text":"Spot Instances"},{"id":"d","text":"On-Demand com desconto por volume"}]',
 '{a}',
 'Compute Savings Plans dão desconto por compromisso de gasto com flexibilidade de família, tamanho, SO e Região. RIs zonais prendem a configuração; Spot não serve para carga estável obrigatória.',
 'medium'),

('saa', 'Arquiteturas com Custo Otimizado',
 'Logs de aplicação precisam ficar acessíveis por 30 dias, ser retidos por 5 anos para auditoria (acesso raríssimo) e depois excluídos. Qual configuração de S3 é a mais econômica?',
 '[{"id":"a","text":"Standard por 5 anos"},{"id":"b","text":"Lifecycle: Standard 30 dias → Glacier Deep Archive → expiração em 5 anos"},{"id":"c","text":"One Zone-IA por 5 anos"},{"id":"d","text":"Intelligent-Tiering sem lifecycle"}]',
 '{b}',
 'Acesso frequente por 30 dias (Standard), arquivamento de longo prazo com acesso raríssimo (Deep Archive, a classe mais barata) e expiração automática. Padrão de acesso é conhecido, então Intelligent-Tiering não compensa.',
 'medium'),

('saa', 'Arquiteturas com Custo Otimizado',
 'Ambientes de desenvolvimento em EC2 e RDS só são usados em horário comercial, mas rodam 24/7. Qual ação gera economia imediata SEM afetar o trabalho do time?',
 '[{"id":"a","text":"Comprar Reserved Instances de 3 anos para dev"},{"id":"b","text":"Automatizar parada e inicialização fora do horário comercial"},{"id":"c","text":"Migrar dev para outra Região mais barata"},{"id":"d","text":"Reduzir todas as instâncias para nano"}]',
 '{b}',
 'Desligar recursos ociosos (ex: Instance Scheduler) corta ~65% do custo de dev sem impacto no expediente. Reservar capacidade para algo que fica ocioso é o oposto de otimizar.',
 'easy');
