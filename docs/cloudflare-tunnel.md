# Acesso público — eduardodamasceno via Cloudflare Tunnel

Mesmo padrão do **luizdaniel** e **ilovemalu**: `cloudflared` termina HTTPS na Cloudflare e encaminha para `127.0.0.1:9090`, sem abrir porta no roteador.

## Domínios

| Hostname | Uso |
|----------|-----|
| **eduardodamasceno.com.br** | Portfólio (`/`) |
| **www.eduardodamasceno.com.br** | Mesmo app — portfólio e currículo em `/cv` |
| **edu.xdstudio.com.br** | Alias opcional (mesmo tunnel) |

Todos apontam para o Docker na porta **9090**.

## Pré-requisitos

- Domínio **eduardodamasceno.com.br** na Cloudflare com **nameservers da Cloudflare** (hoje o `www` ainda pode estar na Vercel — veja [dominio-cloudflare.md](./dominio-cloudflare.md)).
- Tunnel **lda-processos** já criado (compartilhado com LDA / ilovemalu).
- Stack local no ar: `./scripts/stack.sh up`

## DNS (uma vez)

```bash
cloudflared tunnel route dns lda-processos eduardodamasceno.com.br
cloudflared tunnel route dns lda-processos www.eduardodamasceno.com.br
cloudflared tunnel route dns lda-processos edu.xdstudio.com.br
```

No painel Cloudflare, **remova** registros que ainda apontem para a **Vercel** (CNAME/A antigos no apex e no `www`).

## Ingress (`~/.cloudflared/config.yml`)

Trecho do site (antes do `http_status:404`):

```yaml
  - hostname: eduardodamasceno.com.br
    service: http://127.0.0.1:9090
  - hostname: www.eduardodamasceno.com.br
    service: http://127.0.0.1:9090
  - hostname: edu.xdstudio.com.br
    service: http://127.0.0.1:9090
```

Referência completa: `deploy/cloudflared/config.multi-host.example.yml`.

## Reiniciar o tunnel

```bash
sudo systemctl restart lda-cloudflared
```

## Testar

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://eduardodamasceno.com.br/
curl -s -o /dev/null -w "%{http_code}\n" https://www.eduardodamasceno.com.br/
```

Admin CVMKR: `/cvmkr/login` (senha no `.env` → `CVMKR_PASSWORD`).

## Desenvolvimento sem Docker

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

SQLite em `./data/cvmkr.db`.

## Troubleshooting

| Sintoma | Verificar |
|--------|-----------|
| 404 na Cloudflare | `sudo systemctl restart lda-cloudflared`; ingress no `config.yml` |
| 502 | `./scripts/stack.sh up`; `curl http://127.0.0.1:9090/` |
| Ainda abre site da Vercel | DNS no painel Cloudflare — apagar CNAME da Vercel |
| Login CVMKR | `CVMKR_PASSWORD` / `CVMKR_SECRET` no `.env` |

Instalação inicial do cloudflared: **luizdaniel** → `docs/remote-access-cloudflare.md`.
