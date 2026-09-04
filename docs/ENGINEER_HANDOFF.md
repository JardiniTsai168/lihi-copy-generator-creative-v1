# Engineer Handoff

這份文件是給要把 `creative.bktsai.link` 接到 `lihi` 正式環境的工程師。

## GitHub Repo

- <https://github.com/JardiniTsai168/lihi-copy-generator-creative-v1>

## Live 架構

- app type: Node / Express bridge
- process entry: `bridge-server.js`
- static assets: `public/`
- image generation engine: `creative-engine.js`
- process manager: PM2
- reverse proxy: nginx

## 伺服器需要的檔案

把 repo clone 到例如：

```text
/var/www/creative-v1
```

live 最少要有：

```text
bridge-server.js
creative-engine.js
package.json
package-lock.json
public/
.env
```

## Node 版本

- 建議 Node.js `20.x`

## 安裝

```bash
cd /var/www/creative-v1
npm install --omit=dev --no-audit --no-fund
```

## 必要環境變數

請從 repo 的 `.env.example` 建立 `.env`。

live 至少要設定：

```dotenv
BRIDGE_PORT=3457
BRIDGE_ALLOWED_ORIGINS=https://creative.bktsai.link,https://adsdb.bktsai.link
PUBLIC_BASE_URL=https://creative.bktsai.link
INTERNAL_PUBLIC_BASE_URL=https://creative.bktsai.link

OPENAI_API_KEY=...
OPENAI_BASE_URL=https://openrouter.ai/api/v1/chat/completions
OPENAI_MODEL=qwen/qwen3.5-plus-02-15
```

如果前端或內部系統會帶金鑰，也可設定：

```dotenv
BRIDGE_API_KEY=...
```

## PM2

repo 已附範本：

- `deploy/pm2.creative-v1.config.cjs`

啟動：

```bash
pm2 start deploy/pm2.creative-v1.config.cjs
pm2 save
```

更新後重啟：

```bash
pm2 restart creative-v1 --update-env
```

## nginx

repo 已附範本：

- `deploy/nginx.creative-v1.conf`

核心概念是把：

- `creative.bktsai.link`

proxy 到：

- `127.0.0.1:3457`

## HTTPS

DNS 指到主機後，可用 certbot：

```bash
certbot --nginx -d creative.bktsai.link --non-interactive --agree-tos -m tony@lihi.io --redirect
```

## 快速部署

如果仍沿用目前的 DigitalOcean 佈署方式，可直接在 repo 根目錄執行：

```bash
./scripts/deploy-creative-live.sh
```

這支腳本預設會部署到：

- host: `copy-live-do`
- remote dir: `/var/www/creative-v1`
- pm2 app: `creative-v1`

也可改用環境變數覆蓋：

```bash
REMOTE_HOST=your-host REMOTE_DIR=/var/www/creative-v1 APP_NAME=creative-v1 ./scripts/deploy-creative-live.sh
```

## 驗證

### syntax check

```bash
node --check bridge-server.js
node --check creative-engine.js
node --check public/app.js
```

### tests

```bash
npm test
```

### health check

```bash
curl https://creative.bktsai.link/health
```

預期至少看到：

```json
{"ok":true}
```

## 交接備註

- 這個 repo 是 `creative` 分線，不要拿來覆蓋 `copy.bktsai.link`
- `scripts/deploy-live.sh` 會故意失敗，避免誤 deploy
- `adsdb.bktsai.link` 目前已列入 CORS allowlist，若搬環境請保留
