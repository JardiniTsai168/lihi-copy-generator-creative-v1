const APP_VERSION = "2026-08-24-creative-profile-presets-v1";
const STORAGE_KEY = `lihi-copy-last-run:${APP_VERSION}`;
const appConfig = window.APP_CONFIG || {};
const GENERATE_COPY_TIMEOUT_MS = 120000;
const FORMAT_COPY_TIMEOUT_MS = 45000;
const GENERATE_CREATIVE_TIMEOUT_MS = 45000;
const GENERATE_CREATIVE_SLOW_MODEL_TIMEOUT_MS = 120000;
const CREATIVE_REFERENCE_MAX_EDGE = 1400;
const CREATIVE_REFERENCE_MAX_DATA_URL_LENGTH = 1200000;
const CREATIVE_REFERENCE_INITIAL_QUALITY = 0.9;
const CREATIVE_REFERENCE_MIN_QUALITY = 0.55;
const DOMAIN_PRESET_BASES = {
  "copy.bktsai.link": "https://copy.bktsai.link",
  "lihi.io": "https://lihi.io",
  "howlihi.com": "https://howlihi.com",
  custom: ""
};
const VOICE_BALANCE_PRESETS = {
  "1": "偏感性很多：先放大共鳴、畫面、情緒與留白，產品要輕輕帶到。",
  "2": "偏感性：保留情境感與生活畫面，但仍要讓產品價值看得懂。",
  "3": "平衡：兼顧情境畫面與清楚價值。",
  "4": "偏理性：先把價值與重點講清楚，再留一點情緒與節奏。",
  "5": "偏理性很多：優先清楚、具體、好判斷，減少抒情與留白。"
};
const RANDOM_STYLE_PRESET_KEY = "random";
const STYLE_PRESETS = {
  home_healing: {
    label: "回家療癒版",
    note: "推開家門後那種終於可以好好吃一口、慢下來的溫暖感。",
    prompt: "回家療癒版：主打回家、放鬆、安定、被照顧的情緒，畫面要有溫度。"
  },
  sharing_moment: {
    label: "分享時刻版",
    note: "聚焦和家人、朋友一起吃、一起分享的氛圍。",
    prompt: "分享時刻版：把產品放進一起吃、一起聊、一起分享的場景，強調連結感。"
  },
  childhood_memory: {
    label: "童年回憶版",
    note: "走熟悉味道、記憶感、阿嬤媽媽餐桌那種親近感。",
    prompt: "童年回憶版：帶出熟悉味道、從小記憶、家常安心感，但不要俗套。"
  },
  premium_brand: {
    label: "高級品牌版",
    note: "語氣更克制、有質感，像在講一個值得信任的品牌。",
    prompt: "高級品牌版：語氣克制、質感、乾淨，不喊賣點，用品味與信任感建立價值。"
  },
  founder_story: {
    label: "創辦人故事版",
    note: "適合帶出為什麼做這個產品、背後堅持與初衷。",
    prompt: "創辦人故事版：適度加入品牌初衷、堅持或做這件事的理由，讓產品更有人味。"
  },
  social_proof: {
    label: "社群口碑版",
    note: "更像大家真的會轉貼、推薦、說這個不錯的社群語感。",
    prompt: "社群口碑版：語氣自然、有討論感，像使用者願意主動分享與推薦。"
  },
  scenario_solution: {
    label: "場景解決方案版",
    note: "把產品對應到具體生活情境，讓人立刻知道什麼時候會需要。",
    prompt: "場景解決方案版：優先寫明什麼情境下會需要它、它如何幫你解決當下問題。"
  },
  rational_comparison: {
    label: "理性對比版",
    note: "更適合強調差異、選擇理由、判斷依據與重點整理。",
    prompt: "理性對比版：清楚說明差異、優勢、選擇理由，偏理性、可判斷。"
  },
  gift_recommendation: {
    label: "送禮推薦版",
    note: "把產品包裝成送家人、送長輩、送客戶都體面的選擇。",
    prompt: "送禮推薦版：強調體面、心意、好送、不失禮，讓人容易聯想到送禮情境。"
  },
  urgency_conversion: {
    label: "限時轉單版",
    note: "更直接、更促動行動，適合活動、限時、快速決策。",
    prompt: "限時轉單版：節奏更快、行動更明確，優先降低猶豫、推進下單。"
  }
};
const RANDOM_STYLE_PRESET_META = {
  label: "隨機",
  note: "每次按下產出時，系統都會從 10 種風格裡隨機挑 1 種。",
  prompt: "隨機：送出時從既有風格版本中隨機選 1 種。"
};

const CREATIVE_PLATFORM_META = {
  facebook: { label: "Facebook 主圖", size: "1:1" },
  instagram: { label: "IG", size: "4:5" },
  threads: { label: "Threads", size: "9:16" },
  google_ads: { label: "Google Ads", size: "1.91:1" }
};

const CREATIVE_STYLE_META = {
  clean: "清爽產品感",
  bold: "高轉換吸睛版",
  warm: "溫暖生活感",
  luxury: "高級品牌版",
  saas: "SaaS 服務版"
};

const CREATIVE_MODEL_META = {
  none: "不要模特兒",
  adult: "生活感模特兒",
  family: "家庭互動模特兒",
  couple: "雙人互動模特兒",
  senior: "熟齡信任模特兒",
  staff: "專人示範模特兒",
  hand: "只出現手部互動"
};

const CREATIVE_PROFILE_PRESETS = {
  warm_family_dinner_v1: {
    label: "家庭晚餐暖感版",
    note: "適合食品、家用品、日常消費品，強調晚餐時刻、分享與被照顧感。",
    style: "warm",
    talent: "family",
    variantSelections: {
      composition: "餐桌感置中構圖",
      background: "柔白居家背景"
    },
    talentSelections: {
      framing: "產品在前人物在後",
      styling: "柔和居家穿搭"
    }
  },
  offer_bold_conversion_v1: {
    label: "高轉單促購版",
    note: "適合活動促購、短期轉單、首圖吸睛。畫面會更像 performance ad。",
    style: "bold",
    talent: "adult",
    variantSelections: {
      composition: "大字主標 + 側邊產品",
      background: "亮色漸層背景"
    },
    talentSelections: {
      framing: "人物只佔畫面三分之一",
      styling: "俐落都會感穿搭"
    }
  },
  luxury_editorial_hero_v1: {
    label: "高級品牌主視覺版",
    note: "適合 premium 商品、送禮、品牌官網 hero，主打質地與留白。",
    style: "luxury",
    talent: "none",
    variantSelections: {
      composition: "置中單品精品構圖",
      background: "暖白精品棚拍背景"
    },
    talentSelections: {
      framing: "產品單獨置中",
      styling: "品牌展示櫥窗感"
    }
  },
  ugc_staff_demo_v1: {
    label: "專人示範說明版",
    note: "適合帶操作感、介紹感、導購感的素材，像有人在幫你看重點。",
    style: "clean",
    talent: "staff",
    variantSelections: {
      composition: "左文右圖",
      background: "純淺色留白背景"
    },
    talentSelections: {
      framing: "產品在前人物在後",
      styling: "俐落工作穿搭"
    }
  },
  senior_trust_story_v1: {
    label: "熟齡安心信任版",
    note: "適合保健、食品、居家照護、熟齡客群，畫面會偏安心穩定。",
    style: "warm",
    talent: "senior",
    variantSelections: {
      composition: "右情境左文字",
      background: "淺米牆面背景"
    },
    talentSelections: {
      framing: "產品在前人物在後",
      styling: "高質感中性色服裝"
    }
  },
  couple_gifting_moment_v1: {
    label: "雙人送禮分享版",
    note: "適合節慶、送禮、伴侶共用產品，畫面會比較有關係感與體面感。",
    style: "luxury",
    talent: "couple",
    variantSelections: {
      composition: "精品櫥窗式構圖",
      background: "香檳米色漸層背景"
    },
    talentSelections: {
      framing: "半身雙人入鏡",
      styling: "高級生活感服裝"
    }
  }
};

const CREATIVE_STYLE_SELECTION_META = {
  clean: {
    composition: ["置中單品 hero", "左文右圖", "右文左圖", "近景產品特寫"],
    background: ["純淺色留白背景", "柔和漸層背景", "紙張質感背景", "幾何色塊背景"]
  },
  bold: {
    composition: ["大字主標 + 側邊產品", "置中產品 + 上下文案", "左產品右主標", "對角線動態構圖"],
    background: ["亮色漸層背景", "高彩色塊拼接背景", "對比撞色背景", "速度感光影背景"]
  },
  warm: {
    composition: ["餐桌感置中構圖", "居家角落場景構圖", "左情境右文字", "右情境左文字"],
    background: ["柔白居家背景", "木質桌面背景", "淺米牆面背景", "暖色生活場景背景"]
  },
  luxury: {
    composition: ["置中單品精品構圖", "左文右產品", "精品櫥窗式構圖", "雜誌封面感上下分區構圖"],
    background: ["暖白精品棚拍背景", "香檳米色漸層背景", "精品展示檯面", "石材或礦物質感背景"]
  },
  saas: {
    composition: ["置中 dashboard hero", "左文右 UI", "右文左 UI", "workflow step-by-step 分區構圖"],
    background: ["乾淨淺灰介面背景", "藍白漸層數位背景", "網格數據背景", "低對比工作台背景"]
  }
};

const CREATIVE_TALENT_SELECTION_META = {
  none: {
    framing: ["產品單獨置中", "產品偏左留文案區", "產品偏右留文案區", "近距離局部特寫"],
    styling: ["極簡陳列感", "生活靜物感", "商品棚拍感", "品牌展示櫥窗感"]
  },
  adult: {
    framing: ["半身入鏡", "三分之二身入鏡", "人物在後產品在前", "人物只佔畫面三分之一"],
    styling: ["簡潔日常穿搭", "乾淨居家服裝", "質感中性色服裝", "俐落都會感穿搭"]
  },
  family: {
    framing: ["中景餐桌互動", "半身親密互動", "產品在前人物在後", "帶環境的家庭場景"],
    styling: ["柔和居家穿搭", "日常家庭服裝", "暖色系親和配色", "舒適休閒穿搭"]
  },
  couple: {
    framing: ["半身雙人入鏡", "中景互動", "產品在前雙人在後", "環境帶入式雙人場景"],
    styling: ["簡約都會穿搭", "乾淨中性色服裝", "高級生活感服裝", "日常質感休閒"]
  },
  senior: {
    framing: ["半身入鏡", "中景生活場景", "產品在前人物在後", "人物只佔畫面三分之一"],
    styling: ["簡潔熟齡穿搭", "高質感中性色服裝", "乾淨居家服裝", "日常但體面的穿搭"]
  },
  staff: {
    framing: ["半身示範入鏡", "產品在前人物在後", "側身介紹產品", "人物只佔畫面三分之一"],
    styling: ["俐落工作穿搭", "品牌感制服元素", "乾淨襯衫或上衣", "中性色門市風格"]
  },
  hand: {
    framing: ["近距離手部特寫", "中景手與產品同框", "桌面上方俯拍手勢", "前景手勢搭配後方產品"],
    styling: ["乾淨自然手部", "保養感細緻手部", "生活感真實手部", "品牌感簡潔手勢"]
  }
};

const CREATIVE_IMAGE_MODEL_META = {
  "openai/gpt-5.4-image-2": "GPT-5.4 Image 2"
};

const TAB_LABELS = {
  primary: { title: "標題", body: "主文", description: "", cta: "CTA", url: "連結" },
  meta_ad: { title: "Headline", body: "Primary text", description: "Description", cta: "CTA", url: "連結" },
  google_ads: { title: "Headline", body: "Description", description: "Display path 1", cta: "Display path 2", url: "Final URL" },
  sms: { title: "開頭", body: "訊息內容", description: "", cta: "行動句", url: "連結" },
  line: { title: "開頭", body: "LINE 內文", description: "", cta: "行動句", url: "連結" },
  email: { title: "Email 主旨", body: "Email 內文", description: "Preview text", cta: "", url: "" }
};

const form = document.querySelector("#copy-form");
const statusEl = document.querySelector("#form-status");
const submitButton = document.querySelector("#submit-button");
const refreshPromptButton = document.querySelector("#refresh-prompt-button");
const promptPreview = document.querySelector("#prompt-preview");
const modeBadge = document.querySelector("#mode-badge");
const resultCard = document.querySelector("#result-card");

const resultTitle = document.querySelector("#result-title");
const resultBody = document.querySelector("#result-body");
const resultDescription = document.querySelector("#result-description");
const resultCta = document.querySelector("#result-cta");
const resultUrl = document.querySelector("#result-url");
const resultTitleLabel = document.querySelector("#result-title-label");
const resultBodyLabel = document.querySelector("#result-body-label");
const resultDescriptionLabel = document.querySelector("#result-description-label");
const resultCtaLabel = document.querySelector("#result-cta-label");
const resultUrlLabel = document.querySelector("#result-url-label");
const resultDescriptionBlock = document.querySelector("#result-description-block");
const resultGoogleAdsBlock = document.querySelector("#result-google-ads-block");
const resultGoogleAdsGroups = document.querySelector("#result-google-ads-groups");
const resultRow = document.querySelector(".result-row");
const resultCtaBlock = document.querySelector(".result-block-cta");
const resultUrlBlock = document.querySelector(".result-block-url");
const resultSmsBlock = document.querySelector("#result-sms-block");
const resultCompactLabel = document.querySelector("#result-compact-label");
const resultSmsTitle = document.querySelector("#result-sms-title");
const resultSmsBody = document.querySelector("#result-sms-body");
const resultSmsCta = document.querySelector("#result-sms-cta");
const resultSmsUrl = document.querySelector("#result-sms-url");
const copyTitleButton = document.querySelector("#copy-title-button");
const copyBodyButton = document.querySelector("#copy-body-button");
const copyDescriptionButton = document.querySelector("#copy-description-button");
const copyCtaButton = document.querySelector("#copy-cta-button");
const copyUrlButton = document.querySelector("#copy-url-button");
const copySmsButton = document.querySelector("#copy-sms-button");
const resultCopyButtons = [
  copyTitleButton,
  copyBodyButton,
  copyDescriptionButton,
  copyCtaButton,
  copyUrlButton,
  copySmsButton
].filter(Boolean);
const resultTabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const surfaceTabButtons = Array.from(document.querySelectorAll("[data-surface]"));
const surfacePanels = Array.from(document.querySelectorAll("[data-surface-panel]"));
const creativePlatformButtons = Array.from(document.querySelectorAll("[data-creative-platform]"));

const creativePrimaryCopy = document.querySelector("#creative-primary-copy");
const creativeProfileInput = document.querySelector("#creative-profile");
const creativeProfileNote = document.querySelector("#creative-profile-note");
const creativeStyleInput = document.querySelector("#creative-style");
const creativeModelInput = document.querySelector("#creative-model");
const creativeCompositionInput = document.querySelector("#creative-composition");
const creativeBackgroundInput = document.querySelector("#creative-background");
const creativeFramingInput = document.querySelector("#creative-framing");
const creativeStylingInput = document.querySelector("#creative-styling");
const creativeGenerateButton = document.querySelector("#creative-generate-button");
const creativeStatusEl = document.querySelector("#creative-status");
const logoImageInput = document.querySelector("#logoImageInput");
const productImageInput = document.querySelector("#productImageInput");
const logoPreviewCard = document.querySelector("#logoPreviewCard");
const productPreviewCard = document.querySelector("#productPreviewCard");
const logoPreviewImage = document.querySelector("#logoPreviewImage");
const productPreviewImage = document.querySelector("#productPreviewImage");
const removeLogoButton = document.querySelector("#removeLogoButton");
const removeProductButton = document.querySelector("#removeProductButton");
const creativePreviewCard = document.querySelector("#creative-preview-card");
const creativeImage = document.querySelector("#creative-image");
const creativeEmptyState = document.querySelector("#creative-empty-state");
const creativePromptPreview = document.querySelector("#creative-prompt-preview");
const creativeSizeBadge = document.querySelector("#creative-size-badge");
const creativeCostBadge = document.querySelector("#creative-cost-badge");
const creativeMetaText = document.querySelector("#creative-meta-text");
const creativeCopyPromptButton = document.querySelector("#creative-copy-prompt-button");

const analysisCard = document.querySelector("#analysis-card");
const analysisSummary = document.querySelector("#analysis-summary");
const analysisMeta = document.querySelector("#analysis-meta");
const analysisPrices = document.querySelector("#analysis-prices");
const analysisOcr = document.querySelector("#analysis-ocr");
const voiceBalanceInput = document.querySelector("#voiceBalance");
const voiceBalanceNote = document.querySelector("#voice-balance-note");
const stylePresetInput = document.querySelector("#stylePreset");
const stylePresetNote = document.querySelector("#style-preset-note");
const domainPresetInput = document.querySelector("#domainPreset");
const productUrlInput = document.querySelector("#productUrl");
const toggleUrlSettingsButton = document.querySelector("#toggle-url-settings");
const urlSettingsPanel = document.querySelector("#url-settings-panel");

const errorEls = {
  productName: document.querySelector('[data-error-for="productName"]'),
  benefits: document.querySelector('[data-error-for="benefits"]'),
  productUrl: document.querySelector('[data-error-for="productUrl"]'),
  stylePreset: document.querySelector('[data-error-for="stylePreset"]'),
  tone: document.querySelector('[data-error-for="tone"]')
};

let promptRenderTimer = null;
let activeTab = "primary";
let activeSurface = "copy";
let activeCreativePlatform = "facebook";
let currentRun = null;
let copyFeedbackTimer = null;
let activeCopyFeedbackButton = null;
let creativeReferenceState = {
  logo: null,
  product: null
};

function getFormData() {
  if (!form) {
    return null;
  }

  const formData = new FormData(form);
  const benefits = formData
    .getAll("benefit")
    .map((item) => String(item).trim())
    .filter(Boolean);

  return {
    productName: String(formData.get("productName") || "").trim(),
    benefits,
    extraContext: String(formData.get("extraContext") || "").trim(),
    stylePreset: normalizeStylePreset(formData.get("stylePreset")),
    domainPreset: normalizeDomainPreset(formData.get("domainPreset")),
    productUrl: normalizeProductUrl(formData.get("productUrl"), formData.get("domainPreset")),
    tone: String(formData.get("tone") || "").trim(),
    voiceBalance: normalizeVoiceBalance(formData.get("voiceBalance")),
    complianceMode: normalizeComplianceMode(formData.get("complianceMode")),
    references: getCreativeReferences()
  };
}

function normalizeDomainPreset(value) {
  const normalized = String(value || "").trim();
  return Object.hasOwn(DOMAIN_PRESET_BASES, normalized) ? normalized : "copy.bktsai.link";
}

function normalizeStylePreset(value) {
  const normalized = String(value || "").trim();
  return normalized === RANDOM_STYLE_PRESET_KEY || Object.hasOwn(STYLE_PRESETS, normalized) ? normalized : RANDOM_STYLE_PRESET_KEY;
}

function getStylePresetMeta(value) {
  const normalized = normalizeStylePreset(value);
  if (normalized === RANDOM_STYLE_PRESET_KEY) {
    return RANDOM_STYLE_PRESET_META;
  }

  return STYLE_PRESETS[normalized] || RANDOM_STYLE_PRESET_META;
}

function getDomainPresetBase(value) {
  return DOMAIN_PRESET_BASES[normalizeDomainPreset(value)] || "";
}

function looksLikeHostnamePath(value) {
  const raw = String(value || "").trim();
  // 如果已經是完整網址（有 http:// 或 https://），直接回傳 true
  if (/^https?:\/\//i.test(raw)) {
    return true;
  }
  // 如果是 hostname + path 格式（例如 example.com/product），也回傳 true
  return /^[^/\s]+\.[^/\s]+(?:[/:?#]|$)/.test(raw);
}

function joinBaseAndPath(base, value) {
  const normalizedBase = String(base || "").replace(/\/+$/g, "");
  const raw = String(value || "").trim();

  if (!normalizedBase) {
    return raw;
  }

  if (!raw) {
    return `${normalizedBase}/`;
  }

  return `${normalizedBase}/${raw.replace(/^\/+/g, "")}`;
}

function normalizeProductUrl(value, domainPreset) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  let candidate = raw;
  if (looksLikeHostnamePath(raw)) {
    candidate = raw;
  } else {
    const presetBase = getDomainPresetBase(domainPreset);
    if (presetBase) {
      candidate = joinBaseAndPath(presetBase, raw);
    }
  }

  if (candidate.startsWith("//")) {
    candidate = `https:${candidate}`;
  } else if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/g, "")}`;
  }

  try {
    const parsed = new URL(candidate);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    parsed.protocol = "https:";
    parsed.username = "";
    parsed.password = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function normalizeVoiceBalance(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return 3;
  }

  return Math.min(5, Math.max(1, Math.round(parsed)));
}

function normalizeComplianceMode(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return String(value || "").toLowerCase() === "on" || String(value || "").toLowerCase() === "true";
}

function validate(data) {
  const errors = {};

  if (!data?.productName || data.productName.length > 80) {
    errors.productName = "產品名稱必填，且需在 80 字內。";
  }

  if (!Array.isArray(data?.benefits) || data.benefits.length < 3 || data.benefits.length > 4) {
    errors.benefits = "請提供 3 到 4 個產品優點。";
  } else if (data.benefits.some((item) => item.length > 60)) {
    errors.benefits = "每個優點需在 60 字內。";
  }

  const normalizedUrl = normalizeProductUrl(data?.productUrl || "", data?.domainPreset);
  if (!normalizedUrl) {
    errors.productUrl = "請輸入公開網域或網址，系統會自動補上 https://。";
  } else if (normalizedUrl.length > 300) {
    errors.productUrl = "網址需在 300 字內。";
  } else if (!isAllowedPublicUrl(normalizedUrl)) {
    errors.productUrl = "網址不可使用 localhost、內網 IP 或自訂 port。";
  }

  if (!["brand", "conversion"].includes(data?.tone || "")) {
    errors.tone = "請選擇文案風格。";
  }

  if (!(data?.stylePreset === RANDOM_STYLE_PRESET_KEY || Object.hasOwn(STYLE_PRESETS, data?.stylePreset || ""))) {
    errors.stylePreset = "請選擇一個風格版本。";
  }

  if (data?.extraContext && data.extraContext.length > 600) {
    errors.benefits = "其他想補充的內容需在 600 字內。";
  }

  return errors;
}

function renderErrors(errors) {
  Object.entries(errorEls).forEach(([key, el]) => {
    if (el) {
      el.textContent = errors[key] || "";
    }
  });
}

function isAllowedPublicUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") {
      return false;
    }

    if (parsed.port && parsed.port !== "443") {
      return false;
    }

    return !isBlockedHostname(parsed.hostname);
  } catch {
    return false;
  }
}

function isBlockedHostname(hostname) {
  const normalized = String(hostname || "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal") ||
    normalized === "metadata.google.internal"
  ) {
    return true;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(normalized)) {
    const [a = 0, b = 0] = normalized.split(".").map((item) => Number(item));
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }

  if (normalized.includes(":")) {
    return (
      normalized === "::1" ||
      normalized === "::" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb")
    );
  }

  return false;
}

function toSafeDisplayUrl(value) {
  const normalized = normalizeProductUrl(value, "custom");
  return isAllowedPublicUrl(normalized) ? normalized : "";
}

function setSafeLink(anchor, value) {
  if (!anchor) {
    return;
  }

  const safeUrl = toSafeDisplayUrl(value);
  anchor.textContent = safeUrl || "-";
  anchor.href = safeUrl || "#";
}

function getApiErrorMessage(result, fallbackMessage) {
  if (Array.isArray(result?.errors) && result.errors.length) {
    return result.errors[0];
  }

  if (typeof result?.message === "string" && result.message.trim()) {
    return result.message.trim();
  }

  if (typeof result?.error === "string" && result.error.trim()) {
    return result.error.trim();
  }

  return fallbackMessage;
}

function getPrimaryStatusMessage(result) {
  const isLive = result.mode === "live" || result.mode === "openclaw";
  const mismatch = result.pageAnalysis?.inputMismatch;

  if (mismatch?.isSuspicious) {
    return "文案已完成，但產品名稱和頁面資訊差異較大，請先確認網址和商品是否一致。";
  }

  return isLive ? "已完成主要文案。點擊右側 tab 可產出渠道版本。" : "目前為 mock 模式，已先完成主要文案。";
}

function getTonePromptText(tone) {
  switch (tone) {
    case "conversion":
      return "轉單型：先抓痛點與差異，句子更短、更直接，優先推最能促成下單的 1 到 2 個重點。";
    case "brand":
    default:
      return "品牌型：語氣有質感、可信、好讀，強調品牌印象、產品價值與使用情境。";
  }
}

function getVoiceBalancePromptText(voiceBalance) {
  return VOICE_BALANCE_PRESETS[String(normalizeVoiceBalance(voiceBalance))] || VOICE_BALANCE_PRESETS["3"];
}

function updateStylePresetNote(value) {
  if (!stylePresetNote) {
    return;
  }

  stylePresetNote.textContent = getStylePresetMeta(value).note;
}

function buildPrompt(data) {
  if (!data) {
    return "目前沒有可用的 prompt。";
  }

  const benefitLines = data.benefits.map((item, index) => `${index + 1}. ${item}`).join("\n");

  return `你是「Beck Copy Engine」，核心不是私人記憶，而是可產品化的 Beck 文案方法論。

任務：
根據使用者提供的產品資訊與銷售頁可驗證內容，先產出一篇基礎文案，再依需求轉成不同渠道格式。

輸入資料：
- 產品名稱：${data.productName || "{{product_name}}"}
- 產品優點：
${benefitLines || "1. {{benefit_1}}\n2. {{benefit_2}}\n3. {{benefit_3}}"}
- 其他想補充的內容：${data.extraContext || "無"}
- 風格版本：${getStylePresetMeta(data.stylePreset).label}
- 導流網域：${getDomainPresetBase(data.domainPreset) || "用自訂網域"}
- 產品頁連結：${data.productUrl || "{{product_url}}"}
- 文案風格：${data.tone || "{{tone}}"}
- 感性 / 理性強度：${normalizeVoiceBalance(data.voiceBalance)}
- 台灣食品廣告合規模式：${data.complianceMode ? "開啟" : "關閉"}

風格規則：
- ${getStylePresetMeta(data.stylePreset).prompt}
- ${getTonePromptText(data.tone)}
- ${getVoiceBalancePromptText(data.voiceBalance)}

生成規則：
1. 先整理成結構化母稿，再產出一篇完整、可直接閱讀的基礎文案。
2. 必須結合使用者提供的產品名稱、產品優點與產品頁資訊。
3. 不要輸出多個版本，不要輸出分析、備註、前言、後記。
4. 不要捏造未提供的具體數字、成效、保證。
 5. 廣告文案內不要提及任何價格、售價、原價、折扣、優惠價或金額。
 6. ${data.complianceMode ? "避免高風險與禁用詞，優先用中性、清楚、較不易誤解的食品廣告寫法。" : "若有法規需求，可開啟台灣食品廣告合規模式。"} `;
}

function buildMockPrimaryCopy(data) {
  const [primary, secondary, tertiary] = data.benefits;
  const voiceBalance = normalizeVoiceBalance(data.voiceBalance);

  if (data.complianceMode) {
    return {
      title: `${data.productName}，把產品重點說清楚`,
      body: `${data.productName} 會先根據產品頁與你提供的優點，整理成較中性、較不易誤解的廣告文案。\n\n重點會放在產品資訊、使用情境與閱讀清楚度，不碰高風險或禁用詞。`,
      cta: "立即了解更多",
      url: data.productUrl,
      labels: TAB_LABELS.primary
    };
  }

  if (data.tone === "conversion") {
    return {
      title: `${data.productName}，把 ${primary} 直接說清楚`,
      body:
        voiceBalance <= 2
          ? `有些東西不是沒需要，只是一直沒有被好好說清楚。${data.productName} 把 ${primary}、${secondary}、${tertiary} 放到前面，讓人比較容易走到下一步。`
          : `如果你在找一個更好下決定的選擇，${data.productName}會先把 ${primary}、${secondary}、${tertiary} 放到最前面。\n\n少一點猶豫，多一點直接行動。`,
      cta: "立即查看商品頁",
      url: data.productUrl,
      labels: TAB_LABELS.primary
    };
  }

  return {
    title: `${data.productName}，把 ${primary} 說得更有感`,
    body:
      voiceBalance <= 2
        ? `有時候不是特別需要什麼大道理，只是想找到一個比較貼近自己的選擇。${data.productName} 把 ${primary}、${secondary} 和 ${tertiary} 整理成更容易被感受到的產品價值。`
        : `${data.productName} 把 ${primary}、${secondary} 和 ${tertiary} 整理成更容易被理解的產品價值。\n\n讓人一看就知道這個產品為什麼值得被選。`,
    cta: "了解更多",
    url: data.productUrl,
    labels: TAB_LABELS.primary
  };
}

function updateVoiceBalanceNote(value) {
  if (!voiceBalanceNote) {
    return;
  }

  voiceBalanceNote.textContent = getVoiceBalancePromptText(value);
}

function syncDomainPresetIntoUrl() {
  if (!(productUrlInput instanceof HTMLInputElement) || !(domainPresetInput instanceof HTMLSelectElement)) {
    return;
  }

  const raw = productUrlInput.value.trim();
  const presetBase = getDomainPresetBase(domainPresetInput.value);

  if (!presetBase) {
    return;
  }

  if (!raw) {
    productUrlInput.value = `${presetBase}/`;
    return;
  }

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) && !raw.startsWith("//") && !looksLikeHostnamePath(raw)) {
    productUrlInput.value = joinBaseAndPath(presetBase, raw);
  }
}

function setUrlSettingsOpen(isOpen) {
  // 空函式，不做任何事
}

function buildMockChannelCopy(tab, data, masterDraft) {
  if (tab === "sms") {
    if (data.complianceMode) {
      return {
        title: `${data.productName}重點`,
        body: "先看產品資訊與使用情境。",
        cta: "立即了解",
        url: data.productUrl,
        labels: TAB_LABELS.sms
      };
    }

    const smsCopy = fitSmsFieldsToLimit({
      title: masterDraft?.hook || `${data.productName}值得你看一眼`,
      body: `${data.productName}主打 ${data.benefits.slice(0, 2).join("、")}。現在就看看這次整理好的重點。`,
      cta: "立即查看"
    });

    return {
      title: smsCopy.title,
      body: smsCopy.body,
      cta: smsCopy.cta,
      url: data.productUrl,
      labels: TAB_LABELS.sms
    };
  }

  if (tab === "line") {
    if (data.complianceMode) {
      return {
        title: `${data.productName}重點`,
        body: "先把產品資訊整理清楚，再決定是否適合你。",
        cta: "點這裡看看",
        url: data.productUrl,
        labels: TAB_LABELS.line
      };
    }

    const lineCopy = fitCompactFieldsToLimit({
      title: masterDraft?.hook || `${data.productName}值得你看一眼`,
      body: `${data.productName}主打 ${data.benefits.slice(0, 2).join("、")}。現在就看看這次整理好的重點。`,
      cta: "點這裡看看"
    }, 80);

    return {
      title: lineCopy.title,
      body: lineCopy.body,
      cta: lineCopy.cta,
      url: data.productUrl,
      labels: TAB_LABELS.line
    };
  }

  if (tab === "email") {
    if (data.complianceMode) {
      const cta = "點開看看";
      return {
        title: truncateText(`${data.productName}產品資訊整理`, 28),
        body: [`${data.productName} 這次先聚焦在產品資訊與使用情境。`, `也把整理後的重點放在前面，讓你更容易快速判斷。`, cta, data.productUrl].join("\n\n"),
        description: truncateText("先看清楚產品重點", 36),
        cta,
        url: data.productUrl,
        labels: TAB_LABELS.email
      };
    }

    const cta = "點開看看";
    const detailLine = [data.benefits[0], data.benefits[1]].filter(Boolean).join("，");
    return {
      title: truncateText(masterDraft?.hook || `${data.productName}值得你打開看看`, 28),
      body: [truncateText(
        [
          masterDraft?.valueProp || data.benefits.slice(0, 2).join("、"),
          detailLine,
          data.benefits[2] || ""
        ]
          .filter(Boolean)
          .join("。"),
        170
      ), cta, data.productUrl]
        .filter(Boolean)
        .join("\n\n"),
      description: truncateText(data.benefits[0] || `${data.productName} 重點整理`, 36),
      cta,
      url: data.productUrl,
      labels: TAB_LABELS.email
    };
  }

  if (tab === "google_ads") {
    if (data.complianceMode) {
      const fallbackHeadlines = [
        truncateTextHard(`${data.productName}重點整理`, 30),
        truncateTextHard(`${data.productName}產品資訊`, 30),
        truncateTextHard(`${data.productName}使用情境`, 30)
      ];
      const fallbackDescriptions = [
        truncateTextHard("先看產品資訊與使用情境。", 90),
        truncateTextHard("把重點先整理好，再決定也可以。", 90),
        truncateTextHard("先快速看懂這款產品的核心重點。", 90)
      ];
      return {
        title: formatGoogleAdsVariantText(fallbackHeadlines),
        body: formatGoogleAdsVariantText(fallbackDescriptions),
        description: normalizeGoogleAdsPathSegment(data.productName),
        cta: normalizeGoogleAdsPathSegment("product-info"),
        url: data.productUrl,
        labels: TAB_LABELS.google_ads
      };
    }

    const headlineGroups = buildGoogleAdsHeadlineVariants(data, masterDraft);
    const descriptionGroups = buildGoogleAdsDescriptionVariants(data, masterDraft);
    return {
      title: formatGoogleAdsVariantText(headlineGroups),
      body: formatGoogleAdsVariantText(descriptionGroups),
      description: normalizeGoogleAdsPathSegment(data.benefits[0] || data.productName),
      cta: normalizeGoogleAdsPathSegment(data.benefits[1] || "product-highlights"),
      url: data.productUrl,
      labels: TAB_LABELS.google_ads
    };
  }

  const metaCta = "前往商品頁看看";
  if (data.complianceMode) {
    return {
      title: truncateText(`${data.productName}重點整理`, 12),
      body: appendUrlToMetaBody(normalizeMetaAdBodyLength([
        "先看產品資訊與使用情境。",
        "也把整理後的重點放在前面。"
      ]), data.productUrl),
      description: truncateText("先看產品資訊", 15),
      cta: metaCta,
      url: data.productUrl,
      labels: TAB_LABELS.meta_ad
    };
  }

  return {
    title: truncateText(masterDraft?.hook || `${data.productName}，先把重點說清楚`, 12),
    body: appendUrlToMetaBody(normalizeMetaAdBodyLength([
      `${masterDraft?.valueProp || data.benefits.slice(0, 2).join("、")}。`,
      data.benefits[0] ? `這次也會把 ${data.benefits.slice(0, 2).join("、")} 這幾個重點整理清楚。` : ""
    ].filter(Boolean)), data.productUrl),
    description: truncateText(data.benefits[0] || `${data.productName}重點整理`, 15),
    cta: metaCta,
    url: data.productUrl,
    labels: TAB_LABELS.meta_ad
  };
}

function renderPrompt(data) {
  if (!promptPreview) {
    return;
  }

  promptPreview.textContent = typeof data === "string" ? data : buildPrompt(data || getFormData());
}

function schedulePromptRender() {
  if (!form) {
    return;
  }

  window.clearTimeout(promptRenderTimer);
  promptRenderTimer = window.setTimeout(() => {
    renderPrompt(getFormData());
  }, 120);
}

function applyResultLabels(labels = TAB_LABELS.primary) {
  const currentLabels = labels || TAB_LABELS.primary;
  const channel = activeTab || "primary";
  const hasDescriptionBlock = channel === "meta_ad" || channel === "google_ads" || channel === "email";
  const showGoogleAdsGroups = channel === "google_ads";
  const isEmailTab = channel === "email";
  const isCompactTab = channel === "sms" || channel === "line";
  const showCtaBlock = !isCompactTab && channel !== "email" && channel !== "meta_ad";
  const showUrlBlock = !isCompactTab && channel !== "email";

  if (resultCard) {
    resultCard.dataset.channel = channel;
    resultCard.classList.toggle("is-compact-layout", isCompactTab);
  }

  if (resultTitleLabel) {
    resultTitleLabel.textContent = currentLabels.title || TAB_LABELS.primary.title;
  }
  if (resultBodyLabel) {
    resultBodyLabel.textContent = currentLabels.body || TAB_LABELS.primary.body;
  }
  if (resultDescriptionLabel) {
    resultDescriptionLabel.textContent = currentLabels.description || "Description";
  }
  if (resultCtaLabel) {
    resultCtaLabel.textContent = currentLabels.cta || TAB_LABELS.primary.cta;
  }
  if (resultUrlLabel) {
    resultUrlLabel.textContent = currentLabels.url || TAB_LABELS.primary.url;
  }

  if (resultDescriptionBlock) {
    resultDescriptionBlock.classList.toggle("is-hidden", !hasDescriptionBlock);
  }

  if (resultGoogleAdsBlock) {
    resultGoogleAdsBlock.classList.toggle("is-hidden", !showGoogleAdsGroups);
  }

  if (resultRow) {
    resultRow.classList.toggle("is-hidden", isCompactTab || (!showCtaBlock && !showUrlBlock));
  }

  if (resultCtaBlock) {
    resultCtaBlock.classList.toggle("is-hidden", !showCtaBlock);
  }

  if (resultUrlBlock) {
    resultUrlBlock.classList.toggle("is-hidden", !showUrlBlock);
  }

  if (resultSmsBlock) {
    resultSmsBlock.classList.toggle("is-hidden", !isCompactTab);
  }

  if (resultCompactLabel) {
    resultCompactLabel.textContent = channel === "line" ? "LINE" : "SMS";
  }
}

function setTabLoadingState(isLoading) {
  resultTabButtons.forEach((button) => {
    button.disabled = isLoading;
  });
}

function renderResult(output) {
  if (!resultTitle || !resultBody || !resultCta || !resultUrl || !resultCard) {
    return;
  }

  applyResultLabels(output?.labels || TAB_LABELS[activeTab] || TAB_LABELS.primary);
  const googleHeadlineVariants = activeTab === "google_ads" ? parseGoogleAdsVariantText(output?.title) : [];
  const googleDescriptionVariants = activeTab === "google_ads" ? parseGoogleAdsVariantText(output?.body) : [];
  setTextContent(resultTitle, output?.title || "尚未產出");
  renderBodyContent(output?.body || "尚未產出");
  if (resultDescription) {
    setTextContent(resultDescription, output?.description || (activeTab === "meta_ad" || activeTab === "google_ads" || activeTab === "email" ? "待補欄位" : "-"));
  }
  setTextContent(resultCta, output?.cta || "-");
  setSafeLink(resultUrl, output?.url || "");
  if (resultSmsTitle) {
    resultSmsTitle.textContent = output?.title || "尚未產出";
  }
  if (resultSmsBody) {
    resultSmsBody.textContent = output?.body || "尚未產出";
  }
  if (resultSmsCta) {
    resultSmsCta.textContent = output?.cta || "-";
  }
  if (resultSmsUrl) {
    setSafeLink(resultSmsUrl, output?.url || "");
  }
  renderGoogleAdsGroups(resultGoogleAdsGroups, googleHeadlineVariants, googleDescriptionVariants);
  const isGoogleAdsTab = activeTab === "google_ads";
  resultTitle.classList.toggle("is-hidden", isGoogleAdsTab);
  resultBody.classList.toggle("is-hidden", isGoogleAdsTab);
  resultCard.classList.toggle("empty", !output);
  resultBody.classList.toggle("placeholder", !output?.body);

  resultCopyButtons.forEach((button) => {
    button.disabled = !output;
  });

  if (copyTitleButton) {
    copyTitleButton.disabled = !output || isGoogleAdsTab;
  }

  if (copyBodyButton) {
    copyBodyButton.disabled = !output || isGoogleAdsTab;
  }

  updateCompactLabel(output);
}

function fitSmsFieldsToLimit(fields, maxChars = 70) {
  const normalized = {
    title: String(fields?.title || "").trim(),
    body: String(fields?.body || "").replace(/\r/g, "").replace(/\n+/g, " ").trim(),
    cta: String(fields?.cta || "").trim()
  };

  const getLength = () => normalized.title.length + normalized.body.length + normalized.cta.length;

  if (getLength() <= maxChars) {
    return normalized;
  }

  const reserved = normalized.title.length + normalized.cta.length;
  const maxBody = Math.max(0, maxChars - reserved);
  normalized.body = truncateText(normalized.body, maxBody);

  if (getLength() <= maxChars) {
    return normalized;
  }

  normalized.title = truncateText(normalized.title, Math.max(0, maxChars - normalized.body.length - normalized.cta.length));

  if (getLength() <= maxChars) {
    return normalized;
  }

  normalized.cta = truncateText(normalized.cta, Math.max(0, maxChars - normalized.title.length - normalized.body.length));
  return normalized;
}

function renderEmptyResult(tab = "primary") {
  applyResultLabels(TAB_LABELS[tab] || TAB_LABELS.primary);
  if (resultTitle) {
    setTextContent(resultTitle, "尚未產出");
    resultTitle.classList.remove("is-hidden");
  }
  if (resultBody) {
    renderBodyContent(tab === "primary" ? "送出表單後，會在這裡顯示完整廣告文案。" : "點擊上方 tab 後，會在這裡顯示對應渠道版本。");
    resultBody.classList.add("placeholder");
    resultBody.classList.remove("is-hidden");
  }
  if (resultDescription) {
    setTextContent(resultDescription, "-");
  }
  if (resultCta) {
    setTextContent(resultCta, "-");
  }
  if (resultUrl) {
    resultUrl.textContent = "-";
    resultUrl.href = "#";
  }
  if (resultSmsTitle) {
    resultSmsTitle.textContent = "尚未產出";
  }
  if (resultSmsBody) {
    resultSmsBody.textContent = tab === "line" ? "點擊上方 tab 後，會在這裡顯示 LINE 文案。" : "點擊上方 tab 後，會在這裡顯示 SMS 文案。";
  }
  if (resultSmsCta) {
    resultSmsCta.textContent = "-";
  }
  if (resultSmsUrl) {
    resultSmsUrl.textContent = "-";
    resultSmsUrl.href = "#";
  }
  renderGoogleAdsGroups(resultGoogleAdsGroups, [], []);
  if (resultCard) {
    resultCard.classList.add("empty");
  }
  resultCopyButtons.forEach((button) => {
    button.disabled = true;
  });
  updateCompactLabel();
}

function renderLoadingResult(tab = "primary") {
  applyResultLabels(TAB_LABELS[tab] || TAB_LABELS.primary);

  if (resultTitle) {
    setTextContent(resultTitle, "文案產出中");
    resultTitle.classList.remove("is-hidden");
  }
  if (resultBody) {
    renderBodyContent(tab === "meta_ad" ? "正在整理 Meta 廣告欄位..." : tab === "google_ads" ? "正在整理 Google Ads 欄位..." : tab === "email" ? "正在整理 Email 欄位..." : tab === "line" ? "正在整理 LINE 欄位..." : "正在整理 SMS 欄位...");
    resultBody.classList.add("placeholder");
    resultBody.classList.remove("is-hidden");
  }
  if (resultDescription) {
    setTextContent(resultDescription, tab === "meta_ad" || tab === "google_ads" || tab === "email" ? "文案產出中" : "-");
  }
  if (resultCta) {
    setTextContent(resultCta, "文案產出中");
  }
  if (resultUrl) {
    resultUrl.textContent = "文案產出中";
    resultUrl.href = "#";
  }
  if (resultSmsTitle) {
    resultSmsTitle.textContent = "文案產出中";
  }
  if (resultSmsBody) {
    resultSmsBody.textContent = tab === "line" ? "正在整理 LINE 欄位..." : "正在整理 SMS 欄位...";
  }
  if (resultSmsCta) {
    resultSmsCta.textContent = "文案產出中";
  }
  if (resultSmsUrl) {
    resultSmsUrl.textContent = "文案產出中";
    resultSmsUrl.href = "#";
  }
  renderGoogleAdsGroups(resultGoogleAdsGroups, [], []);
  if (resultCard) {
    resultCard.classList.add("empty");
  }
  resultCopyButtons.forEach((button) => {
    button.disabled = true;
  });
  updateCompactLabel();
}

function setActiveTab(tab, options = {}) {
  const { render = true } = options;
  activeTab = tab;

  resultTabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (!render) {
    return;
  }

  const output = currentRun?.outputs?.[tab];
  if (output) {
    renderResult(output);
    return;
  }

  renderEmptyResult(tab);
}

function getChannelDisplayName(tab) {
  if (tab === "meta_ad") {
    return "Meta 廣告";
  }

  if (tab === "google_ads") {
    return "Google Ads";
  }

  if (tab === "email") {
    return "Email";
  }

  if (tab === "line") {
    return "LINE";
  }

  if (tab === "sms") {
    return "SMS";
  }

  return "主要文案";
}

function saveLastRun(payload) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...payload,
        savedAt: Date.now()
      })
    );
  } catch {}
}

function loadLastRun() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hydrateFromLastRun() {
  const lastRun = loadLastRun();
  if (!lastRun) {
    if (promptPreview && !form) {
      promptPreview.textContent = "先回到主頁送出一次表單，這裡就會顯示最近一次的 prompt。";
    }
    return;
  }

  if (!form) {
    if (lastRun.outputs?.primary) {
      renderResult(lastRun.outputs.primary);
    }

    if (lastRun.pageAnalysis) {
      renderPageAnalysis(lastRun.pageAnalysis);
    }

    if (lastRun.prompt) {
      renderPrompt(lastRun.prompt);
    }
  }

  currentRun = normalizeRunState(lastRun);
  creativeReferenceState = normalizeCreativeReferences(currentRun?.input?.references);
  renderCreativeReferencePreviews();
  applyCreativeConfigToControls(currentRun?.creative?.config);
  syncCreativePrimaryCopy();
  if (currentRun?.creative?.assets?.[activeCreativePlatform]) {
    renderCreativeAsset(currentRun.creative.assets[activeCreativePlatform]);
    unlockCreativePlatformButtons();
    return;
  }

  syncCreativePlatformButtonState(false);
}

function buildRunState(result, input) {
  return {
    input: {
      ...input,
      stylePreset: result.stylePreset || input.stylePreset
    },
    mode: result.mode,
    prompt: result.prompt,
    pageAnalysis: result.pageAnalysis,
    masterDraft: result.masterDraft,
    outputs: {
      primary: result.output
    },
    creative: {
      config: null,
      assets: {}
    }
  };
}

function normalizeRunState(run) {
  if (!run || typeof run !== "object") {
    return null;
  }

  const normalizedReferences = normalizeCreativeReferences(run.input?.references);

  const storedCreativeConfig = run.creative?.config
    ? {
        creativeProfile: String(run.creative.config.creativeProfile || "").trim(),
        style: run.creative.config.style || "clean",
        talent: run.creative.config.talent || run.creative.config.model || "none",
        variantSelections: normalizeCreativeSelectionRecord(run.creative.config.variantSelections),
        talentSelections: normalizeCreativeSelectionRecord(run.creative.config.talentSelections),
        imageModel: CREATIVE_IMAGE_MODEL_META[run.creative.config.imageModel]
          ? run.creative.config.imageModel
          : "openai/gpt-5.4-image-2"
      }
    : null;

  return {
    ...run,
    input: {
      ...(run.input || {}),
      references: normalizedReferences
    },
    creative: {
      config: storedCreativeConfig,
      assets: run.creative?.assets || {}
    }
  };
}

function getPrimaryCreativeCopy() {
  if (!currentRun?.outputs?.primary) {
    return "";
  }

  return [currentRun.outputs.primary.title, currentRun.outputs.primary.body]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join("\n\n");
}

function normalizeCreativeSelectionRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [String(key || "").trim(), String(item || "").trim()])
      .filter(([key, item]) => key && item)
  );
}

function applyCreativeConfigToControls(config = null) {
  const style = String(config?.style || "clean");
  const talent = String(config?.talent || config?.model || "none");
  const creativeProfile = String(config?.creativeProfile || "").trim();

  if (creativeProfileInput) {
    creativeProfileInput.value = Object.hasOwn(CREATIVE_PROFILE_PRESETS, creativeProfile) ? creativeProfile : "";
  }
  if (creativeStyleInput) {
    creativeStyleInput.value = Object.hasOwn(CREATIVE_STYLE_META, style) ? style : "clean";
  }
  if (creativeModelInput) {
    creativeModelInput.value = Object.hasOwn(CREATIVE_MODEL_META, talent) ? talent : "none";
  }

  syncCreativeAdvancedOptions({
    style: creativeStyleInput?.value || "clean",
    talent: creativeModelInput?.value || "none",
    variantSelections: normalizeCreativeSelectionRecord(config?.variantSelections),
    talentSelections: normalizeCreativeSelectionRecord(config?.talentSelections)
  });
  updateCreativeProfileNote(creativeProfileInput?.value || "");
}

function setCreativeSelectionOptions(select, options, selectedValue = "") {
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  const normalizedOptions = Array.isArray(options) ? options.filter(Boolean) : [];
  const targetValue = normalizedOptions.includes(selectedValue) ? selectedValue : "";
  select.innerHTML = "";

  const autoOption = document.createElement("option");
  autoOption.value = "";
  autoOption.textContent = "自動";
  select.append(autoOption);

  for (const optionLabel of normalizedOptions) {
    const option = document.createElement("option");
    option.value = optionLabel;
    option.textContent = optionLabel;
    select.append(option);
  }

  select.value = targetValue;
}

function syncCreativeAdvancedOptions(config = {}) {
  const style = String(config?.style || creativeStyleInput?.value || "clean");
  const talent = String(config?.talent || creativeModelInput?.value || "none");
  const variantSelections = normalizeCreativeSelectionRecord(config?.variantSelections);
  const talentSelections = normalizeCreativeSelectionRecord(config?.talentSelections);
  const styleMeta = CREATIVE_STYLE_SELECTION_META[style] || CREATIVE_STYLE_SELECTION_META.clean;
  const talentMeta = CREATIVE_TALENT_SELECTION_META[talent] || CREATIVE_TALENT_SELECTION_META.none;

  setCreativeSelectionOptions(creativeCompositionInput, styleMeta.composition, variantSelections.composition || creativeCompositionInput?.value || "");
  setCreativeSelectionOptions(creativeBackgroundInput, styleMeta.background, variantSelections.background || creativeBackgroundInput?.value || "");
  setCreativeSelectionOptions(creativeFramingInput, talentMeta.framing, talentSelections.framing || creativeFramingInput?.value || "");
  setCreativeSelectionOptions(creativeStylingInput, talentMeta.styling, talentSelections.styling || creativeStylingInput?.value || "");
}

function updateCreativeProfileNote(profileKey) {
  if (!creativeProfileNote) {
    return;
  }

  const preset = CREATIVE_PROFILE_PRESETS[String(profileKey || "").trim()];
  creativeProfileNote.textContent = preset
    ? `${preset.label}：${preset.note}`
    : "先選一個常用配方，底下欄位會一起帶入；之後仍可再手動微調。";
}

function applyCreativeProfilePreset(profileKey) {
  const preset = CREATIVE_PROFILE_PRESETS[String(profileKey || "").trim()];
  if (!preset) {
    syncCreativeAdvancedOptions();
    updateCreativeProfileNote("");
    return;
  }

  if (creativeStyleInput) {
    creativeStyleInput.value = preset.style;
  }
  if (creativeModelInput) {
    creativeModelInput.value = preset.talent;
  }

  syncCreativeAdvancedOptions({
    style: preset.style,
    talent: preset.talent,
    variantSelections: preset.variantSelections,
    talentSelections: preset.talentSelections
  });
  updateCreativeProfileNote(profileKey);
}

function syncCreativePrimaryCopy() {
  if (!(creativePrimaryCopy instanceof HTMLTextAreaElement)) {
    return;
  }

  creativePrimaryCopy.value = getPrimaryCreativeCopy();
}

function setActiveSurface(surface) {
  activeSurface = surface === "creative" ? "creative" : "copy";

  surfaceTabButtons.forEach((button) => {
    const isActive = button.dataset.surface === activeSurface;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  surfacePanels.forEach((panel) => {
    const isActive = panel.getAttribute("data-surface-panel") === activeSurface;
    panel.classList.toggle("is-hidden", !isActive);
  });

  if (activeSurface === "creative") {
    syncCreativePrimaryCopy();
    syncCreativePlatformButtonState(false);
  }
}

function getCreativeConfig() {
  const variantSelections = {};
  const talentSelections = {};

  if (creativeCompositionInput?.value) {
    variantSelections.composition = String(creativeCompositionInput.value);
  }
  if (creativeBackgroundInput?.value) {
    variantSelections.background = String(creativeBackgroundInput.value);
  }
  if (creativeFramingInput?.value) {
    talentSelections.framing = String(creativeFramingInput.value);
  }
  if (creativeStylingInput?.value) {
    talentSelections.styling = String(creativeStylingInput.value);
  }

  return {
    creativeProfile: String(creativeProfileInput?.value || "").trim(),
    style: String(creativeStyleInput?.value || "clean"),
    talent: String(creativeModelInput?.value || "none"),
    variantSelections,
    talentSelections,
    imageModel: "openai/gpt-5.4-image-2"
  };
}

function normalizeCreativeReferences(value) {
  const references = value && typeof value === "object" ? value : {};
  return {
    logo: normalizeCreativeReferenceAsset(references.logo),
    product: normalizeCreativeReferenceAsset(references.product)
  };
}

function normalizeCreativeReferenceAsset(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const dataUrl = String(value.dataUrl || "").trim();
  if (!dataUrl) {
    return null;
  }

  return {
    dataUrl,
    name: String(value.name || "").trim(),
    mimeType: String(value.mimeType || "").trim()
  };
}

function getCreativeReferences() {
  return normalizeCreativeReferences(creativeReferenceState);
}

function getCreativeTimeoutMs(config = {}) {
  const imageModel = String(config?.imageModel || "openai/gpt-5.4-image-2");
  if (imageModel.startsWith("openai/gpt-5")) {
    return GENERATE_CREATIVE_SLOW_MODEL_TIMEOUT_MS;
  }

  return GENERATE_CREATIVE_TIMEOUT_MS;
}

function buildCreativeRequest(platform = activeCreativePlatform, options = {}) {
  const { forceRegenerate = false } = options;
  const config = getCreativeConfig();
  const references = getCreativeReferences();
  syncCurrentRunReferences(references);
  return {
    platform,
    requestNonce: forceRegenerate ? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : "",
    config: {
      ...config,
      model: config.talent
    },
    productName: currentRun?.input?.productName || "",
    productUrl: currentRun?.input?.productUrl || "",
    primaryCopy: getPrimaryCreativeCopy(),
    references,
    source: {
      title: currentRun?.outputs?.primary?.title || "",
      body: currentRun?.outputs?.primary?.body || "",
      cta: currentRun?.outputs?.primary?.cta || "",
      benefits: currentRun?.input?.benefits || []
    }
  };
}

function syncCurrentRunReferences(references = getCreativeReferences()) {
  if (!currentRun || typeof currentRun !== "object") {
    return;
  }

  currentRun.input = {
    ...(currentRun.input || {}),
    references: normalizeCreativeReferences(references)
  };
}

function setCreativeStatus(message) {
  if (creativeStatusEl) {
    creativeStatusEl.textContent = message;
  }
}

function hasPrimaryCreativeAsset() {
  return Boolean(currentRun?.creative?.assets?.facebook);
}

function syncCreativePlatformButtonState(isLoading = false) {
  const shouldDisable = isLoading || !hasPrimaryCreativeAsset();
  creativePlatformButtons.forEach((button) => {
    button.disabled = shouldDisable;
  });
}

function setCreativeLoadingState(isLoading) {
  if (creativeGenerateButton) {
    creativeGenerateButton.disabled = isLoading;
  }

  syncCreativePlatformButtonState(isLoading);
}

function unlockCreativePlatformButtons() {
  syncCreativePlatformButtonState(false);
}

function setActiveCreativePlatform(platform, options = {}) {
  const { render = true } = options;
  activeCreativePlatform = CREATIVE_PLATFORM_META[platform] ? platform : "facebook";

  creativePlatformButtons.forEach((button) => {
    const isActive = button.dataset.creativePlatform === activeCreativePlatform;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (!render) {
    return;
  }

  const asset = currentRun?.creative?.assets?.[activeCreativePlatform];
  if (asset) {
    renderCreativeAsset(asset);
    return;
  }

  renderCreativeEmptyState();
}

function getCreativeMetaText(asset) {
  const profileKey = asset?.creativeProfile || currentRun?.creative?.config?.creativeProfile || "";
  const profileLabel = CREATIVE_PROFILE_PRESETS[profileKey]?.label || "";
  const styleLabel = CREATIVE_STYLE_META[asset?.style] || asset?.style || "";
  const talentLabel = CREATIVE_MODEL_META[asset?.talent || asset?.model] || asset?.talent || asset?.model || "";
  const imageModelLabel = CREATIVE_IMAGE_MODEL_META[asset?.imageModel] || asset?.imageModel || "";
  return [profileLabel, styleLabel, talentLabel, imageModelLabel, asset?.platformLabel].filter(Boolean).join("｜") || "尚未產出素材";
}

function findFirstNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (!value || typeof value !== "object") {
    return null;
  }

  for (const key of [
    "cost",
    "usd",
    "amount",
    "estimated_cost",
    "total_cost",
    "cost_usd",
    "usd_cost"
  ]) {
    const nested = findFirstNumber(value[key]);
    if (nested !== null) {
      return nested;
    }
  }

  return null;
}

function getUsageTokenCount(usage, keys) {
  for (const key of keys) {
    const count = findFirstNumber(usage?.[key]);
    if (count !== null) {
      return count;
    }
  }
  return 0;
}

function estimateCreativeCostUsd(asset) {
  const explicitCost = findFirstNumber(asset?.usage);
  if (explicitCost !== null) {
    return explicitCost;
  }

  if (asset?.imageModel === "openai/gpt-5.4-image-2") {
    const usage = asset?.usage || {};
    const inputTokens = getUsageTokenCount(usage, ["input_tokens", "prompt_tokens"]);
    const outputTokens = getUsageTokenCount(usage, ["output_tokens", "completion_tokens"]);
    const inputCost = (inputTokens / 1000000) * 8;
    const outputCost = (outputTokens / 1000000) * 15;
    const totalCost = inputCost + outputCost;
    return totalCost > 0 ? totalCost : null;
  }

  return null;
}

function formatCreativeCostLabel(asset) {
  const costUsd = estimateCreativeCostUsd(asset);
  if (costUsd === null) {
    return "USD --";
  }

  return `USD ${costUsd.toFixed(4)}`;
}

function renderCreativeEmptyState() {
  if (creativePreviewCard) {
    creativePreviewCard.classList.add("empty");
  }
  if (creativeImage) {
    creativeImage.classList.add("is-hidden");
    creativeImage.removeAttribute("src");
  }
  if (creativeEmptyState) {
    creativeEmptyState.classList.remove("is-hidden");
    creativeEmptyState.innerHTML = "<strong>這裡會出現素材預覽</strong><p>第一步先產 Facebook 主圖，之後下方 tab 就能延伸其他尺寸。</p>";
  }
  if (creativePromptPreview) {
    creativePromptPreview.textContent = "尚未產生素材 prompt。";
  }
  if (creativeSizeBadge) {
    creativeSizeBadge.textContent = CREATIVE_PLATFORM_META[activeCreativePlatform]?.size || "1:1";
  }
  if (creativeMetaText) {
    creativeMetaText.textContent = "尚未產出素材";
  }
  if (creativeCostBadge) {
    creativeCostBadge.textContent = "USD --";
  }
  if (creativeCopyPromptButton) {
    creativeCopyPromptButton.disabled = true;
  }
}

function renderCreativeLoadingState(platform = activeCreativePlatform) {
  const platformSize = CREATIVE_PLATFORM_META[platform]?.size || "1:1";

  if (creativePreviewCard) {
    creativePreviewCard.classList.add("empty");
  }
  if (creativeImage) {
    creativeImage.classList.add("is-hidden");
    creativeImage.removeAttribute("src");
  }
  if (creativeEmptyState) {
    creativeEmptyState.classList.remove("is-hidden");
    creativeEmptyState.innerHTML = "<strong>產圖中</strong><p>正在整理這個比例的素材設定與 prompt。</p>";
  }
  if (creativePromptPreview) {
    creativePromptPreview.textContent = "產圖中...";
    creativePromptPreview.dataset.copyValue = "";
  }
  if (creativeSizeBadge) {
    creativeSizeBadge.textContent = platformSize;
  }
  if (creativeMetaText) {
    creativeMetaText.textContent = "產圖中";
  }
  if (creativeCostBadge) {
    creativeCostBadge.textContent = "USD --";
  }
  if (creativeCopyPromptButton) {
    creativeCopyPromptButton.disabled = true;
  }
}

function renderCreativeAsset(asset) {
  if (!asset) {
    renderCreativeEmptyState();
    return;
  }

  if (creativePreviewCard) {
    creativePreviewCard.classList.remove("empty");
  }
  if (creativeImage) {
    creativeImage.src = asset.imageUrl;
    creativeImage.alt = asset.alt || "AI 廣告素材預覽";
    creativeImage.classList.remove("is-hidden");
  }
  if (creativeEmptyState) {
    creativeEmptyState.classList.add("is-hidden");
  }
  if (creativePromptPreview) {
    creativePromptPreview.textContent = asset.prompt || "尚未產生素材 prompt。";
    creativePromptPreview.dataset.copyValue = asset.prompt || "";
  }
  if (creativeSizeBadge) {
    creativeSizeBadge.textContent = CREATIVE_PLATFORM_META[asset.platform]?.size || "1:1";
  }
  if (creativeCostBadge) {
    creativeCostBadge.textContent = formatCreativeCostLabel(asset);
  }
  if (creativeMetaText) {
    creativeMetaText.textContent = getCreativeMetaText(asset);
  }
  if (creativeCopyPromptButton) {
    creativeCopyPromptButton.disabled = !asset.prompt;
  }
}

function creativeConfigMatchesStored(config) {
  const stored = currentRun?.creative?.config;
  const storedVariantSelections = normalizeCreativeSelectionRecord(stored?.variantSelections);
  const storedTalentSelections = normalizeCreativeSelectionRecord(stored?.talentSelections);
  const nextVariantSelections = normalizeCreativeSelectionRecord(config?.variantSelections);
  const nextTalentSelections = normalizeCreativeSelectionRecord(config?.talentSelections);
  return !!stored &&
    stored.creativeProfile === String(config.creativeProfile || "") &&
    stored.style === config.style &&
    stored.talent === config.talent &&
    JSON.stringify(storedVariantSelections) === JSON.stringify(nextVariantSelections) &&
    JSON.stringify(storedTalentSelections) === JSON.stringify(nextTalentSelections) &&
    stored.imageModel === config.imageModel;
}

function renderCreativeReferencePreviews() {
  renderCreativeReferencePreview("logo", logoPreviewCard, logoPreviewImage);
  renderCreativeReferencePreview("product", productPreviewCard, productPreviewImage);
}

function renderCreativeReferencePreview(kind, card, image) {
  const asset = creativeReferenceState[kind];
  const hasAsset = Boolean(asset?.dataUrl);

  if (card) {
    card.classList.toggle("is-hidden", !hasAsset);
  }

  if (image instanceof HTMLImageElement) {
    if (hasAsset) {
      image.src = asset.dataUrl;
    } else {
      image.removeAttribute("src");
    }
  }
}

async function handleCreativeReferenceInputChange(kind, event) {
  const input = event?.target instanceof HTMLInputElement ? event.target : null;
  const file = input?.files?.[0];

  if (!file) {
    return;
  }

  try {
    const asset = await fileToCreativeReferenceAsset(file);
    creativeReferenceState = {
      ...creativeReferenceState,
      [kind]: asset
    };
    syncCurrentRunReferences();
    if (currentRun) {
      saveLastRun(currentRun);
    }
    renderCreativeReferencePreviews();
  } catch (error) {
    const message = error instanceof Error ? error.message : "上傳圖片失敗";
    if (activeSurface === "creative") {
      setCreativeStatus(message);
    } else if (statusEl) {
      statusEl.textContent = message;
    }
    resetCreativeReferenceInput(kind);
  }
}

function handleRemoveCreativeReference(kind) {
  creativeReferenceState = {
    ...creativeReferenceState,
    [kind]: null
  };
  resetCreativeReferenceInput(kind);
  syncCurrentRunReferences();
  if (currentRun) {
    saveLastRun(currentRun);
  }
  renderCreativeReferencePreviews();
}

function resetCreativeReferenceInput(kind) {
  const input = kind === "logo" ? logoImageInput : productImageInput;
  if (input instanceof HTMLInputElement) {
    input.value = "";
  }
}

async function fileToCreativeReferenceAsset(file) {
  const mimeType = String(file.type || "").toLowerCase();
  if (!mimeType.startsWith("image/")) {
    throw new Error("請上傳圖片檔");
  }

  const dataUrl = mimeType === "image/svg+xml"
    ? await readFileAsDataUrl(file)
    : await fileToCompressedReferenceDataUrl(file);

  return {
    name: String(file.name || "").trim(),
    mimeType: mimeType || "image/webp",
    dataUrl
  };
}

async function fileToCompressedReferenceDataUrl(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const { width, height } = fitWithinBounds(
    image.naturalWidth || image.width || CREATIVE_REFERENCE_MAX_EDGE,
    image.naturalHeight || image.height || CREATIVE_REFERENCE_MAX_EDGE,
    CREATIVE_REFERENCE_MAX_EDGE
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("瀏覽器不支援圖片處理");
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  let quality = CREATIVE_REFERENCE_INITIAL_QUALITY;
  let compressedDataUrl = canvas.toDataURL("image/webp", quality);

  while (compressedDataUrl.length > CREATIVE_REFERENCE_MAX_DATA_URL_LENGTH && quality > CREATIVE_REFERENCE_MIN_QUALITY) {
    quality = Math.max(CREATIVE_REFERENCE_MIN_QUALITY, quality - 0.08);
    compressedDataUrl = canvas.toDataURL("image/webp", quality);
  }

  if (compressedDataUrl.length > CREATIVE_REFERENCE_MAX_DATA_URL_LENGTH) {
    throw new Error("圖片檔案太大，請先裁切或縮小後再上傳");
  }

  return compressedDataUrl;
}

function fitWithinBounds(width, height, maxEdge) {
  if (width <= maxEdge && height <= maxEdge) {
    return { width, height };
  }

  const ratio = width / height;
  if (ratio >= 1) {
    return { width: maxEdge, height: Math.round(maxEdge / ratio) };
  }

  return { width: Math.round(maxEdge * ratio), height: maxEdge };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("讀取圖片失敗"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("載入圖片失敗"));
    image.src = src;
  });
}

async function checkHealth() {
  if (!modeBadge) {
    return;
  }

  try {
    const response = await fetch(getApiUrl("health"));
    const data = await response.json();
    const isLive = new Set(["live", "openclaw"]).has(data.mode || data.endpointMode || "mock");

    modeBadge.classList.remove("chip-secondary", "chip-live", "chip-mock");
    modeBadge.textContent = isLive ? "已連文案引擎" : "Mock 模式";
    modeBadge.classList.add(isLive ? "chip-live" : "chip-mock");
  } catch {
    modeBadge.classList.remove("chip-secondary", "chip-live");
    modeBadge.textContent = "Static Demo";
    modeBadge.classList.add("chip-mock");
  }
}

function getApiUrl(path) {
  const base = appConfig.apiBaseUrl || "./api/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return new URL(path, new URL(normalizedBase, window.location.href)).toString();
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    const result = await response.json();
    return { response, result };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("請求等待太久，已自動停止。");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  setActiveSurface("copy");

  const data = getFormData();
  const errors = validate(data);
  renderErrors(errors);
  renderPrompt(data);

  if (Object.keys(errors).length) {
    if (statusEl) {
      statusEl.textContent = "欄位還沒填完整，先修正後再送出。";
    }
    return;
  }

  currentRun = null;
  setActiveTab("primary");
  renderEmptyResult("primary");
  renderCreativeEmptyState();
  setTabLoadingState(true);

  if (form) {
    const productUrlInput = form.querySelector("#productUrl");
    if (productUrlInput instanceof HTMLInputElement) {
      productUrlInput.value = data.productUrl;
    }
  }

  if (submitButton) {
    submitButton.disabled = true;
  }
  if (statusEl) {
    statusEl.textContent = "文案生成中，正在整理頁面資訊與產品線索...";
  }

  try {
    const copyRequest = {
      productName: data.productName,
      benefits: data.benefits,
      extraContext: data.extraContext,
      stylePreset: data.stylePreset,
      domainPreset: data.domainPreset,
      productUrl: data.productUrl,
      tone: data.tone,
      voiceBalance: data.voiceBalance,
      complianceMode: data.complianceMode
    };
    const { response, result } = await fetchJsonWithTimeout(
      getApiUrl("generate-copy"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copyRequest)
      },
      GENERATE_COPY_TIMEOUT_MS
    );

    if (!response.ok || !result.ok) {
      throw new Error(getApiErrorMessage(result, "產生文案時發生錯誤。"));
    }

    currentRun = buildRunState(result, data);
    renderResult(currentRun.outputs.primary);
    syncCreativePrimaryCopy();
    renderPageAnalysis(result.pageAnalysis);
    renderPrompt(result.prompt);
    saveLastRun(currentRun);

    if (statusEl) {
      statusEl.textContent = getPrimaryStatusMessage(result);
    }
  } catch (error) {
    const fallback = buildMockPrimaryCopy(data);
    currentRun = {
      input: data,
      mode: "mock",
      prompt: buildPrompt(data),
      pageAnalysis: null,
      masterDraft: {
        hook: fallback.title,
        valueProp: fallback.body,
        cta: fallback.cta,
        url: fallback.url
      },
      outputs: {
        primary: fallback
      },
      creative: {
        config: null,
        assets: {}
      }
    };

    renderResult(fallback);
    syncCreativePrimaryCopy();
    clearPageAnalysis();
    renderPrompt(currentRun.prompt);
    saveLastRun(currentRun);

    if (statusEl) {
      statusEl.textContent = error instanceof Error && error.message ? error.message : "目前沒有可用後端，已先用 mock 產出主要文案。";
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
    setTabLoadingState(false);
  }
}

async function handleTabClick(tab) {
  if (tab === activeTab && currentRun?.outputs?.[tab]) {
    return;
  }

  setActiveTab(tab, { render: false });

  if (!currentRun?.outputs?.primary) {
    renderEmptyResult(tab);
    if (statusEl) {
      statusEl.textContent = "請先產出主要文案。";
    }
    return;
  }

  if (tab === "primary") {
    renderResult(currentRun.outputs.primary);
    return;
  }

  if (currentRun.outputs[tab]) {
    renderResult(currentRun.outputs[tab]);
    return;
  }

  renderLoadingResult(tab);
  setTabLoadingState(true);

  if (statusEl) {
      statusEl.textContent = `正在產出 ${getChannelDisplayName(tab)} 文案...`;
  }

  try {
    const { response, result } = await fetchJsonWithTimeout(
      getApiUrl("format-copy"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: currentRun.input.productName,
          productUrl: currentRun.input.productUrl,
          stylePreset: currentRun.input.stylePreset,
          tone: currentRun.input.tone,
          voiceBalance: currentRun.input.voiceBalance,
          complianceMode: currentRun.input.complianceMode,
          channel: tab,
          masterDraft: currentRun.masterDraft
        })
      },
      FORMAT_COPY_TIMEOUT_MS
    );

    if (!response.ok || !result.ok) {
      throw new Error(getApiErrorMessage(result, "產出渠道文案時發生錯誤。"));
    }

    currentRun.outputs[tab] = result.output;
    renderResult(result.output);
    saveLastRun(currentRun);

    if (statusEl) {
      statusEl.textContent = `${getChannelDisplayName(tab)} 文案已完成。`;
    }
  } catch (error) {
    const fallback = buildMockChannelCopy(tab, currentRun.input, currentRun.masterDraft);
    currentRun.outputs[tab] = fallback;
    renderResult(fallback);
    saveLastRun(currentRun);

    if (statusEl) {
      statusEl.textContent = error instanceof Error && error.message ? error.message : `目前先用 fallback 產出 ${getChannelDisplayName(tab)} 文案。`;
    }
  } finally {
    setTabLoadingState(false);
  }
}

async function requestCreativeAsset(platform = activeCreativePlatform, options = {}) {
  const { forceRegenerate = false } = options;

  if (!currentRun?.outputs?.primary) {
    setCreativeStatus("請先產出主要文案。");
    renderCreativeEmptyState();
    return;
  }

  const config = getCreativeConfig();
  const hasExisting =
    !forceRegenerate &&
    currentRun?.creative?.assets?.[platform] &&
    creativeConfigMatchesStored(config);
  if (hasExisting) {
    renderCreativeAsset(currentRun.creative.assets[platform]);
    setCreativeStatus(`${CREATIVE_PLATFORM_META[platform]?.label || "素材"} 已就緒。`);
    return;
  }

  renderCreativeLoadingState(platform);
  setCreativeLoadingState(true);
  setCreativeStatus(`正在產出 ${CREATIVE_PLATFORM_META[platform]?.label || "素材"}...`);

  try {
    const timeoutMs = getCreativeTimeoutMs(config);
    const { response, result } = await fetchJsonWithTimeout(
      getApiUrl("generate-creative"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCreativeRequest(platform, { forceRegenerate }))
      },
      timeoutMs
    );

    if (!response.ok || !result.ok || !result.asset) {
      throw new Error(getApiErrorMessage(result, "產出素材時發生錯誤。"));
    }

    currentRun = normalizeRunState(currentRun);
    currentRun.creative.config = config;
    currentRun.creative.assets[platform] = result.asset;
    saveLastRun(currentRun);
    renderCreativeAsset(result.asset);
    unlockCreativePlatformButtons();
    setCreativeStatus(`${CREATIVE_PLATFORM_META[platform]?.label || "素材"} 已完成。`);
  } catch (error) {
    renderCreativeEmptyState();
    setCreativeStatus(error instanceof Error && error.message ? error.message : "產出素材失敗。");
  } finally {
    setCreativeLoadingState(false);
  }
}

async function handleCreativeGenerate() {
  setActiveSurface("creative");
  setActiveCreativePlatform("facebook", { render: false });
  await requestCreativeAsset("facebook", { forceRegenerate: true });
}

async function handleCreativePlatformClick(platform) {
  setActiveCreativePlatform(platform, { render: false });

  if (!currentRun?.creative?.assets?.facebook && platform !== "facebook") {
    renderCreativeEmptyState();
    setCreativeStatus("請先產出主圖。");
    return;
  }

  await requestCreativeAsset(platform, { forceRegenerate: true });
}

function showCopySuccess(button) {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  if (copyFeedbackTimer) {
    window.clearTimeout(copyFeedbackTimer);
    copyFeedbackTimer = null;
  }

  if (activeCopyFeedbackButton instanceof HTMLButtonElement) {
    activeCopyFeedbackButton.classList.remove("is-success");
    const activeIcon = activeCopyFeedbackButton.querySelector("span[aria-hidden='true']");
    if (activeIcon) {
      activeIcon.textContent = "⧉";
    }
  }

  resultCopyButtons.forEach((item) => {
    if (!(item instanceof HTMLButtonElement)) {
      return;
    }

    const icon = item.querySelector("span[aria-hidden='true']");
    item.classList.remove("is-success");
    if (icon) {
      icon.textContent = "⧉";
    }
  });

  button.classList.add("is-success");
  const icon = button.querySelector("span[aria-hidden='true']");
  if (icon) {
    icon.textContent = "✓";
  }
  activeCopyFeedbackButton = button;

  copyFeedbackTimer = window.setTimeout(() => {
    button.classList.remove("is-success");
    if (icon) {
      icon.textContent = "⧉";
    }
    if (activeCopyFeedbackButton === button) {
      activeCopyFeedbackButton = null;
    }
    copyFeedbackTimer = null;
  }, 1200);
}

async function copyText(value, successMessage, button) {
  if (!value) {
    return;
  }

  await navigator.clipboard.writeText(value);
  showCopySuccess(button);

  if (statusEl) {
    statusEl.textContent = successMessage;
  }
}

async function handleCopyField(field, button) {
  if (!resultTitle || !resultBody || !resultCta || !resultUrl) {
    return;
  }

  const copyMap = {
    title: {
      value: getCopyValue(resultTitle),
      message: `${resultTitleLabel?.textContent || "標題"}已複製到剪貼簿。`
    },
    body: {
      value: getCopyValue(resultBody),
      message: `${resultBodyLabel?.textContent || "主文"}已複製到剪貼簿。`
    },
    description: {
      value: getCopyValue(resultDescription),
      message: `${resultDescriptionLabel?.textContent || "Description"}已複製到剪貼簿。`
    },
    cta: {
      value: getCopyValue(resultCta),
      message: `${resultCtaLabel?.textContent || "CTA"}已複製到剪貼簿。`
    },
    url: {
      value: resultUrl.textContent,
      message: "連結已複製到剪貼簿。"
    },
    sms: {
      value: buildSmsCopyText(),
      message: `${activeTab === "line" ? "LINE" : "SMS"} 文案已複製到剪貼簿。`
    }
  };

  const target = copyMap[field];
  if (!target) {
    return;
  }

  await copyText(target.value, target.message, button);
}

function buildSmsCopyText() {
  const title = getCopyValue(resultSmsTitle);
  const body = getCopyValue(resultSmsBody);
  const cta = getCopyValue(resultSmsCta);
  const url = resultSmsUrl?.textContent || "";

  return [
    title,
    body,
    [cta, url].filter((value) => value && value !== "-").join("\n")
  ]
    .filter((value) => value && value !== "-")
    .join("\n\n");
}

function updateCompactLabel(output) {
  if (!resultCompactLabel) {
    return;
  }

  if (activeTab === "sms") {
    const totalChars = [
      output?.title || resultSmsTitle?.textContent || "",
      output?.body || resultSmsBody?.textContent || "",
      output?.cta || resultSmsCta?.textContent || "",
      output?.url || resultSmsUrl?.textContent || ""
    ]
      .filter((value) => value && value !== "-" && value !== "尚未產出" && value !== "文案產出中")
      .join("")
      .length;

    resultCompactLabel.textContent = totalChars > 0 ? `SMS｜${totalChars}字` : "SMS";
    return;
  }

  resultCompactLabel.textContent = activeTab === "line" ? "LINE" : "SMS";
}

function truncateTextHard(value, maxLength) {
  return Array.from(String(value || "").trim()).slice(0, maxLength).join("");
}

function fitCompactFieldsToLimit(fields, maxChars) {
  const normalized = {
    title: String(fields?.title || "").trim(),
    body: String(fields?.body || "").replace(/\r/g, "").replace(/\n+/g, " ").trim(),
    cta: String(fields?.cta || "").trim()
  };

  const getLength = () => normalized.title.length + normalized.body.length + normalized.cta.length;

  if (getLength() <= maxChars) {
    return normalized;
  }

  const reserved = normalized.title.length + normalized.cta.length;
  const maxBody = Math.max(0, maxChars - reserved);
  normalized.body = truncateText(normalized.body, maxBody);

  if (getLength() <= maxChars) {
    return normalized;
  }

  normalized.title = truncateText(normalized.title, Math.max(0, maxChars - normalized.body.length - normalized.cta.length));

  if (getLength() <= maxChars) {
    return normalized;
  }

  normalized.cta = truncateText(normalized.cta, Math.max(0, maxChars - normalized.title.length - normalized.body.length));
  return normalized;
}

function appendUrlToMetaBody(body, url) {
  const normalizedBody = String(body || "").trim().replace(/\n{3,}/g, "\n\n");
  const normalizedUrl = String(url || "").trim();

  if (!normalizedUrl) {
    return normalizedBody;
  }

  const bodyWithoutUrl = normalizedBody
    .replace(new RegExp(escapeRegExp(normalizedUrl), "g"), "")
    .replace(/[：:]\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return [bodyWithoutUrl, normalizedUrl].filter(Boolean).join("\n\n");
}

function appendCtaAndUrlToMetaBody(body, cta, url) {
  const normalizedBody = String(body || "").trim().replace(/\n{3,}/g, "\n\n");
  const normalizedCta = String(cta || "").trim();
  const normalizedUrl = String(url || "").trim();

  return [
    normalizedBody,
    [normalizedCta, normalizedUrl].filter(Boolean).join("\n")
  ]
    .filter(Boolean)
    .join("\n\n");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeGoogleAdsPathSegment(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/[/?#&=]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return truncateTextHard(normalized || "highlights", 15);
}

function buildGoogleAdsHeadlineVariants(data, masterDraft) {
  const candidates = [
    masterDraft?.hook,
    `${data.productName}${data.benefits[0] ? `｜${data.benefits[0]}` : ""}`,
    `${data.productName}${data.benefits[1] ? `｜${data.benefits[1]}` : ""}`,
    `${data.productName}值得先看`,
    `${data.benefits[0] || data.productName}先看`
  ]
    .map((item) => truncateTextHard(item, 30))
    .filter(Boolean);

  return collectUniqueItems(candidates).slice(0, 3);
}

function buildGoogleAdsDescriptionVariants(data, masterDraft) {
  const candidates = [
    `${masterDraft?.valueProp || data.benefits.slice(0, 2).join("、")}。`,
    `${data.benefits[0] ? `先看 ${data.benefits[0]}` : data.productName}，重點更清楚。`,
    `${data.benefits[1] ? `${data.benefits[1]} 也一起整理好。` : `${data.productName} 的重點已整理好。`}`,
    `${data.productName}的重點一次看懂。`
  ]
    .map((item) => truncateTextHard(item, 90))
    .filter(Boolean);

  return collectUniqueItems(candidates).slice(0, 3);
}

function formatGoogleAdsVariantText(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function normalizeMetaAdBodyLength(textOrParagraphs, minChars = 120, maxChars = 150) {
  const sentences = Array.isArray(textOrParagraphs)
    ? textOrParagraphs.map((item) => String(item || "").trim()).filter(Boolean)
    : String(textOrParagraphs || "")
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  const compact = sentences.join("");

  if (!compact) {
    return "";
  }

  if (compact.length <= maxChars) {
    if (compact.length >= minChars || sentences.length === 1) {
      return sentences.join("\n\n");
    }

    const filler = ensureSentence("也把閱讀重點排得更清楚，讓你更快掌握這次真正該先看的內容");
    return normalizeMetaAdBodyLength([...sentences, filler], minChars, maxChars);
  }

  const trimmed = [];
  let used = 0;
  for (const sentence of sentences) {
    if (!sentence) {
      continue;
    }
    if (used + sentence.length <= maxChars) {
      trimmed.push(sentence);
      used += sentence.length;
      continue;
    }
    const remain = maxChars - used;
    if (remain > 0) {
      trimmed.push(truncateText(sentence, remain));
    }
    break;
  }

  return trimmed.join("\n\n");
}

function collectUniqueItems(items) {
  return Array.from(new Set(items.map((item) => String(item || "").trim()).filter(Boolean)));
}

function parseGoogleAdsVariantText(value) {
  return String(value || "")
    .split(/\n+/)
    .map((item) => item.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

function renderGoogleAdsGroups(container, headlineItems, descriptionItems) {
  if (!container) {
    return;
  }

  const headlineBlocks = headlineItems.slice(0, 3).map((value, index) => ({
    label: `headline ${index + 1}`,
    value
  }));
  const descriptionBlocks = descriptionItems.slice(0, 3).map((value, index) => ({
    label: `description ${index + 1}`,
    value
  }));
  const blocks = [...headlineBlocks, ...descriptionBlocks];

  if (!blocks.length || activeTab !== "google_ads") {
    container.innerHTML = "";
    container.classList.add("is-hidden");
    return;
  }

  container.innerHTML = blocks.map(({ label, value }) => `
    <div class="variant-item google-ads-variant-item">
      <div class="result-head">
        <span class="variant-index">${escapeHtml(label)}</span>
        <button class="icon-copy-button" type="button" data-copy-variant="${encodeURIComponent(value)}" data-copy-label="${escapeHtml(label)}" aria-label="複製 ${escapeHtml(label)}" ${value ? "" : "disabled"}>
          <span aria-hidden="true">⧉</span>
        </button>
      </div>
      <p class="variant-value">${escapeHtml(value || "待補欄位")}</p>
    </div>
  `).join("");
  container.classList.remove("is-hidden");
}

function setTextContent(element, value) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const text = String(value || "");
  element.textContent = text;
  element.dataset.copyValue = text;
}

function getCopyValue(element) {
  if (!(element instanceof HTMLElement)) {
    return "";
  }

  return element.dataset.copyValue || element.textContent || "";
}

function shouldUseParagraphBodyLayout() {
  return activeTab === "primary" || activeTab === "meta_ad" || activeTab === "email";
}

function renderBodyContent(value) {
  if (!(resultBody instanceof HTMLElement)) {
    return;
  }

  const text = String(value || "");
  resultBody.dataset.copyValue = text;

  if (!shouldUseParagraphBodyLayout()) {
    resultBody.textContent = text;
    return;
  }

  const paragraphs = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    resultBody.textContent = text;
    return;
  }

  resultBody.innerHTML = paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderPageAnalysis(pageAnalysis) {
  if (!analysisCard || !analysisSummary || !analysisMeta || !analysisPrices || !analysisOcr) {
    return;
  }

  if (!pageAnalysis) {
    clearPageAnalysis();
    return;
  }

  analysisCard.classList.remove("empty");
  analysisSummary.textContent = pageAnalysis.inputMismatch?.isSuspicious
    ? `${pageAnalysis.inputMismatch.reason}。${pageAnalysis.summary || ""}`.trim()
    : pageAnalysis.summary || "這次沒有抓到可用的頁面摘要。";
  analysisMeta.textContent = [pageAnalysis.title, pageAnalysis.metaDescription].filter(Boolean).join(" / ") || "這次沒有抓到頁面標題或描述。";
  analysisPrices.textContent = Array.isArray(pageAnalysis.priceSignals) && pageAnalysis.priceSignals.length ? pageAnalysis.priceSignals.join(" / ") : "這次沒有抓到明確的價格或組合訊號。";

  const visualLines = [];

  if (pageAnalysis.visualEvidence) {
    const groups = [
      ["圖片品名 / 關鍵字", pageAnalysis.visualEvidence.productTerms],
      ["圖片優點", pageAnalysis.visualEvidence.claims],
      ["圖片規格 / 使用線索", pageAnalysis.visualEvidence.specs],
      ["OCR 備援", pageAnalysis.visualEvidence.ocrFallback]
    ];

    for (const [label, items] of groups) {
      if (Array.isArray(items) && items.length) {
        visualLines.push(`${label}：${items.join(" / ")}`);
      }
    }
  }

  if (!visualLines.length && Array.isArray(pageAnalysis.visualSignals) && pageAnalysis.visualSignals.length) {
    visualLines.push(...pageAnalysis.visualSignals.map((item, index) => `${index + 1}. ${item}`));
  }

  analysisOcr.textContent = visualLines.length ? visualLines.join("\n") : "這次沒有抓到可用的圖片文字或視覺線索。";
}

function clearPageAnalysis() {
  if (!analysisCard || !analysisSummary || !analysisMeta || !analysisPrices || !analysisOcr) {
    return;
  }

  analysisCard.classList.add("empty");
  analysisSummary.textContent = "本次沒有分析資料";
  analysisMeta.textContent = "本次沒有分析資料";
  analysisPrices.textContent = "本次沒有分析資料";
  analysisOcr.textContent = "本次沒有分析資料";
}

if (form) {
  form.addEventListener("submit", handleSubmit);
  form.addEventListener("input", schedulePromptRender);
  renderPrompt(getFormData());
  setActiveTab("primary");
  renderEmptyResult("primary");
  renderCreativeEmptyState();
  syncCreativePrimaryCopy();
}

resultTabButtons.forEach((button) => {
  button.addEventListener("click", () => handleTabClick(button.dataset.tab));
});

surfaceTabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveSurface(button.dataset.surface));
});

creativePlatformButtons.forEach((button) => {
  button.addEventListener("click", () => handleCreativePlatformClick(button.dataset.creativePlatform));
});

copyTitleButton?.addEventListener("click", () => handleCopyField("title", copyTitleButton));
copyBodyButton?.addEventListener("click", () => handleCopyField("body", copyBodyButton));
copyDescriptionButton?.addEventListener("click", () => handleCopyField("description", copyDescriptionButton));
copyCtaButton?.addEventListener("click", () => handleCopyField("cta", copyCtaButton));
copyUrlButton?.addEventListener("click", () => handleCopyField("url", copyUrlButton));
copySmsButton?.addEventListener("click", () => handleCopyField("sms", copySmsButton));
creativeGenerateButton?.addEventListener("click", handleCreativeGenerate);
logoImageInput?.addEventListener("change", (event) => {
  handleCreativeReferenceInputChange("logo", event);
});
productImageInput?.addEventListener("change", (event) => {
  handleCreativeReferenceInputChange("product", event);
});
removeLogoButton?.addEventListener("click", () => {
  handleRemoveCreativeReference("logo");
});
removeProductButton?.addEventListener("click", () => {
  handleRemoveCreativeReference("product");
});
creativeCopyPromptButton?.addEventListener("click", () => {
  copyText(creativePromptPreview?.dataset.copyValue || "", "素材 prompt 已複製到剪貼簿。", creativeCopyPromptButton);
});
resultGoogleAdsGroups?.addEventListener("click", async (event) => {
  const button = event.target instanceof Element ? event.target.closest("[data-copy-variant]") : null;
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  await copyText(decodeURIComponent(button.dataset.copyVariant || ""), `${button.dataset.copyLabel || "Google Ads 文案"}已複製到剪貼簿。`, button);
});

if (refreshPromptButton) {
  refreshPromptButton.addEventListener("click", () => {
    const lastRun = loadLastRun();
    if (lastRun?.prompt) {
      renderPrompt(lastRun.prompt);
      return;
    }
    renderPrompt(getFormData());
  });
}

voiceBalanceInput?.addEventListener("input", () => {
  updateVoiceBalanceNote(voiceBalanceInput.value);
  schedulePromptRender();
});

stylePresetInput?.addEventListener("change", () => {
  updateStylePresetNote(stylePresetInput.value);
  schedulePromptRender();
});

creativeProfileInput?.addEventListener("change", () => {
  applyCreativeProfilePreset(creativeProfileInput.value);
  if (currentRun?.creative?.assets?.[activeCreativePlatform] && !creativeConfigMatchesStored(getCreativeConfig())) {
    renderCreativeEmptyState();
    setCreativeStatus("素材設定已變更，請重新產出。");
  }
});

creativeStyleInput?.addEventListener("change", () => {
  syncCreativeAdvancedOptions({ style: creativeStyleInput.value, talent: creativeModelInput?.value || "none" });
  if (currentRun?.creative?.assets?.[activeCreativePlatform] && !creativeConfigMatchesStored(getCreativeConfig())) {
    renderCreativeEmptyState();
    setCreativeStatus("素材設定已變更，請重新產出。");
  }
});

creativeModelInput?.addEventListener("change", () => {
  syncCreativeAdvancedOptions({ style: creativeStyleInput?.value || "clean", talent: creativeModelInput.value });
  if (currentRun?.creative?.assets?.[activeCreativePlatform] && !creativeConfigMatchesStored(getCreativeConfig())) {
    renderCreativeEmptyState();
    setCreativeStatus("素材設定已變更，請重新產出。");
  }
});

[creativeCompositionInput, creativeBackgroundInput, creativeFramingInput, creativeStylingInput]
  .filter(Boolean)
  .forEach((input) => {
    input.addEventListener("change", () => {
      if (currentRun?.creative?.assets?.[activeCreativePlatform] && !creativeConfigMatchesStored(getCreativeConfig())) {
        renderCreativeEmptyState();
        setCreativeStatus("素材設定已變更，請重新產出。");
      }
    });
  });

domainPresetInput?.addEventListener("change", () => {
  syncDomainPresetIntoUrl();
  schedulePromptRender();
});

toggleUrlSettingsButton?.addEventListener("click", () => {
  // 空按鈕，什麼都不做
});

updateVoiceBalanceNote(voiceBalanceInput?.value || 3);
updateStylePresetNote(stylePresetInput?.value || RANDOM_STYLE_PRESET_KEY);
updateCreativeProfileNote(creativeProfileInput?.value || "");
syncCreativeAdvancedOptions();
setUrlSettingsOpen(false);
setActiveSurface("copy");
setActiveCreativePlatform("facebook");

hydrateFromLastRun();
renderCreativeReferencePreviews();
syncCreativePlatformButtonState(false);
checkHealth();
