# RÜZO Production Deployment

## Domain

`rüzo.com` is an IDN domain. In DNS panels, use:

- `rüzo.com` as `xn--rzo-hoa.com`
- `www.rüzo.com` as `www.xn--rzo-hoa.com`

Create these DNS records:

```text
A  @    217.154.13.95
A  www  217.154.13.95
```

## VPS Requirements

Install Docker and Docker Compose on the VPS, then open ports:

```text
80/tcp
443/tcp
```

## Deploy

Copy the project to the VPS, then create the production env file:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and replace all `CHANGE_ME...` values with strong private values.
For email notifications, set `SMTP_PASSWORD` to the password of the IONOS mailbox
`noreply@rüzo.com`. The default SMTP server is `smtp.ionos.com` on port `587`
with STARTTLS.

Start production:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

## GitHub Actions CD

The CD workflow deploys automatically after a successful `CI` run on `main`.
It can also be launched manually from GitHub Actions.

Add these repository secrets in GitHub:

```text
VPS_USER=<ssh user>
VPS_SSH_KEY=<private ssh key>
VPS_HOST=217.154.13.95
VPS_PROJECT_PATH=/opt/ruzo
```

`VPS_HOST` is optional because the workflow defaults to `217.154.13.95`.
`VPS_PROJECT_PATH` is optional. If it is not set, the workflow uses `/opt/ruzo`.
The VPS project directory must already contain `.env.production`.

Caddy will automatically request and renew HTTPS certificates for:

```text
https://rüzo.com
https://www.rüzo.com
```

## Import Products

After the first start, import the catalog only when needed:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres psql -U ruzo_user -d ruzo < scripts/import_ruzo_products.sql
```

For only the Terry Polo Set:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml cp scripts/add_terry_polo_set.sql postgres:/tmp/add_terry_polo_set.sql
docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres psql -U ruzo_user -d ruzo -f /tmp/add_terry_polo_set.sql
```

## Useful Checks

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f caddy
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend
```
