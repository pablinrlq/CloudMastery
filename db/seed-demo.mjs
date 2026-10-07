// Cria contas de teste já verificadas (sem SMTP): uma Premium com histórico de
// estudo e uma gratuita, para ver a área logada sem passar pelo cadastro.
//
//   npm run db:seed-demo                banco local (docker compose)
//   npm run db:seed-demo -- --remote    banco hospedado de teste/preview
//
// A senha é sorteada a cada execução e impressa uma única vez (ou defina
// DEMO_PASSWORD). As contas são apagadas e recriadas, então rodar de novo é
// seguro. NUNCA aponte para o banco de produção: as contas têm senha conhecida
// e acesso Premium. Rode `npm run db:migrate` antes.
import path from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";
import { betterAuth } from "better-auth";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local"), quiet: true });
dotenv.config({ path: path.join(root, ".env"), quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não encontrada no .env.local");
  process.exit(1);
}

const parsedUrl = new URL(url);
const isLocal = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsedUrl.hostname);
if (!isLocal && !process.argv.includes("--remote")) {
  console.error(
    `DATABASE_URL aponta para ${parsedUrl.hostname}, que não é local.\n` +
      "Se for um banco de teste/preview, rode de novo com --remote.\n" +
      "Nunca use contra produção: as contas criadas têm senha conhecida e acesso Premium."
  );
  process.exit(1);
}
if (isLocal) {
  parsedUrl.searchParams.delete("ssl");
  parsedUrl.searchParams.delete("sslmode");
}

function generatePassword() {
  let value = "";
  while (value.length < 16) value += randomBytes(16).toString("base64").replace(/[^A-Za-z0-9]/g, "");
  return value.slice(0, 16);
}

const password = process.env.DEMO_PASSWORD || generatePassword();
if (password.length < 8) {
  console.error("DEMO_PASSWORD precisa ter pelo menos 8 caracteres.");
  process.exit(1);
}

const accounts = [
  { label: "Premium ", name: "Marina Souza", email: "premium@cloudmastery.test", premium: true },
  { label: "Gratuita", name: "Rafael Lima", email: "gratis@cloudmastery.test", premium: false },
];

const pool = new pg.Pool({
  connectionString: parsedUrl.toString(),
  ssl: isLocal || process.env.DATABASE_SSL === "disable" ? false : { rejectUnauthorized: false },
});

// Mesma configuração de ID do app (colunas uuid) e sem e-mail: a conta nasce sem
// verificação e a marcamos como verificada logo em seguida.
const auth = betterAuth({
  database: pool,
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || randomBytes(32).toString("hex"),
  advanced: { database: { generateId: "uuid" } },
  emailAndPassword: { enabled: true, autoSignIn: false },
});

// Histórico da conta Premium: CCP quase todo concluído ao longo de ~2 meses,
// 14 módulos de SAA nas últimas 2 semanas (sequência atual), 8 simulados com
// evolução de nota e alguns flashcards.
async function seedPremiumHistory(userId) {
  await pool.query(
    `insert into subscriptions (user_id, stripe_customer_id, status, plan, cert_access, current_period_end)
     values ($1::uuid, 'cus_demo_' || substr($1::text, 1, 8), 'active', 'annual', array['ccp','saa','aif'], now() + interval '300 days')`,
    [userId]
  );

  await pool.query(
    `insert into user_progress (user_id, module_id, status, last_visited_at)
     select $1::uuid, m.id, 'completed',
            now() - (((75 - (row_number() over (order by m.order_index) - 1) * 1.6)::int) || ' days')::interval - interval '1 hour'
     from modules m where m.cert_id = 'ccp'`,
    [userId]
  );

  await pool.query(
    `insert into user_progress (user_id, module_id, status, last_visited_at)
     select $1::uuid, m.id, 'completed', now() - ((offs[m.rn]) || ' days')::interval - interval '30 minutes'
     from (select array[15,14,14,12,11,11,9,5,5,4,3,2,1,0] as offs) o
     join (select id, row_number() over (order by order_index) as rn from modules where cert_id = 'saa') m on m.rn <= 14`,
    [userId]
  );

  await pool.query(
    `insert into simulado_attempts (user_id, cert_id, mode, score, score_no_penalty, domain_breakdown, completed_at, started_at, time_spent_seconds, hints_used, selected_question_ids, answers)
     select $1::uuid, v.cert, 'full', v.score, v.score, v.breakdown::jsonb,
            now() - (v.days || ' days')::interval, now() - (v.days || ' days')::interval - interval '80 minutes',
            4800, '[]'::jsonb, '{}', '{}'::jsonb
     from (values
       ('ccp', 58, 40, '{"Conceitos de Nuvem":{"correct":11,"total":16},"Segurança e Conformidade":{"correct":8,"total":17},"Tecnologia e Serviços":{"correct":9,"total":16},"Cobrança, Preços e Suporte":{"correct":10,"total":17}}'),
       ('ccp', 64, 36, '{"Conceitos de Nuvem":{"correct":11,"total":16},"Segurança e Conformidade":{"correct":10,"total":17},"Tecnologia e Serviços":{"correct":10,"total":16},"Cobrança, Preços e Suporte":{"correct":11,"total":17}}'),
       ('ccp', 69, 33, '{"Conceitos de Nuvem":{"correct":12,"total":16},"Segurança e Conformidade":{"correct":11,"total":17},"Tecnologia e Serviços":{"correct":10,"total":16},"Cobrança, Preços e Suporte":{"correct":12,"total":17}}'),
       ('ccp', 76, 29, '{"Conceitos de Nuvem":{"correct":13,"total":16},"Segurança e Conformidade":{"correct":13,"total":17},"Tecnologia e Serviços":{"correct":11,"total":16},"Cobrança, Preços e Suporte":{"correct":13,"total":17}}'),
       ('ccp', 81, 26, '{"Conceitos de Nuvem":{"correct":14,"total":16},"Segurança e Conformidade":{"correct":14,"total":17},"Tecnologia e Serviços":{"correct":12,"total":16},"Cobrança, Preços e Suporte":{"correct":14,"total":17}}'),
       ('ccp', 79, 22, '{"Conceitos de Nuvem":{"correct":13,"total":16},"Segurança e Conformidade":{"correct":13,"total":17},"Tecnologia e Serviços":{"correct":12,"total":16},"Cobrança, Preços e Suporte":{"correct":14,"total":17}}'),
       ('saa', 55, 10, '{"Arquiteturas Seguras":{"correct":10,"total":16},"Arquiteturas Resilientes":{"correct":9,"total":17},"Arquiteturas de Alta Performance":{"correct":7,"total":16},"Arquiteturas com Custo Otimizado":{"correct":9,"total":17}}'),
       ('saa', 63, 3, '{"Arquiteturas Seguras":{"correct":11,"total":16},"Arquiteturas Resilientes":{"correct":11,"total":17},"Arquiteturas de Alta Performance":{"correct":9,"total":16},"Arquiteturas com Custo Otimizado":{"correct":10,"total":17}}')
     ) as v(cert, score, days, breakdown)`,
    [userId]
  );

  await pool.query(
    `insert into user_flashcard_progress (user_id, flashcard_id, status)
     select $1::uuid, f.id, case when row_number() over (order by f.id) % 3 = 1 then 'review_later' else 'known' end
     from (select id from flashcards where cert_id = 'ccp' order by id limit 14) f`,
    [userId]
  );
}

try {
  const { rows: tables } = await pool.query(
    `select to_regclass('public."user"') is not null as auth, to_regclass('public.modules') is not null as app`
  );
  if (!tables[0].auth || !tables[0].app) {
    throw new Error("Tabelas não encontradas neste banco. Rode `npm run db:migrate` primeiro.");
  }
  const { rows: content } = await pool.query("select count(*)::int as modules from modules");
  if (content[0].modules === 0) {
    console.warn("Aviso: nenhum módulo no banco (migrations de conteúdo não aplicadas); o histórico ficará vazio.");
  }

  await pool.query('delete from "user" where email = any($1::text[])', [accounts.map((account) => account.email)]);

  for (const account of accounts) {
    const { user } = await auth.api.signUpEmail({ body: { name: account.name, email: account.email, password } });
    await pool.query('update "user" set "emailVerified" = true, "updatedAt" = now() where id = $1::uuid', [user.id]);
    if (account.premium) await seedPremiumHistory(user.id);
  }

  console.log("\nContas de teste criadas (e-mail já verificado):\n");
  for (const account of accounts) console.log(`  ${account.label}  ${account.email}`);
  if (process.env.DEMO_PASSWORD) {
    // Chosen by whoever set it (e.g. in Vercel); keep it out of build logs.
    console.log("\n  Senha: a definida em DEMO_PASSWORD.");
  } else {
    console.log(`\n  Senha (a mesma nas duas): ${password}`);
    console.log("\nA senha só aparece agora. Rode o comando de novo para gerar outra (as contas são recriadas).");
  }
  if (!isLocal) console.log("Banco remoto: apague estas contas quando terminar o teste.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
