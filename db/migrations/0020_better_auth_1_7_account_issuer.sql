-- Better Auth 1.7 scopes account identities by issuer.
alter table account
  add column if not exists issuer text;

-- Existing installations may already have credential or OAuth accounts.
update account
set issuer = case
  when "providerId" = 'credential' then 'local:credential'
  when "providerId" = 'google' then 'https://accounts.google.com'
  else 'local:oauth:' || "providerId"
end
where issuer is null;

alter table account
  alter column issuer set not null;

create unique index if not exists "account_issuer_accountId_uidx"
  on account (issuer, "accountId");
