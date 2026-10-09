-- The AWS Free Tier changed for accounts created on or after 15 July 2025: new
-- accounts get credits and a free plan of up to 6 months instead of the 12-month
-- offers. Refresh the two CCP questions that still described only the old model.

update public.questions
set
  prompt = 'Uma pessoa acabou de criar uma conta AWS e quer experimentar serviços sem pagar. Qual programa da AWS oferece isso?',
  explanation = 'O AWS Free Tier dá créditos a contas novas (até US$ 200, com plano gratuito de até 6 meses desde julho de 2025) e mantém ofertas sempre gratuitas, como 1 milhão de requisições Lambda por mês. Contas anteriores a julho de 2025 seguem com as ofertas de 12 meses. O plano Basic é suporte, não uso de serviços.',
  hint = 'O nível gratuito combina créditos para contas novas e ofertas que nunca expiram.'
where cert_id = 'ccp'
  and prompt = 'Qual recurso permite testar gratuitamente serviços da AWS por 12 meses após criar a conta?';

update public.questions
set explanation = 'Lambda tem 1M de requisições/mês SEMPRE grátis. EC2 750h/mês e S3 5 GB eram ofertas de 12 meses do modelo anterior a julho de 2025 (não são "always free"); contas novas recebem créditos no lugar delas.'
where cert_id = 'ccp'
  and prompt = 'O que o AWS Free Tier "always free" (sempre gratuito) inclui?';
