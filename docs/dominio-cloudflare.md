# eduardodamasceno.com.br → Cloudflare (saindo da Vercel)

O tunnel já está configurado em `~/.cloudflared/config.yml`. Para o domínio **principal** funcionar, o DNS precisa estar na **Cloudflare** (hoje o `www` ainda aponta para a Vercel).

## Conta Cloudflare certa (importante)

O tunnel **lda-processos** e a zona **xdstudio.com.br** estão na **mesma** conta Cloudflare (a do `cloudflared login`).

Se **eduardodamasceno.com.br** foi adicionado em **outra** conta (outro e-mail no painel):

- `cloudflared tunnel route dns` **não** altera o DNS do domínio principal — só cria registros errados em **xdstudio.com.br**, como `eduardodamasceno.com.br.xdstudio.com.br`.
- O site pode mostrar **Error 1016** (CNAME de origin inválido) ou **NXDOMAIN**.

**Solução:** no painel da conta onde aparece a zona **eduardodamasceno.com.br**, configure os CNAME manualmente (passo 4 abaixo).  
**Ou** remova o site da conta errada e adicione-o na **mesma** conta do tunnel **xdstudio.com.br**, depois rode os comandos do passo 3.

## 1. Adicionar o site na Cloudflare

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a site** → `eduardodamasceno.com.br`
2. Plano **Free**
3. Cloudflare mostra dois nameservers (ex.: `ada.ns.cloudflare.com`)

## 2. Trocar NS no registrador

No **Registro.br** (ou onde o domínio está), substitua os NS atuais pelos da Cloudflare. Propagação: minutos a 48h.

## 3. DNS do tunnel (com a zona já na Cloudflare)

```bash
cloudflared tunnel route dns lda-processos eduardodamasceno.com.br
cloudflared tunnel route dns lda-processos www.eduardodamasceno.com.br
```

Se pedir, use `-f` para sobrescrever registro antigo.

## 4. DNS na zona eduardodamasceno.com.br

No painel → zona **eduardodamasceno.com.br** → **DNS** → **Records**.

**Apague** registros da Vercel ou destinos inválidos (`*.vercel-dns.com`, `76.76.21.21`, CNAME para `www.xdstudio.com.br`, etc.).

**Crie** (proxy laranja **ligado**):

| Tipo  | Nome | Conteúdo |
|-------|------|----------|
| CNAME | `@`  | `6f44cbe9-3ab7-477e-9bfd-afdd73676607.cfargotunnel.com` |
| CNAME | `www` | `6f44cbe9-3ab7-477e-9bfd-afdd73676607.cfargotunnel.com` |

Na zona **xdstudio.com.br** (outra conta), pode apagar os registros fantasma `eduardodamasceno.com.br` e `www.eduardodamasceno.com.br` se existirem.

## 5. Reiniciar o tunnel

```bash
sudo systemctl restart lda-cloudflared
```

## 6. Apagar na Vercel

- [vercel.com](https://vercel.com) → projeto **eduardodamasceno** → Settings → Delete Project  
- Não é obrigatório para o tunnel, mas evita deploy fantasma.

## Registro errado (ignorar)

Se apareceu `eduardodamasceno.com.br.xdstudio.com.br` na zona **xdstudio.com.br**, pode **apagar** — foi criado porque o domínio principal ainda não estava como zona própria na Cloudflare.

## Teste

```bash
curl -sI https://eduardodamasceno.com.br/ | head -3
```

Deve retornar **200** com o stack Docker em `9090` rodando.
