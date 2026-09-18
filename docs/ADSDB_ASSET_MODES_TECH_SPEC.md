# adsdb × creative 素材形式串接規格

版本：`v1.2.0`
適用 API：`POST /internal/generate-review`、`POST /internal/generate-formats`

## 目的

讓 `adsdb.bktsai.link` 可在送出 review 前指定素材形式，並讓同一個 `batchId` / `creativeId` 在 formats 階段沿用相同形式與標題。

## 新增參數

`POST /internal/generate-review` 的 `multipart/form-data` 支援三個選填欄位：

- `assetMode`：素材形式 enum。
  - `standard`：既有完整素材；預設值，省略時維持舊行為。
  - `text_card`：純字卡；系統直接以標題排版成 PNG，不呼叫圖片模型。
  - `image_headline`：AI 情境圖＋系統標題區塊；背景圖由圖片模型生成，標題由系統疊加。
- `assetHeadline`：要印在素材上的標題，選填，最多 120 字。
  - 有值：所有 review 候選與後續 formats 都使用此標題。
  - 省略或空字串：每一組候選使用該組系統產出的文案標題；選稿後，formats 會固定沿用已選候選的標題。
- `assetFontStyle`：系統疊字的繁中字體風格，選填。
  - `auto`：依候選版型自動搭配；預設值。
  - `bold_sans`：強力黑體。
  - `clean_sans`：俐落黑體。
  - `elegant_serif`：典雅明體。
  - `light_sans`：輕盈黑體。

不要把這三個欄位放進 `variantSelections`。它們是 review 根層欄位。

## Request 範例

```js
const form = new FormData();
form.append("productName", "LIHI 短網址");
form.append("useCaseId", "launch-2026-09");
form.append("useCaseTitle", "新品推廣");
form.append("benefitIds", JSON.stringify(["fast", "simple", "trackable"]));
form.append("benefitTitles", JSON.stringify(["設定快速", "操作簡單", "成效可追蹤"]));
form.append("logo", logoFile);

form.append("assetMode", "text_card");
form.append("assetHeadline", "五秒完成你的短網址");
form.append("assetFontStyle", "elegant_serif");

const response = await fetch(
  "https://creative.bktsai.link/internal/generate-review",
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  }
);
```

圖片＋標題模式只需改為：

```js
form.set("assetMode", "image_headline");
```

## Review response

每個 creative 會回傳實際套用的素材與字體設定：

```json
{
  "creativeId": "creative_001",
  "assetMode": "text_card",
  "assetFontStyle": "elegant_serif",
  "headline": "候選文案標題",
  "appliedParameters": {
    "assetMode": "text_card",
    "assetHeadline": "五秒完成你的短網址",
    "assetFontStyle": "elegant_serif"
  },
  "squareAsset": {
    "url": "https://creative.bktsai.link/assets/creative_001_1x1.png",
    "width": 1440,
    "height": 1440,
    "mimeType": "image/png"
  }
}
```

整合端應以 `appliedParameters.assetMode`、`assetHeadline`、`assetFontStyle` 作為實際套用值。傳入 `auto` 時，response 會回傳實際選中的具體字體。

## Formats request

`POST /internal/generate-formats` request schema 不變：

```json
{
  "batchId": "batch_...",
  "creativeId": "creative_001",
  "selectedPlatforms": ["facebook", "instagram"]
}
```

不要在 formats request 重送 `assetMode`、`assetHeadline` 或 `assetFontStyle`。伺服器會從已選定的 batch creative 延續設定，並在 response 的 `appliedParameters` 再次回傳。

## 模式行為

### `text_card`

- 不呼叫圖片模型，沒有圖片生成費用。
- 由系統從 6 組圖形背景與版型中選擇排版，不再只有單色底。
- 字體可指定；`auto` 會隨候選版型搭配不同字體。
- 圖面只放標題；若有 logo，會保留品牌識別位置。
- 各平台仍輸出原本尺寸，格式皆為 PNG。
- `creativeStyle`、`talent` 等既有欄位仍可傳入，但人物設定不會用於字卡渲染。

### `image_headline`

- 圖片模型只生成無字背景，並依指令把人物／產品放到標題安全區另一側。
- 有人物／手部時，標題改放獨立上方標題帶，圖片從標題帶下方開始，結構上保證不遮住人物；無人物時則比較左右上方影像複雜度，將標題放到較乾淨的一側。
- 系統在生成後疊加標題區，避免 AI 生成錯字、亂碼或不可讀文字。
- 標題固定最多兩行；過長時自動縮字並安全省略。
- `creativeStyle`、`talent`、`creativeProfile`、參考圖與細部設定照常生效。
- 各平台會依比例重新配置標題區，輸出 PNG。

### `standard`

- 完全維持既有素材流程。
- 舊版 adsdb 若不傳 `assetMode`，不需要任何修改即可繼續使用。

## adsdb 修改清單

1. 在素材設定 UI 新增 `assetMode` 選項，至少顯示「純字卡」與「圖片＋標題」；若保留既有模式，對應值為 `standard`。
2. 新增可選的標題輸入欄位，送出名稱必須是 `assetHeadline`，上限 120 字。
3. 新增字體選擇欄位 `assetFontStyle`；建議預設 `auto`。
4. 建立 review FormData 時加入這三個欄位。
5. review 畫面讀取並保存 `creative.assetMode`、`creative.assetFontStyle` 與 `creative.appliedParameters` 內三個對應值。
6. formats request 不新增欄位，只送既有 `batchId`、`creativeId`、`selectedPlatforms`。
7. 下載檔案時使用 response 的 `mimeType`；目前三種模式皆輸出 `image/png`。
8. 若 API 回 `400 INVALID_INPUT` 且 message 為 `assetMode is invalid` 或 `assetFontStyle is invalid`，應阻止送出並提示使用者重新選擇。

## 驗收案例

- 不傳 `assetMode`：行為與舊版一致，回傳 `standard`。
- `text_card`＋自訂 `assetHeadline`：三個 review 候選皆為 PNG 字卡，formats 沿用同一標題。
- `text_card` 不傳標題：每個 review 候選使用自己的生成標題；選定後 formats 固定該標題。
- `image_headline`＋自訂標題：背景圖沒有 AI 文字，系統標題清楚可讀。
- `image_headline`＋人物：標題最多兩行，且位於圖片上方的獨立標題帶，不與人物區重疊。
- `text_card`＋`assetFontStyle=elegant_serif`：review 與 formats 都維持明體。
- 非法 `assetMode`：HTTP 400，`error.code = INVALID_INPUT`。
- `assetHeadline` 超過 120 字：HTTP 400。
- 非法 `assetFontStyle`：HTTP 400，`error.code = INVALID_INPUT`。
