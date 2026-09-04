const test = require("node:test");
const assert = require("node:assert/strict");

const creativeEngine = require("../creative-engine");

test("creative engine exposes the remaining image model label", () => {
  assert.equal(
    creativeEngine.getCreativeImageModelLabel("openai/gpt-5.4-image-2"),
    "GPT-5.4 Image 2"
  );
});

test("creative engine resolves the GPT image model and normalizes unknown values", () => {
  const config = creativeEngine.resolveCreativeImageModelConfig("openai/gpt-5.4-image-2");

  assert.equal(config.kind, "image");
  assert.equal(config.resolution, undefined);
  assert.equal(
    creativeEngine.normalizeCreativeImageModel("not-a-real-model"),
    "openai/gpt-5.4-image-2"
  );
});

test("creative prompt keeps soft guidance and traditional Chinese constraint", () => {
  const prompt = creativeEngine.buildCreativePrompt({
    productName: "南瓜濃湯",
    primaryCopy: "這是一段主文案",
    platform: "facebook",
    source: {
      title: "暖胃也暖心",
      body: "濃郁南瓜香氣，加熱後就能快速上桌。",
      cta: "立即了解",
      benefits: ["濃郁南瓜香氣", "加熱快速上桌", "日常補給更方便"]
    },
    config: {
      style: "warm",
      variantSelections: {
        composition: "餐桌感置中構圖",
        background: "木質桌面背景",
        color: "奶油白 + 淺木色",
        lighting: "晨光感自然光",
        camera: "平視生活視角",
        surfaceMaterial: "棉麻布料感",
        accents: "杯盤餐具",
        textLayout: "左上角安靜排版",
        typographyMood: "手感溫柔無襯線",
        pacing: "節奏溫柔留白"
      },
      talent: "none",
      talentSelections: {
        presence: "產品搭配少量道具",
        framing: "產品偏左留文案區",
        interaction: "僅保留桌面生活感",
        styling: "生活靜物感"
      }
    }
  });

  assert.match(prompt, /文案 -\n這是一段主文案\n\n立即了解/);
  assert.match(prompt, /圖片的任務是先吸引注意/);
  assert.match(prompt, /請只使用繁體中文，不要使用簡體中文/);
  assert.match(prompt, /本次變體請採用以下組合：/);
  assert.match(prompt, /- 構圖：餐桌感置中構圖/);
  assert.match(prompt, /- 背景：木質桌面背景/);
  assert.match(prompt, /- 鏡頭視角：平視生活視角/);
  assert.match(prompt, /- 材質語感：棉麻布料感/);
  assert.match(prompt, /- 字體情緒：手感溫柔無襯線/);
  assert.match(prompt, /- 視覺節奏：節奏溫柔留白/);
  assert.match(prompt, /本次模特兒變體請採用以下組合：/);
  assert.match(prompt, /- 出現方式：產品搭配少量道具/);
  assert.match(prompt, /- 人物鏡位：產品偏左留文案區/);
  assert.match(prompt, /圖上不能只有產品名或一句空泛標題，至少要放 2 到 3 個和賣點相關的短文案/);
  assert.match(prompt, /建議優先使用以下賣點：/);
  assert.match(prompt, /1\. 濃郁南瓜香氣/);
  assert.equal(prompt.includes("不要出現平台 logo、Facebook logo"), false);
  assert.equal(prompt.includes("最多只保留一句很短的主標"), false);
  assert.equal(prompt.includes("產品名稱："), false);
  assert.equal(prompt.includes("主標重點："), false);
  assert.equal(prompt.includes("文案內容："), false);
  assert.equal(prompt.includes("暖胃也暖心"), false);
  assert.equal(prompt.includes("標題 - "), false);
  assert.equal(prompt.includes("內容 - "), false);
  assert.equal(prompt.includes("CTA - "), false);
  assert.equal(prompt.includes("請保留清楚標題層級、品牌感與廣告可讀性"), false);
  assert.equal(prompt.includes("如果畫面包含文字，請優先確保主標可讀"), false);
});

test("creative prompt includes uploaded logo and product reference guidance", () => {
  const prompt = creativeEngine.buildCreativePrompt({
    productName: "南瓜濃湯",
    primaryCopy: "這是一段主文案",
    platform: "facebook",
    references: {
      logo: {
        dataUrl: "data:image/png;base64,AAA",
        name: "brand-logo.png",
        mimeType: "image/png"
      },
      product: {
        dataUrl: "data:image/webp;base64,BBB",
        name: "product.webp",
        mimeType: "image/webp"
      }
    },
    source: {
      title: "暖胃也暖心",
      body: "濃郁南瓜香氣，加熱後就能快速上桌。",
      cta: "立即了解",
      benefits: ["濃郁南瓜香氣", "加熱快速上桌", "日常補給更方便"]
    },
    config: {
      style: "warm",
      talent: "none"
    }
  });

  assert.match(prompt, /有提供產品圖參考/);
  assert.match(prompt, /有提供 logo 參考/);
});

test("creative engine forwards uploaded references to OpenRouter image API", async () => {
  let capturedBody = null;
  const result = await creativeEngine.generateCreativeAsset(
    {
      productName: "南瓜濃湯",
      primaryCopy: "這是一段主文案",
      platform: "facebook",
      references: {
        logo: {
          dataUrl: "data:image/png;base64,AAA",
          name: "brand-logo.png",
          mimeType: "image/png"
        },
        product: {
          dataUrl: "data:image/webp;base64,BBB",
          name: "product.webp",
          mimeType: "image/webp"
        }
      },
      source: {
        title: "暖胃也暖心",
        body: "濃郁南瓜香氣，加熱後就能快速上桌。",
        cta: "立即了解",
        benefits: ["濃郁南瓜香氣", "加熱快速上桌", "日常補給更方便"]
      },
      config: {
        style: "warm",
        talent: "none"
      }
    },
    {
      apiKey: "test-key",
      fetchImpl: async (_url, options) => {
        capturedBody = JSON.parse(String(options.body || "{}"));
        return {
          ok: true,
          text: async () => JSON.stringify({
            data: [{ b64_json: "ZmFrZQ==", media_type: "image/png" }],
            usage: { cost: 0.01 }
          })
        };
      }
    }
  );

  assert.equal(Array.isArray(capturedBody.input_references), true);
  assert.equal(capturedBody.input_references.length, 2);
  assert.equal(capturedBody.input_references[0].image_url.url, "data:image/webp;base64,BBB");
  assert.equal(capturedBody.input_references[1].image_url.url, "data:image/png;base64,AAA");
  assert.equal(result.mode, "live");
});

test("creative engine rasterizes svg logo references before sending to OpenRouter", async () => {
  let capturedBody = null;
  const result = await creativeEngine.generateCreativeAsset(
    {
      productName: "南瓜濃湯",
      primaryCopy: "這是一段主文案",
      platform: "facebook",
      references: {
        logo: {
          dataUrl: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22%23FF6B9D%22%2F%3E%3C%2Fsvg%3E",
          name: "brand-logo.svg",
          mimeType: "image/svg+xml"
        }
      },
      source: {
        title: "暖胃也暖心",
        body: "濃郁南瓜香氣，加熱後就能快速上桌。",
        cta: "立即了解",
        benefits: ["濃郁南瓜香氣", "加熱快速上桌", "日常補給更方便"]
      },
      config: {
        style: "warm",
        talent: "none"
      }
    },
    {
      apiKey: "test-key",
      fetchImpl: async (_url, options) => {
        capturedBody = JSON.parse(String(options.body || "{}"));
        return {
          ok: true,
          text: async () => JSON.stringify({
            data: [{ b64_json: "ZmFrZQ==", media_type: "image/png" }],
            usage: { cost: 0.01 }
          })
        };
      }
    }
  );

  assert.equal(Array.isArray(capturedBody.input_references), true);
  assert.equal(capturedBody.input_references.length, 1);
  assert.match(capturedBody.input_references[0].image_url.url, /^data:image\/png;base64,/);
  assert.equal(result.mode, "live");
});

test("luxury style prompt supports variable compositions and backgrounds", () => {
  const prompt = creativeEngine.buildCreativePrompt({
    productName: "精品保養",
    primaryCopy: "高質感保養體驗",
    platform: "facebook",
    source: {
      title: "精緻保養",
      body: "細緻質地與高級氛圍。",
      cta: "立即了解",
      benefits: ["細緻質地", "高級氛圍", "日常保養更有儀式感"]
    },
    config: {
      style: "luxury",
      variantSelections: {
        composition: "精品櫥窗式構圖",
        background: "石材或礦物質感背景",
        color: "墨綠 + 金米色",
        lighting: "柔和棚拍光",
        camera: "中景櫥窗視角",
        surfaceMaterial: "石材檯面感",
        accents: "幾何底座",
        textLayout: "右下角小面積資訊區",
        typographyMood: "字距拉開的品牌感",
        pacing: "節奏像品牌 KV"
      },
      talent: "none",
      talentSelections: {
        presence: "產品搭配包裝陳列",
        framing: "中景完整展示",
        interaction: "僅保留包裝與內容物關係",
        styling: "品牌展示櫥窗感"
      }
    }
  });

  assert.match(prompt, /- 構圖：精品櫥窗式構圖/);
  assert.match(prompt, /- 背景：石材或礦物質感背景/);
  assert.match(prompt, /同一風格下請優先做出和常見結果不同的變體/);
  assert.match(prompt, /不要預設做成全黑或近黑畫面/);
  assert.match(prompt, /不要整張落成黑底/);
});

test("bold style prompt no longer defaults to black backgrounds", () => {
  const prompt = creativeEngine.buildCreativePrompt({
    productName: "機能飲",
    primaryCopy: "快速補給、視覺搶眼、第一眼就停住。",
    platform: "facebook",
    source: {
      title: "補給快一點",
      body: "快速補給、口感俐落、隨手好帶。",
      cta: "立即了解",
      benefits: ["快速補給", "隨手好帶", "口感俐落"]
    },
    config: {
      style: "bold",
      talent: "none",
      talentSelections: {
        presence: "產品搭配靜物配件",
        framing: "近距離局部特寫",
        interaction: "僅保留場景暗示",
        styling: "商品棚拍感"
      },
      variantSelections: {
        composition: "大字主標 + 側邊產品",
        background: "亮色漸層背景",
        color: "品牌粉 + 明黃",
        lighting: "強聚焦 spotlight",
        camera: "動態斜切視角",
        surfaceMaterial: "發光玻璃感",
        accents: "高對比色塊",
        textLayout: "標題置中放大",
        typographyMood: "超粗黑體衝擊感",
        pacing: "節奏爆點明確"
      }
    }
  });

  assert.match(prompt, /高轉換不等於全黑畫面/);
  assert.match(prompt, /- 背景：亮色漸層背景/);
  assert.match(prompt, /- 色彩：品牌粉 \+ 明黃/);
  assert.match(prompt, /- 鏡頭視角：動態斜切視角/);
  assert.match(prompt, /- 材質語感：發光玻璃感/);
  assert.match(prompt, /不要整張默認落成黑底/);
});

test("saas style prompt keeps product UI and workflow language", () => {
  const prompt = creativeEngine.buildCreativePrompt({
    productName: "TeamFlow",
    primaryCopy: "把任務、流程、協作進度整理在同一個工作台。",
    platform: "facebook",
    source: {
      title: "流程更清楚",
      body: "任務追蹤、協作同步、跨部門流程整理更有效率。",
      cta: "立即了解",
      benefits: ["任務追蹤更清楚", "跨部門協作同步", "流程整理更有效率"]
    },
    config: {
      style: "saas",
      talent: "none",
      talentSelections: {
        presence: "純產品主視覺",
        framing: "產品偏左留文案區",
        interaction: "僅保留場景暗示",
        styling: "編排式產品介紹感"
      },
      variantSelections: {
        composition: "左文右 UI",
        background: "藍白漸層數位背景",
        color: "深藍 + 白色 + 品牌粉點綴",
        lighting: "乾淨數位棚光",
        camera: "正視角 UI 展示",
        surfaceMaterial: "玻璃morphism 面板感",
        accents: "圖表與 KPI 模組",
        textLayout: "左側賣點清單 + 右側 dashboard",
        typographyMood: "成熟 SaaS landing page 感",
        pacing: "節奏先問題後解法"
      }
    }
  });

  assert.match(prompt, /視覺風格：SaaS 服務版/);
  assert.match(prompt, /dashboard、產品畫面、功能模組、數據卡片、流程步驟或 UI mockup/);
  assert.match(prompt, /- 構圖：左文右 UI/);
  assert.match(prompt, /- 文字版位：左側賣點清單 \+ 右側 dashboard/);
  assert.match(prompt, /請明確讓畫面看起來像 SaaS 產品或數位服務/);
});

test("editorial is removed and unknown styles fall back to clean", () => {
  assert.equal(creativeEngine.normalizeCreativeStyle("editorial"), "clean");
  assert.equal(creativeEngine.getCreativeStyleLabel("editorial"), "清爽產品感");
});

test("creative engine can resolve random variant selections", () => {
  const selections = creativeEngine.resolveCreativeVariantSelections("clean");

  assert.ok(selections.composition);
  assert.ok(selections.background);
  assert.ok(selections.color);
  assert.ok(selections.lighting);
  assert.ok(selections.camera);
  assert.ok(selections.surfaceMaterial);
  assert.ok(selections.accents);
  assert.ok(selections.textLayout);
  assert.ok(selections.typographyMood);
  assert.ok(selections.pacing);
});

test("creative engine can resolve random talent selections", () => {
  const adult = creativeEngine.resolveCreativeTalentSelections("adult");
  const family = creativeEngine.resolveCreativeTalentSelections("family");
  const hand = creativeEngine.resolveCreativeTalentSelections("hand");
  const none = creativeEngine.resolveCreativeTalentSelections("none");

  assert.ok(adult.persona);
  assert.ok(adult.gaze);
  assert.ok(family.grouping);
  assert.ok(family.focus);
  assert.ok(hand.handType);
  assert.ok(hand.pace);
  assert.ok(none.presence);
  assert.ok(none.styling);
});

test("adult talent prompt includes persona and action details", () => {
  const prompt = creativeEngine.buildCreativePrompt({
    productName: "機能飲",
    primaryCopy: "快速補給也要看起來有精神。",
    platform: "facebook",
    source: {
      title: "補給快一點",
      body: "快速補給、隨手好帶。",
      cta: "立即了解",
      benefits: ["快速補給", "隨手好帶", "口感俐落"]
    },
    config: {
      style: "bold",
      talent: "adult",
      variantSelections: {
        composition: "大字主標 + 側邊產品",
        background: "亮色漸層背景",
        color: "品牌粉 + 明黃",
        lighting: "強聚焦 spotlight",
        camera: "動態斜切視角",
        surfaceMaterial: "發光玻璃感",
        accents: "高對比色塊",
        textLayout: "標題置中放大",
        typographyMood: "超粗黑體衝擊感",
        pacing: "節奏爆點明確"
      },
      talentSelections: {
        persona: "都會上班族",
        framing: "半身入鏡",
        action: "拿著產品觀看",
        emotion: "清爽有精神",
        styling: "俐落都會感穿搭",
        gaze: "看向產品"
      }
    }
  });

  assert.match(prompt, /模特兒設定：生活感模特兒/);
  assert.match(prompt, /- 角色感：都會上班族/);
  assert.match(prompt, /- 人物動作：拿著產品觀看/);
  assert.match(prompt, /- 人物情緒：清爽有精神/);
  assert.match(prompt, /- 視線方向：看向產品/);
});

test("hand talent prompt includes hand-specific detail", () => {
  const prompt = creativeEngine.buildCreativePrompt({
    productName: "保養油",
    primaryCopy: "細節質感要被看見。",
    platform: "facebook",
    source: {
      title: "細節更到位",
      body: "輕鬆保養、質地細緻。",
      cta: "立即了解",
      benefits: ["質地細緻", "輕鬆保養", "日常使用方便"]
    },
    config: {
      style: "luxury",
      talent: "hand",
      variantSelections: {
        composition: "近景產品特寫",
        background: "石材或礦物質感背景",
        color: "石材灰 + 玫瑰粉",
        lighting: "側光高級質感",
        camera: "側拍材質特寫",
        surfaceMaterial: "磨砂玻璃感",
        accents: "半透明材質切片",
        textLayout: "右下角小面積資訊區",
        typographyMood: "低調壓印感短句",
        pacing: "節奏先材質後賣點"
      },
      talentSelections: {
        handType: "雙手捧持",
        framing: "近距離手部特寫",
        action: "輕觸產品細節",
        styling: "保養感細緻手部",
        pace: "高級展示感"
      }
    }
  });

  assert.match(prompt, /模特兒設定：只出現手部互動/);
  assert.match(prompt, /- 手部形式：雙手捧持/);
  assert.match(prompt, /- 人物鏡位：近距離手部特寫/);
  assert.match(prompt, /- 人物動作：輕觸產品細節/);
  assert.match(prompt, /- 手部節奏：高級展示感/);
});

test("creative engine resolves benefit points from explicit benefits first", () => {
  const prompt = creativeEngine.buildCreativePrompt({
    productName: "葉黃素",
    primaryCopy: "日常保養更輕鬆。",
    platform: "facebook",
    source: {
      title: "清楚補給",
      body: "補給更輕鬆。",
      cta: "立即了解",
      benefits: ["專利葉黃素", "小顆好吞", "日常補給方便"]
    },
    config: {
      style: "clean",
      talent: "none",
      talentSelections: {
        presence: "純產品主視覺",
        framing: "產品單獨置中",
        interaction: "無人物互動",
        styling: "極簡陳列感"
      },
      variantSelections: {
        composition: "置中單品 hero",
        background: "純淺色留白背景",
        color: "品牌粉 + 米白",
        lighting: "明亮自然光",
        camera: "正視角平衡構圖",
        surfaceMaterial: "霧面紙感",
        accents: "無額外元素極簡",
        textLayout: "左上",
        typographyMood: "俐落無襯線科技感",
        pacing: "節奏輕快清楚"
      }
    }
  });

  assert.match(prompt, /1\. 專利葉黃素/);
  assert.match(prompt, /2\. 小顆好吞/);
  assert.match(prompt, /3\. 日常補給方便/);
});

test("creative engine can generate with GPT-5.4 Image 2", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options: JSON.parse(options.body) });

    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({
          data: [
            {
              b64_json: "ZmFrZQ==",
              media_type: "image/png"
            }
          ],
          usage: { image_count: 1 }
        });
      }
    };
  };

  const asset = await creativeEngine.generateCreativeAsset(
    {
      productName: "南瓜濃湯",
      primaryCopy: "暖胃也暖心的日常補給。",
      platform: "facebook",
      source: {
        title: "暖胃也暖心",
        body: "濃郁南瓜香氣，加熱後就能快速上桌。",
        cta: "立即了解"
      },
      config: {
        style: "warm",
        talent: "none",
        imageModel: "openai/gpt-5.4-image-2"
      }
    },
    {
      apiKey: "test-key",
      fetchImpl
    }
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.model, "openai/gpt-5.4-image-2");
  assert.equal(calls[0].options.resolution, "512");
  assert.equal(asset.mode, "live");
  assert.equal(asset.provider, "openrouter-image");
  assert.equal(asset.imageModel, "openai/gpt-5.4-image-2");
  assert.equal(asset.renderModel, "openai/gpt-5.4-image-2");
  assert.equal(asset.orchestratorModel, "");
  assert.match(asset.imageUrl, /^data:image\/png;base64,/);
});

test("creative engine returns mock fallback with warning when image provider fails", async () => {
  const asset = await creativeEngine.generateCreativeAsset(
    {
      productName: "南瓜濃湯",
      primaryCopy: "暖胃也暖心的日常補給。",
      platform: "instagram",
      source: {
        title: "暖胃也暖心",
        body: "濃郁南瓜香氣，加熱後就能快速上桌。",
        cta: "立即了解"
      },
      config: {
        style: "warm",
        talent: "none",
        imageModel: "openai/gpt-5.4-image-2"
      }
    },
    {
      apiKey: "test-key",
      fetchImpl: async () => ({
        ok: false,
        status: 502,
        async text() {
          return JSON.stringify({
            error: {
              message: "upstream image provider failed"
            }
          });
        }
      })
    }
  );

  assert.equal(asset.mode, "mock");
  assert.equal(asset.provider, "creative-fallback");
  assert.equal(asset.warning, "upstream image provider failed");
  assert.match(asset.imageUrl, /^data:image\/svg\+xml;charset=UTF-8,/);
});

test("google ads creative uses a supported API ratio and returns a 1.91:1 framed image", async () => {
  const calls = [];
  const fetchImpl = async (_url, options) => {
    calls.push(JSON.parse(options.body));

    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({
          data: [
            {
              b64_json: "ZmFrZQ==",
              media_type: "image/png"
            }
          ],
          usage: { image_count: 1 }
        });
      }
    };
  };

  const asset = await creativeEngine.generateCreativeAsset(
    {
      productName: "機能飲",
      primaryCopy: "快速補給，畫面清楚，適合橫幅廣告。",
      platform: "google_ads",
      source: {
        title: "補給快一點",
        body: "快速補給、隨手好帶、重點清楚。",
        cta: "立即了解",
        benefits: ["快速補給", "隨手好帶", "重點清楚"]
      },
      config: {
        style: "bold",
        talent: "none",
        imageModel: "openai/gpt-5.4-image-2"
      }
    },
    {
      apiKey: "test-key",
      fetchImpl
    }
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].aspect_ratio, "16:9");
  assert.match(asset.imageUrl, /^data:image\/svg\+xml;charset=UTF-8,/);
  assert.match(decodeURIComponent(asset.imageUrl), /width="1200" height="628"/);
  assert.match(decodeURIComponent(asset.imageUrl), /preserveAspectRatio="xMidYMid slice"/);
});

test("instagram creative uses a supported API ratio and returns a 4:5 framed image", async () => {
  const calls = [];
  const fetchImpl = async (_url, options) => {
    calls.push(JSON.parse(options.body));

    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({
          data: [
            {
              b64_json: "ZmFrZQ==",
              media_type: "image/png"
            }
          ],
          usage: { image_count: 1 }
        });
      }
    };
  };

  const asset = await creativeEngine.generateCreativeAsset(
    {
      productName: "品牌禮盒",
      primaryCopy: "需要 4:5 成品，但上游先用相容比例生圖。",
      platform: "instagram",
      source: {
        title: "品牌感更清楚",
        body: "用相容比例生成後再裁成 4:5，避免 provider 拒收。",
        cta: "立即了解",
        benefits: ["品牌辨識清楚", "畫面閱讀清楚", "建立信任感"]
      },
      config: {
        style: "clean",
        talent: "none",
        imageModel: "openai/gpt-5.4-image-2"
      }
    },
    {
      apiKey: "test-key",
      fetchImpl
    }
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].aspect_ratio, "3:4");
  assert.match(asset.imageUrl, /^data:image\/svg\+xml;charset=UTF-8,/);
  assert.match(decodeURIComponent(asset.imageUrl), /width="1440" height="1800"/);
  assert.match(decodeURIComponent(asset.imageUrl), /preserveAspectRatio="xMidYMid slice"/);
});
