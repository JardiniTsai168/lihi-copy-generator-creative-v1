const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const creativeEngine = require("../creative-engine");

const modulePath = path.join(__dirname, "..", "bridge-server.js");
const KNOWN_CREATIVE_PROFILE_KEYS = new Set([
  "warm_family_dinner_v1",
  "offer_bold_conversion_v1",
  "luxury_editorial_hero_v1",
  "ugc_staff_demo_v1",
  "senior_trust_story_v1",
  "couple_gifting_moment_v1"
]);

function loadBridgeModule(env = {}) {
  const previousKey = process.env.BRIDGE_API_KEY;
  const previousAllowedOrigins = process.env.BRIDGE_ALLOWED_ORIGINS;
  const previousOpenAiKey = process.env.OPENAI_API_KEY;
  const previousOpenRouterKey = process.env.OPENROUTER_API_KEY;

  if (typeof env.BRIDGE_API_KEY === "string") {
    process.env.BRIDGE_API_KEY = env.BRIDGE_API_KEY;
  } else {
    delete process.env.BRIDGE_API_KEY;
  }

  if (typeof env.BRIDGE_ALLOWED_ORIGINS === "string") {
    process.env.BRIDGE_ALLOWED_ORIGINS = env.BRIDGE_ALLOWED_ORIGINS;
  } else {
    delete process.env.BRIDGE_ALLOWED_ORIGINS;
  }

  if (typeof env.OPENAI_API_KEY === "string") {
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  } else {
    delete process.env.OPENAI_API_KEY;
  }

  if (typeof env.OPENROUTER_API_KEY === "string") {
    process.env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
  } else {
    delete process.env.OPENROUTER_API_KEY;
  }

  delete require.cache[require.resolve(modulePath)];
  const bridge = require(modulePath);

  if (typeof previousKey === "string") {
    process.env.BRIDGE_API_KEY = previousKey;
  } else {
    delete process.env.BRIDGE_API_KEY;
  }

  if (typeof previousAllowedOrigins === "string") {
    process.env.BRIDGE_ALLOWED_ORIGINS = previousAllowedOrigins;
  } else {
    delete process.env.BRIDGE_ALLOWED_ORIGINS;
  }

  if (typeof previousOpenAiKey === "string") {
    process.env.OPENAI_API_KEY = previousOpenAiKey;
  } else {
    delete process.env.OPENAI_API_KEY;
  }

  if (typeof previousOpenRouterKey === "string") {
    process.env.OPENROUTER_API_KEY = previousOpenRouterKey;
  } else {
    delete process.env.OPENROUTER_API_KEY;
  }

  return bridge;
}

async function startServer(app) {
  return await new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
        origin: `https://127.0.0.1:${address.port}`
      });
    });
  });
}

async function stopServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function buildReviewForm(overrides = {}) {
  const form = new FormData();
  const defaults = {
    productName: "LIHI 輕養飲",
    useCaseId: "ugc-01",
    useCaseTitle: "快速理解產品亮點",
    benefitIds: JSON.stringify(["b1", "b2", "b3"]),
    benefitTitles: JSON.stringify(["好入口", "好理解", "好轉述"]),
    productLink: "https://example.com/product",
    additionalNotes: "請先用 internal stub 溝通版型"
  };

  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    if (value === undefined || value === null) {
      continue;
    }
    form.append(key, value);
  }

  if (!Object.prototype.hasOwnProperty.call(overrides, "logo")) {
    form.append(
      "logo",
      new Blob(
        ['<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#FF6B9D"/></svg>'],
        { type: "image/svg+xml" }
      ),
      "logo.svg"
    );
  } else if (overrides.logo) {
    form.append("logo", overrides.logo, overrides.logoName || "logo.svg");
  }

  if (overrides.productImage) {
    form.append("productImage", overrides.productImage, overrides.productImageName || "product.webp");
  }

  return form;
}

function assertAppliedSelectionMatchesResolvedMeta(creative) {
  const styleConfig = creativeEngine.getCreativeStyleConfig(creative.creativeStyle);
  const talentConfig = creativeEngine.getCreativeModelConfig(creative.talent);

  assert.ok(styleConfig?.variants?.composition?.includes(creative.appliedParameters.variantSelections.composition));
  assert.ok(styleConfig?.variants?.background?.includes(creative.appliedParameters.variantSelections.background));
  assert.ok(talentConfig?.variants?.framing?.includes(creative.appliedParameters.talentSelections.framing));
  assert.ok(talentConfig?.variants?.styling?.includes(creative.appliedParameters.talentSelections.styling));
}

function assertAppliedProfileMatchesPreset(creative) {
  assert.ok(KNOWN_CREATIVE_PROFILE_KEYS.has(creative.appliedParameters.creativeProfile));
  assert.equal(creative.creativeProfile, creative.appliedParameters.creativeProfile);
}

test("internal generate-review returns 3 creatives and asset urls", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl, origin } = await startServer(bridge.app);

  try {
    const response = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm()
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://jardinitsai168.github.io");
    assert.equal(payload.promptVersion, bridge.INTERNAL_PROMPT_VERSION);
    assert.equal(payload.creatives.length, 3);
    assert.equal(payload.creatives[0].creativeId, "creative_001");
    assert.deepEqual(payload.creatives[0].appliedParameters.benefits, ["好入口", "好理解", "好轉述"]);
    assert.ok(payload.creatives.every((creative) => typeof creative.stylePreset === "string" && creative.stylePreset));
    assert.ok(payload.creatives.every((creative) => typeof creative.creativeStyle === "string" && creative.creativeStyle));
    assert.ok(payload.creatives.every((creative) => typeof creative.talent === "string" && creative.talent));
    assert.ok(payload.creatives.every((creative) => ["brand", "conversion"].includes(creative.tone)));
    assert.ok(payload.creatives.every((creative) => Number.isInteger(creative.voiceBalance) && creative.voiceBalance >= 1 && creative.voiceBalance <= 5));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters));
    assert.ok(payload.creatives.every((creative) => Array.isArray(creative.appliedParameters.benefits)));
    assert.ok(payload.creatives.every((creative) => typeof creative.appliedParameters.stylePreset === "string" && creative.appliedParameters.stylePreset));
    assert.ok(payload.creatives.every((creative) => ["brand", "conversion"].includes(creative.appliedParameters.tone)));
    assert.ok(payload.creatives.every((creative) => Number.isInteger(creative.appliedParameters.voiceBalance)));
    assert.ok(payload.creatives.every((creative) => typeof creative.appliedParameters.creativeProfile === "string" && creative.appliedParameters.creativeProfile));
    assert.ok(payload.creatives.every((creative) => typeof creative.appliedParameters.creativeStyle === "string" && creative.appliedParameters.creativeStyle));
    assert.ok(payload.creatives.every((creative) => typeof creative.appliedParameters.talent === "string" && creative.appliedParameters.talent));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.variantSelections && typeof creative.appliedParameters.variantSelections === "object"));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.talentSelections && typeof creative.appliedParameters.talentSelections === "object"));
    assert.ok(payload.creatives.every((creative) => typeof creative.appliedParameters.variantSelections.composition === "string" && creative.appliedParameters.variantSelections.composition));
    assert.ok(payload.creatives.every((creative) => typeof creative.appliedParameters.variantSelections.background === "string" && creative.appliedParameters.variantSelections.background));
    assert.ok(payload.creatives.every((creative) => typeof creative.appliedParameters.talentSelections.framing === "string" && creative.appliedParameters.talentSelections.framing));
    assert.ok(payload.creatives.every((creative) => typeof creative.appliedParameters.talentSelections.styling === "string" && creative.appliedParameters.talentSelections.styling));
    assert.match(payload.creatives[0].squareAsset.url, /^http:\/\/127\.0\.0\.1:\d+\/assets\/creative_001_1x1\.png$/);

    const assetResponse = await fetch(payload.creatives[0].squareAsset.url);
    assert.equal(assetResponse.status, 200);
    assert.match(assetResponse.headers.get("content-type") || "", /^image\//);
  } finally {
    await stopServer(server);
  }
});

test("internal generate-review echoes resolved fine-grained selections when optional style fields are omitted", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl } = await startServer(bridge.app);

  try {
    const response = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm()
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.creatives.length, 3);
    assert.equal(new Set(payload.creatives.map((creative) => creative.appliedParameters.creativeProfile)).size, payload.creatives.length);
    payload.creatives.forEach(assertAppliedProfileMatchesPreset);
    payload.creatives.forEach(assertAppliedSelectionMatchesResolvedMeta);
  } finally {
    await stopServer(server);
  }
});

test("internal review planner uses controlled random mixes", async () => {
  const bridge = loadBridgeModule();
  const recipes = bridge.planInternalReviewRecipes(() => 0.37);

  assert.equal(recipes.length, 3);
  assert.equal(new Set(recipes.map((recipe) => recipe.creativeProfile)).size, 3);
  assert.ok(recipes.every((recipe) => KNOWN_CREATIVE_PROFILE_KEYS.has(recipe.creativeProfile)));
  assert.ok(recipes.every((recipe) => typeof recipe.stylePreset === "string" && recipe.stylePreset));
  assert.ok(recipes.every((recipe) => typeof recipe.talent === "string" && recipe.talent));
  assert.ok(recipes.every((recipe) => ["brand", "conversion"].includes(recipe.tone)));
  assert.ok(recipes.every((recipe) => Number.isInteger(recipe.voiceBalance) && recipe.voiceBalance >= 1 && recipe.voiceBalance <= 5));
  assert.ok(recipes.every((recipe) => recipe.modelSetting && recipe.modelSetting !== "產品主視覺"));
});

test("internal review planner respects supplied overrides", async () => {
  const bridge = loadBridgeModule();
  const recipes = bridge.planInternalReviewRecipes(() => 0.37, {
    stylePreset: "premium_brand",
    tone: "brand",
    voiceBalance: 2,
    creativeStyle: "luxury",
    talent: "family"
  });

  assert.equal(recipes.length, 3);
  assert.ok(recipes.every((recipe) => recipe.stylePreset === "premium_brand"));
  assert.ok(recipes.every((recipe) => recipe.tone === "brand"));
  assert.ok(recipes.every((recipe) => recipe.voiceBalance === 2));
  assert.ok(recipes.every((recipe) => recipe.creativeStyle === "luxury"));
  assert.ok(recipes.every((recipe) => recipe.talent === "family"));
  assert.ok(recipes.every((recipe) => recipe.modelSetting === "家庭互動模特兒"));
});

test("internal review planner applies creative profile presets", async () => {
  const bridge = loadBridgeModule();
  const recipes = bridge.planInternalReviewRecipes(() => 0.37, {
    creativeProfile: "ugc_staff_demo_v1"
  });

  assert.equal(recipes.length, 3);
  assert.ok(recipes.every((recipe) => recipe.creativeProfile === "ugc_staff_demo_v1"));
  assert.ok(recipes.every((recipe) => recipe.talent === "staff"));
  assert.ok(recipes.every((recipe) => recipe.creativeStyle === "clean"));
  assert.ok(recipes.every((recipe) => recipe.variantSelections.composition === "左文右圖"));
  assert.ok(recipes.every((recipe) => recipe.talentSelections.focus === "人物引導視線到產品"));
});

test("internal generate-formats returns facebook deliverables and ad copy bundles", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl, origin } = await startServer(bridge.app);

  try {
    const optionsResponse = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      }
    });

    assert.equal(optionsResponse.status, 204);
    assert.equal(optionsResponse.headers.get("access-control-allow-origin"), "https://jardinitsai168.github.io");

    const reviewResponse = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm()
    });
    const reviewPayload = await reviewResponse.json();

    const formatsResponse = await fetch(`${baseUrl}/internal/generate-formats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://jardinitsai168.github.io"
      },
      body: JSON.stringify({
        batchId: reviewPayload.batchId,
        creativeId: "creative_001",
        selectedPlatforms: ["Facebook"]
      })
    });
    const payload = await formatsResponse.json();

    assert.equal(formatsResponse.status, 200);
    assert.equal(payload.creativeId, "creative_001");
    assert.deepEqual(payload.appliedParameters.benefits, ["好入口", "好理解", "好轉述"]);
    assert.equal(typeof payload.appliedParameters.stylePreset, "string");
    assert.equal(typeof payload.appliedParameters.tone, "string");
    assert.equal(typeof payload.appliedParameters.voiceBalance, "number");
    assert.equal(typeof payload.appliedParameters.creativeProfile, "string");
    assert.equal(typeof payload.appliedParameters.creativeStyle, "string");
    assert.equal(typeof payload.appliedParameters.talent, "string");
    assert.equal(typeof payload.appliedParameters.variantSelections.composition, "string");
    assert.equal(typeof payload.appliedParameters.variantSelections.background, "string");
    assert.equal(typeof payload.appliedParameters.talentSelections.framing, "string");
    assert.equal(typeof payload.appliedParameters.talentSelections.styling, "string");
    assert.equal(payload.assetDeliverables.length, 3);
    assert.equal(payload.assetDeliverables[0].platform, "Facebook");
    assert.deepEqual(
      payload.assetDeliverables.map((item) => `${item.platform}:${item.aspectRatio}:${item.surface}`),
      [
        "Facebook:1:1:feed",
        "Facebook:4:5:feed",
        "Facebook:1.91:1:feed"
      ]
    );
    assert.equal(payload.copyDeliverables.meta_ad.destinationUrl, "https://example.com/product");
    assert.match(payload.copyDeliverables.meta_ad.primaryText, /\S/);
    assert.match(payload.copyDeliverables.google_ads.headline, /^1\.\s/m);
    assert.match(payload.copyDeliverables.google_ads.description, /^1\.\s/m);

    const assetResponse = await fetch(payload.assetDeliverables[0].url);
    assert.equal(assetResponse.status, 200);
    assert.match(assetResponse.headers.get("content-type") || "", /^image\//);
  } finally {
    await stopServer(server);
  }
});

test("internal generate-formats expands instagram into five deliverables", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl } = await startServer(bridge.app);

  try {
    const reviewResponse = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm()
    });
    const reviewPayload = await reviewResponse.json();

    const formatsResponse = await fetch(`${baseUrl}/internal/generate-formats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://jardinitsai168.github.io"
      },
      body: JSON.stringify({
        batchId: reviewPayload.batchId,
        creativeId: "creative_001",
        selectedPlatforms: ["Instagram"]
      })
    });
    const payload = await formatsResponse.json();

    assert.equal(formatsResponse.status, 200);
    assert.deepEqual(payload.appliedParameters.benefits, ["好入口", "好理解", "好轉述"]);
    assert.equal(payload.assetDeliverables.length, 5);
    assert.deepEqual(
      payload.assetDeliverables.map((item) => `${item.platform}:${item.aspectRatio}:${item.surface}`),
      [
        "Instagram:1:1:feed",
        "Instagram:4:5:feed",
        "IG Reels:9:16:reels",
        "IG Stories:9:16:stories",
        "Instagram:1.91:1:feed"
      ]
    );
    assert.equal(payload.copyDeliverables.meta_ad.destinationUrl, "https://example.com/product");
    assert.equal(payload.copyDeliverables.google_ads.destinationUrl, "https://example.com/product");
  } finally {
    await stopServer(server);
  }
});

test("internal generate-review accepts explicit recipe overrides", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl } = await startServer(bridge.app);

  try {
    const response = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm({
        stylePreset: "premium_brand",
        tone: "conversion",
        voiceBalance: "5",
        creativeStyle: "luxury",
        talent: "family"
      })
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(payload.creatives.every((creative) => creative.stylePreset === "premium_brand"));
    assert.ok(payload.creatives.every((creative) => creative.tone === "conversion"));
    assert.ok(payload.creatives.every((creative) => creative.voiceBalance === 5));
    assert.ok(payload.creatives.every((creative) => creative.creativeStyle === "luxury"));
    assert.ok(payload.creatives.every((creative) => creative.talent === "family"));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.stylePreset === "premium_brand"));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.tone === "conversion"));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.voiceBalance === 5));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.creativeStyle === "luxury"));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.talent === "family"));
    assert.ok(payload.creatives.every((creative) => creative.deliveryNote.includes("高級品牌版")));
    assert.ok(payload.creatives.every((creative) => creative.deliveryNote.includes("家庭互動模特兒")));
    assert.ok(payload.creatives.every((creative) => creative.deliveryNote.includes("轉單型")));
  } finally {
    await stopServer(server);
  }
});

test("internal generate-review accepts creativeProfile and fine-grained selection overrides", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl } = await startServer(bridge.app);

  try {
    const response = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm({
        creativeProfile: "ugc_staff_demo_v1",
        variantSelections: JSON.stringify({
          composition: "右文左圖",
          background: "紙張質感背景"
        }),
        talentSelections: JSON.stringify({
          framing: "半身示範入鏡",
          styling: "品牌感制服元素"
        })
      })
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(payload.creatives.every((creative) => creative.creativeProfile === "ugc_staff_demo_v1"));
    assert.ok(payload.creatives.every((creative) => creative.talent === "staff"));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.creativeProfile === "ugc_staff_demo_v1"));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.variantSelections.composition === "右文左圖"));
    assert.ok(payload.creatives.every((creative) => creative.appliedParameters.talentSelections.styling === "品牌感制服元素"));
    assert.ok(payload.creatives.every((creative) => creative.deliveryNote.includes("專人示範說明版")));
  } finally {
    await stopServer(server);
  }
});

test("internal generate-review rejects invalid recipe overrides", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl } = await startServer(bridge.app);

  try {
    const response = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm({
        stylePreset: "not_real_style"
      })
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "INVALID_INPUT");
    assert.equal(payload.error.message, "stylePreset is invalid");
  } finally {
    await stopServer(server);
  }
});

test("internal generate-review rejects unsupported variant selection values", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl } = await startServer(bridge.app);

  try {
    const response = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm({
        creativeProfile: "ugc_staff_demo_v1",
        variantSelections: JSON.stringify({
          composition: "not-a-real-option"
        })
      })
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "INVALID_INPUT");
    assert.equal(payload.error.message, "variantSelections contains unsupported value for 'composition'");
  } finally {
    await stopServer(server);
  }
});

test("internal generate-review validates required logo file", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl, origin } = await startServer(bridge.app);

  try {
    const response = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm({ logo: null })
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(payload, {
      error: {
        code: "INVALID_INPUT",
        message: "logo file is required"
      }
    });
  } finally {
    await stopServer(server);
  }
});

test("internal generate-review rejects unsupported product image file types", async () => {
  const bridge = loadBridgeModule({
    BRIDGE_ALLOWED_ORIGINS: "https://jardinitsai168.github.io",
    OPENAI_API_KEY: "",
    OPENROUTER_API_KEY: ""
  });
  const { server, baseUrl, origin } = await startServer(bridge.app);

  try {
    const response = await fetch(`${baseUrl}/internal/generate-review`, {
      method: "POST",
      headers: {
        Origin: "https://jardinitsai168.github.io"
      },
      body: buildReviewForm({
        productImage: new Blob(["<svg></svg>"], { type: "image/svg+xml" }),
        productImageName: "product.svg"
      })
    });
    const payload = await response.json();

    assert.equal(response.status, 415);
    assert.deepEqual(payload, {
      error: {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "productImage file format is not supported"
      }
    });
  } finally {
    await stopServer(server);
  }
});

test("internal asset storage rejects mock fallback assets when image API keys are configured", () => {
  const bridge = loadBridgeModule();

  assert.throws(
    () => bridge.assertInternalCreativeAssetReady(
      {
        imageUrl: "data:image/svg+xml;charset=UTF-8,%3Csvg%3E%3C%2Fsvg%3E",
        mode: "mock",
        warning: "upstream image provider failed"
      },
      { requireLiveAsset: true }
    ),
    /creative_asset_generation_failed:upstream image provider failed/
  );
});
