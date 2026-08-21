#!/usr/bin/env bash
set -Eeuo pipefail

# Cloud Mastery — bootstrap/update for a clean Amazon Linux 2023 EC2 instance.
# Interactive use: chmod +x deploy/ec2-amazon-linux-2023.sh && sudo ./deploy/ec2-amazon-linux-2023.sh
# Automated use: export every required variable below, then run with sudo -E.

REPO_URL="${REPO_URL:-https://github.com/pablinrlq/CloudMastery.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
INSTALL_ROOT="${INSTALL_ROOT:-/opt/cloudmastery}"
SOURCE_DIR="${INSTALL_ROOT}/source"
RUNTIME_ENV_FILE="${INSTALL_ROOT}/cloudmastery.env"
IMAGE_NAME="cloudmastery-app:latest"
MIGRATOR_IMAGE="cloudmastery-migrator:latest"
APP_CONTAINER="cloudmastery-app"
CADDY_CONTAINER="cloudmastery-caddy"
DOCKER_NETWORK="cloudmastery-network"

log() { printf '\n\033[1;38;5;208m[Cloud Mastery]\033[0m %s\n' "$*"; }
fail() { printf '\nErro: %s\n' "$*" >&2; exit 1; }

if [[ "${EUID}" -ne 0 ]]; then
  exec sudo -E bash "$0" "$@"
fi

prompt_required() {
  local variable_name="$1" label="$2" secret="${3:-false}" value="${!1:-}"
  if [[ -z "$value" && -t 0 ]]; then
    if [[ "$secret" == "true" ]]; then
      read -r -s -p "${label}: " value
      printf '\n'
    else
      read -r -p "${label}: " value
    fi
  fi
  [[ -n "$value" ]] || fail "Variável obrigatória ausente: ${variable_name}"
  [[ "$value" != *$'\n'* ]] || fail "${variable_name} contém quebra de linha."
  printf -v "$variable_name" '%s' "$value"
  export "$variable_name"
}

log "Instalando Docker, Git e utilitários"
dnf install -y docker git curl ca-certificates
systemctl enable --now docker

install -d -m 0755 "$INSTALL_ROOT"

if [[ -z "${DOMAIN:-}" && -t 0 ]]; then
  read -r -p "Domínio público sem https:// (Enter para usar apenas o IP): " DOMAIN
fi
DOMAIN="${DOMAIN:-}"
if [[ -n "$DOMAIN" && ! "$DOMAIN" =~ ^[A-Za-z0-9.-]+$ ]]; then
  fail "DOMAIN inválido. Informe somente o host, por exemplo cloudmastery.com.br."
fi

if [[ -z "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
  if [[ -n "$DOMAIN" ]]; then
    NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"
  else
    IMDS_TOKEN="$(curl -fsS --max-time 2 -X PUT \
      -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' \
      http://169.254.169.254/latest/api/token || true)"
    PUBLIC_IP=""
    if [[ -n "$IMDS_TOKEN" ]]; then
      PUBLIC_IP="$(curl -fsS --max-time 2 \
        -H "X-aws-ec2-metadata-token: ${IMDS_TOKEN}" \
        http://169.254.169.254/latest/meta-data/public-ipv4 || true)"
    fi
    [[ -n "$PUBLIC_IP" ]] || fail "Defina NEXT_PUBLIC_SITE_URL ou DOMAIN. Não foi possível descobrir o IP público."
    NEXT_PUBLIC_SITE_URL="http://${PUBLIC_IP}"
  fi
  export NEXT_PUBLIC_SITE_URL
fi

prompt_required NEXT_PUBLIC_SUPABASE_URL "URL do projeto Supabase"
prompt_required NEXT_PUBLIC_SUPABASE_ANON_KEY "Chave anon/publishable do Supabase" true
prompt_required SUPABASE_SERVICE_ROLE_KEY "Service role key do Supabase" true
prompt_required DATABASE_URL "Connection string do banco Supabase" true
prompt_required STRIPE_SECRET_KEY "Secret key do Stripe" true
prompt_required STRIPE_WEBHOOK_SECRET "Webhook signing secret do Stripe" true
prompt_required STRIPE_PRICE_ID_MONTHLY "Price ID mensal do Stripe"
prompt_required STRIPE_PRICE_ID_ANNUAL "Price ID anual do Stripe"

log "Gravando variáveis de runtime com permissão restrita"
umask 077
{
  printf 'NODE_ENV=production\n'
  printf 'NEXT_PUBLIC_SITE_URL=%s\n' "$NEXT_PUBLIC_SITE_URL"
  printf 'NEXT_PUBLIC_SUPABASE_URL=%s\n' "$NEXT_PUBLIC_SUPABASE_URL"
  printf 'NEXT_PUBLIC_SUPABASE_ANON_KEY=%s\n' "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
  printf 'SUPABASE_SERVICE_ROLE_KEY=%s\n' "$SUPABASE_SERVICE_ROLE_KEY"
  printf 'DATABASE_URL=%s\n' "$DATABASE_URL"
  printf 'STRIPE_SECRET_KEY=%s\n' "$STRIPE_SECRET_KEY"
  printf 'STRIPE_WEBHOOK_SECRET=%s\n' "$STRIPE_WEBHOOK_SECRET"
  printf 'STRIPE_PRICE_ID_MONTHLY=%s\n' "$STRIPE_PRICE_ID_MONTHLY"
  printf 'STRIPE_PRICE_ID_ANNUAL=%s\n' "$STRIPE_PRICE_ID_ANNUAL"
} > "$RUNTIME_ENV_FILE"
chmod 0600 "$RUNTIME_ENV_FILE"

log "Baixando ou atualizando o Cloud Mastery"
if [[ -d "${SOURCE_DIR}/.git" ]]; then
  git -C "$SOURCE_DIR" fetch --prune origin "$REPO_BRANCH"
  git -C "$SOURCE_DIR" checkout "$REPO_BRANCH"
  git -C "$SOURCE_DIR" pull --ff-only origin "$REPO_BRANCH"
elif [[ -e "$SOURCE_DIR" ]]; then
  fail "${SOURCE_DIR} existe, mas não é um clone Git. Remova ou altere INSTALL_ROOT."
else
  git clone --branch "$REPO_BRANCH" --single-branch "$REPO_URL" "$SOURCE_DIR"
fi

log "Construindo imagens Docker de produção"
docker build \
  --build-arg "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}" \
  --build-arg "NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  --build-arg "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}" \
  --target runner \
  -t "$IMAGE_NAME" "$SOURCE_DIR"
docker build --target migrator -t "$MIGRATOR_IMAGE" "$SOURCE_DIR"

log "Aplicando migrations do Supabase"
docker run --rm --env-file "$RUNTIME_ENV_FILE" "$MIGRATOR_IMAGE"

log "Subindo a aplicação com reinício automático"
docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1 || docker network create "$DOCKER_NETWORK" >/dev/null
docker rm -f "$APP_CONTAINER" >/dev/null 2>&1 || true

APP_PORT_ARGS=(-p 80:3000)
if [[ -n "$DOMAIN" ]]; then
  APP_PORT_ARGS=()
else
  # A rerun can intentionally switch from domain/HTTPS to direct-IP mode.
  docker rm -f "$CADDY_CONTAINER" >/dev/null 2>&1 || true
fi

docker run -d \
  --name "$APP_CONTAINER" \
  --restart unless-stopped \
  --network "$DOCKER_NETWORK" \
  --env-file "$RUNTIME_ENV_FILE" \
  "${APP_PORT_ARGS[@]}" \
  "$IMAGE_NAME" >/dev/null

if [[ -n "$DOMAIN" ]]; then
  log "Configurando HTTPS automático com Caddy"
  CADDY_FILE="${INSTALL_ROOT}/Caddyfile"
  {
    printf '%s {\n' "$DOMAIN"
    printf '  encode zstd gzip\n'
    printf '  reverse_proxy %s:3000\n' "$APP_CONTAINER"
    printf '  header {\n'
    printf '    X-Content-Type-Options nosniff\n'
    printf '    Referrer-Policy strict-origin-when-cross-origin\n'
    printf '    X-Frame-Options DENY\n'
    printf '  }\n'
    printf '}\n'
  } > "$CADDY_FILE"
  chmod 0644 "$CADDY_FILE"

  docker rm -f "$CADDY_CONTAINER" >/dev/null 2>&1 || true
  docker volume create cloudmastery-caddy-data >/dev/null
  docker volume create cloudmastery-caddy-config >/dev/null
  docker run -d \
    --name "$CADDY_CONTAINER" \
    --restart unless-stopped \
    --network "$DOCKER_NETWORK" \
    -p 80:80 -p 443:443 -p 443:443/udp \
    -v "$CADDY_FILE:/etc/caddy/Caddyfile:ro" \
    -v cloudmastery-caddy-data:/data \
    -v cloudmastery-caddy-config:/config \
    caddy:2-alpine >/dev/null
fi

if systemctl is-active --quiet firewalld 2>/dev/null; then
  firewall-cmd --permanent --add-service=http >/dev/null
  [[ -z "$DOMAIN" ]] || firewall-cmd --permanent --add-service=https >/dev/null
  firewall-cmd --reload >/dev/null
fi

log "Verificando a saúde do container"
for attempt in $(seq 1 30); do
  if docker exec "$APP_CONTAINER" node -e \
    "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"; then
    break
  fi
  [[ "$attempt" -lt 30 ]] || { docker logs --tail 100 "$APP_CONTAINER"; fail "A aplicação não ficou saudável."; }
  sleep 2
done

docker image prune -f >/dev/null

log "Deploy concluído em ${NEXT_PUBLIC_SITE_URL}"
printf '\nNo Security Group da EC2, libere TCP 80 e, com domínio, TCP/UDP 443.\n'
printf 'No Supabase, use esta mesma URL em Authentication → URL Configuration.\n'
printf 'Configure o webhook Stripe em %s/api/stripe/webhook.\n' "$NEXT_PUBLIC_SITE_URL"
