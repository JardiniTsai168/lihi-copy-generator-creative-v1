# creative.bktsai.link

`creative.bktsai.link` 的獨立 repo，提供：

- creative studio 前端
- Node / Express bridge API
- creative image engine
- DigitalOcean + PM2 live deploy 腳本

這個 repo 已經和 `copy.bktsai.link` 分線。請不要再用它部署 `copy` 線。

## Repo

- GitHub: <https://github.com/JardiniTsai168/lihi-copy-generator-creative-v1>
- Local: `/Users/tonytsai/.openclaw/workspace-lihi-copy-generator-creative-v1`

## 專案結構

```text
public/                      creative 前端
bridge-server.js             live bridge API
creative-engine.js           素材圖生成邏輯
tests/                       Node test suite
scripts/deploy-creative-live.sh
deploy/nginx.creative-v1.conf
deploy/pm2.creative-v1.config.cjs
docs/ENGINEER_HANDOFF.md
```

## 本機開發

```bash
npm install
cp .env.example .env
npm run bridge:start
```

預設 bridge port 是 `3456`。

## 測試

```bash
npm test
```

## 主要 API

### `POST /generate-copy`

產生文案主稿。

### `POST /format-copy`

把主稿展開成 channel deliverables。

### `POST /generate-creative`

直接產一張素材圖。

### `POST /internal/generate-review`

產出 3 組 creative review 候選。

支援 override：

```json
{
  "stylePreset": "premium_brand",
  "tone": "brand",
  "voiceBalance": 2,
  "creativeStyle": "luxury",
  "talent": "family"
}
```

每個 creative 都會回傳 `appliedParameters`。

### `POST /internal/generate-formats`

依選定平台展開格式與素材尺寸，根層也會回傳 `appliedParameters`。

## 部署

### 推到 live

```bash
./scripts/deploy-creative-live.sh
```

先做 dry run：

```bash
./scripts/deploy-creative-live.sh --dry-run
```

這支腳本會：

- 備份遠端目前的 `bridge-server.js`、`creative-engine.js`、`package*.json`、`public/`
- 同步本 repo 的 `public/`
- 同步 `bridge-server.js`、`creative-engine.js`、`package*.json`
- 在遠端執行 `npm install --omit=dev`
- `pm2 restart creative-v1 --update-env`

### 禁止誤 deploy 到 copy

```bash
./scripts/deploy-live.sh
```

這支腳本會直接拒絕執行，避免把 creative repo 部署到 `copy.bktsai.link`。

## 工程師交接

請直接看 [docs/ENGINEER_HANDOFF.md](docs/ENGINEER_HANDOFF.md)。

內容包含：

- 伺服器上需要存在的檔案
- `.env` 需求
- PM2 設定
- nginx reverse proxy 範本
- live 驗證步驟

## AI Agent API 文件

需要讓 AI agent 呼叫文案與素材 API 時，請看 [docs/AI_AGENT_API_GUIDE.md](docs/AI_AGENT_API_GUIDE.md)。

內容包含：

- 推薦的 review → formats 兩段式流程
- 認證與 secret 安全規則
- request / response schema 與 Node.js 範例
- 素材暫存生命週期、錯誤處理與重試策略

## 備註

- `.openclaw/`、`.runtime/`、`memory/` 與各 workspace 檔案都不是產品交付內容。
- `server.js` / `src/worker.js` 保留做本地或舊流程相容；`creative.bktsai.link` live 主要由 `bridge-server.js` 提供。

## License

MIT
