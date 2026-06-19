# Chat + Telegram

Contato do portfólio via chat anônimo. Mensagens ficam no SQLite com TTL; você recebe **uma notificação por sessão** no Telegram.

## Variáveis (`.env`)

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
TELEGRAM_WEBHOOK_SECRET=um-segredo-opcional
```

| Variável | Como obter |
|----------|------------|
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) → `/newbot` |
| `TELEGRAM_CHAT_ID` | Envie `/start` pro bot e use [@userinfobot](https://t.me/userinfobot), ou leia `message.chat.id` no webhook |
| `TELEGRAM_WEBHOOK_SECRET` | String aleatória (opcional, recomendado) |

Sem token configurado, o chat funciona no modo automático (ack + encerramento), sem notificação.

## Webhook (produção)

**Pré-requisitos no `.env`:**
- `TELEGRAM_BOT_TOKEN` — token do BotFather
- `TELEGRAM_CHAT_ID` — **número** do seu usuário (não o `@` do bot). Obtenha com `./scripts/telegram-get-chat-id.sh` depois de enviar `/start` pro bot
- `SITE_PUBLIC_ORIGIN=https://eduardodamasceno.com.br`
- `TELEGRAM_WEBHOOK_SECRET` — opcional; se definir, use o mesmo valor no registro do webhook

URL pública via Cloudflare Tunnel:

```bash
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=https://eduardodamasceno.com.br/api/chat/telegram/webhook" \
  -d "secret_token=${TELEGRAM_WEBHOOK_SECRET}"
```

Depois de alterar o `.env` (token, chat id ou secret):

```bash
./scripts/stack.sh up
./scripts/telegram-set-webhook.sh
```

O `stack.sh up` é **obrigatório** após mudar variáveis — o Docker não recarrega o `.env` sozinho.

## Fluxo

1. Visitante abre **Conversar** → sessão anônima (`sessionId` só na memória da aba).
2. Roteiro automático (3 mensagens) roda no browser.
3. Visitante envia mensagem → você recebe no Telegram: `Nova conversa #AB12` + texto.
4. Visitante envia mensagem → Telegram recebe notificação; site confirma recebimento e mantém o chat aberto.
5. **Responder no Telegram:** responda **em thread** → mensagem aparece no site (SSE) e status fica **Online** por 2 minutos.
6. **Encerrar:** `/fim` na thread apaga a sessão (comando do owner).
7. Fechar o painel no site → sessão apagada.

## Privacidade

- Sem cookie de identidade; `sessionId` não persiste no browser.
- Histórico apagado ao fechar ou após 24h (TTL).
- Dados em SQLite local (`chat_sessions`, `chat_messages`).

## API (interna)

| Método | Rota | Uso |
|--------|------|-----|
| POST | `/api/chat/sessions` | Criar sessão |
| GET | `/api/chat/sessions/:id/stream` | SSE |
| POST | `/api/chat/sessions/:id/messages` | Enviar mensagem |
| DELETE | `/api/chat/sessions/:id` | Fechar pelo visitante |
| POST | `/api/chat/telegram/webhook` | Webhook do Telegram |
