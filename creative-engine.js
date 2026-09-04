"use strict";

const OPENROUTER_IMAGE_API_URL = "https://openrouter.ai/api/v1/images";
let sharp = null;

try {
  sharp = require("sharp");
} catch {
  sharp = null;
}
const CREATIVE_PLATFORM_META = {
  facebook: { label: "Facebook 主圖", width: 1440, height: 1440, aspectRatio: "1:1", apiAspectRatio: "1:1", resolution: "512", sizeLabel: "1440 x 1440 1:1" },
  instagram: { label: "IG", width: 1440, height: 1800, aspectRatio: "4:5", apiAspectRatio: "3:4", resolution: "512", sizeLabel: "1440 x 1800 4:5" },
  threads: { label: "Threads", width: 1440, height: 2560, aspectRatio: "9:16", apiAspectRatio: "9:16", resolution: "512", sizeLabel: "1440 x 2560 9:16" },
  google_ads: { label: "Google Ads", width: 1200, height: 628, aspectRatio: "1.91:1", apiAspectRatio: "16:9", resolution: "512", sizeLabel: "1200 x 628 1.91:1" }
};

const CREATIVE_STYLE_CONFIG = {
  clean: {
    label: "清爽產品感",
    foundation:
      "整體要乾淨、明亮、留白充足，主角明確集中在產品本身。畫面要有現代感、輕盈感、清楚的資訊層級，讓人一眼看懂產品重點。不要雜亂，不要過度堆疊道具，不要做成賣場促銷感。",
    variants: {
      composition: ["置中單品 hero", "左文右圖", "右文左圖", "近景產品特寫", "產品搭配少量道具的斜角構圖", "上文字下產品的簡潔分區構圖"],
      background: ["純淺色留白背景", "柔和漸層背景", "紙張質感背景", "霧面牆面背景", "淺色桌面背景", "幾何色塊背景"],
      color: ["品牌粉 + 米白", "暖白 + 淺粉", "灰白 + 玫瑰粉", "奶油白 + 木質色", "淺米色 + 深藍點綴", "白色 + 極淡蜜桃色"],
      lighting: ["明亮自然光", "柔和側光", "高鍵乾淨棚拍光", "輕晨光感", "低陰影霧面光", "微反射產品光澤"],
      camera: ["正視角平衡構圖", "微俯拍 15 度", "輕側拍 30 度", "近距離微距特寫", "中景產品主視角", "局部裁切放大視角"],
      surfaceMaterial: ["霧面紙感", "透明壓克力感", "細緻玻璃感", "柔霧塑料感", "淺木紋材質", "輕石材質感"],
      accents: ["無額外元素極簡", "一到兩個生活小道具", "細緻陰影層次", "半透明色塊", "紙張標籤感", "細框線條設計"],
      textLayout: ["左上", "右上", "置中", "下方橫排", "左下角", "上下分區式排版"],
      typographyMood: ["俐落無襯線科技感", "圓角親和感字體", "細字高級留白感", "粗字清楚促購感", "雜誌感字級對比", "標籤式短句排法"],
      pacing: ["節奏安靜克制", "節奏輕快清楚", "節奏俐落直接", "節奏帶一點呼吸留白", "節奏偏產品展示導向", "節奏偏資訊整理導向"]
    }
  },
  bold: {
    label: "高轉換吸睛版",
    foundation:
      "第一眼要強、快、明確，能立刻抓住注意力並快速傳達主賣點。主標醒目，產品存在感強，CTA 區域清楚，整體要有廣告投放素材的成熟感。不要變成廉價促銷圖，不要過度俗氣，不要資訊擁擠到難讀。高轉換不等於全黑畫面，除非本次變體真的指定深底，否則不要預設做成黑底或近黑底。",
    variants: {
      composition: ["大字主標 + 側邊產品", "置中產品 + 上下文案", "左產品右主標", "右產品左主標", "滿版產品特寫 + 浮動文字區塊", "對角線動態構圖"],
      background: ["亮色漸層背景", "高彩色塊拼接背景", "放射狀聚焦背景", "幾何切角背景", "對比撞色背景", "速度感光影背景"],
      color: ["品牌粉 + 明黃", "電藍 + 桃紅", "亮紫 + 螢光粉", "珊瑚橘 + 白字高對比", "深藍 + 明黃點綴", "酒紅 + 裸粉高對比"],
      lighting: ["強聚焦 spotlight", "高反差棚拍光", "正面亮光", "側邊打光", "邊緣輪廓光", "局部高亮光效"],
      camera: ["低角度誇張視角", "正面強烈主視角", "近距離產品放大", "動態斜切視角", "局部裁切衝擊構圖", "中近景廣告主視角"],
      surfaceMaterial: ["亮面塑料感", "發光玻璃感", "平面數位海報感", "金屬反射點綴", "高彩貼紙材質感", "霓虹透明片層次"],
      accents: ["無額外元素，純靠字與產品", "高對比色塊", "動態箭頭或導視線條", "發光框線", "爆點貼紙感元素", "視覺節奏條帶"],
      textLayout: ["標題置中放大", "左上大標", "右上大標", "下方 CTA 橫條", "分欄式廣告排版", "主標與 CTA 疊在同一視覺軸線上"],
      typographyMood: ["超粗黑體衝擊感", "窄字高張力標題", "大寫標籤感節奏", "貼紙式促購字卡", "數位海報感強對比字級", "極大主標搭配小賣點"],
      pacing: ["節奏快狠準", "節奏強迫停留", "節奏像 performance ad", "節奏密集但清楚", "節奏爆點明確", "節奏先主標後 CTA"]
    }
  },
  warm: {
    label: "溫暖生活感",
    foundation:
      "畫面要有生活溫度、柔和氛圍、自然日常感，讓產品像真實存在於生活情境裡。整體感受要親近、舒服、有人味，像一張有情緒的 lifestyle 廣告素材。不要太商業硬賣，不要冷冰冰棚拍，不要做成過度刻意的擺拍感。",
    variants: {
      composition: ["餐桌感置中構圖", "居家角落場景構圖", "近距離生活特寫", "左情境右文字", "右情境左文字", "上情境下資訊分區"],
      background: ["柔白居家背景", "木質桌面背景", "淺米牆面背景", "晨光窗邊背景", "柔霧布料背景", "暖色生活場景背景"],
      color: ["奶油白 + 淺木色", "暖白 + 蜜桃粉", "米白 + 柔棕色", "淺杏色 + 霧粉", "奶茶色 + 白色", "柔灰白 + 暖木色"],
      lighting: ["晨光感自然光", "黃昏柔光", "窗邊側光", "柔霧漫射光", "輕逆光生活感", "低對比溫柔光線"],
      camera: ["平視生活視角", "輕俯拍餐桌視角", "側拍居家角落", "近距離手邊特寫", "中景生活場景", "帶前景柔焦的觀察視角"],
      surfaceMaterial: ["棉麻布料感", "淺木桌面感", "陶瓷餐具感", "霧面玻璃感", "暖色牆面質地", "自然紙感標籤材質"],
      accents: ["無額外元素，只留空氣感", "杯盤餐具", "布料或桌巾", "木托盤或生活器物", "柔焦前景", "小範圍植物點綴"],
      textLayout: ["左上角安靜排版", "右上角留白排版", "下方橫向排版", "中下區塊排版", "左下角文案", "產品旁小面積文字區塊"],
      typographyMood: ["手感溫柔無襯線", "細字生活誌感", "圓潤親切短句", "低調安靜小標題", "日常筆記感排法", "柔和卡片式資訊塊"],
      pacing: ["節奏慢一點", "節奏溫柔留白", "節奏像生活記事", "節奏先情境後產品", "節奏先感受後賣點", "節奏像靜物 lifestyle 廣告"]
    }
  },
  luxury: {
    label: "高級品牌版",
    foundation:
      "整體風格克制、精緻、成熟、有品牌高度，傳達 premium、信任感與審美品味。不追求花俏，而是追求質地、比例、材質、光影與視覺秩序。不要做成促銷圖，不要資訊爆量，不要有廉價電商感。除非本次色彩與背景變體真的要求深色，否則不要預設做成全黑或近黑畫面。",
    variants: {
      composition: ["置中單品精品構圖", "左文右產品", "右文左產品", "近景產品特寫", "精品櫥窗式構圖", "雜誌封面感上下分區構圖"],
      background: ["暖白精品棚拍背景", "香檳米色漸層背景", "霧面牆面質感", "精品展示檯面", "石材或礦物質感背景", "絲絨、紙張或高級材質背景"],
      color: ["香檳米 + 裸粉", "奶油白 + 金米色", "石材灰 + 玫瑰粉", "酒紅 + 裸粉", "墨綠 + 金米色", "紫灰 + 霧粉"],
      lighting: ["柔和棚拍光", "側光高級質感", "低對比霧面光", "聚焦 spotlight", "微逆光輪廓光", "安靜陰影層次"],
      camera: ["正面精品展示視角", "微俯拍陳列視角", "側拍材質特寫", "近距離細節放大", "中景櫥窗視角", "局部裁切的精品 editorial 視角"],
      surfaceMaterial: ["霧金金屬感", "石材檯面感", "絲絨布面感", "磨砂玻璃感", "高級紙卡感", "陶瓷與礦石混合材質"],
      accents: ["無元素極簡", "一個精品感道具", "細框線條", "半透明材質切片", "幾何底座", "陰影層次堆疊"],
      textLayout: ["左上安靜排版", "右上留白排版", "置中極簡排版", "下方精品橫條", "左下角低調標題", "右下角小面積資訊區"],
      typographyMood: ["細字精品標籤感", "高級雜誌感字級比例", "極簡 serif 混搭感", "字距拉開的品牌感", "低調壓印感短句", "精品卡片式小標籤"],
      pacing: ["節奏安靜高級", "節奏像品牌 KV", "節奏像精品陳列", "節奏先材質後賣點", "節奏先氣氛後資訊", "節奏克制但有記憶點"]
    }
  },
  saas: {
    label: "SaaS 服務版",
    foundation:
      "整體要像成熟 SaaS / B2B 數位服務廣告素材，重點是清楚、可信、專業，而且要讓人一眼看懂這是一個產品介面或工作流程解法。主角可以是 dashboard、產品畫面、功能模組、數據卡片、流程步驟或 UI mockup。不要做成實體商品廣告，不要生活風棚拍，不要過度情緒化，也不要太像一般品牌形象海報。",
    variants: {
      composition: ["置中 dashboard hero", "左文右 UI", "右文左 UI", "單一產品畫面放大", "多卡片功能模組拼接", "workflow step-by-step 分區構圖"],
      background: ["乾淨淺灰介面背景", "藍白漸層數位背景", "深藍產品舞台背景", "柔霧玻璃感背景", "網格數據背景", "低對比工作台背景"],
      color: ["深藍 + 白色 + 品牌粉點綴", "藍灰 + 青色點綴", "深海軍藍 + 電藍", "石墨灰 + 冷白", "白底 + 深藍資訊卡", "深藍 + 淡青 + 淺灰"],
      lighting: ["乾淨數位棚光", "柔和介面發光", "高對比產品 spotlight", "低對比專業光感", "冷調螢幕反射光", "微量邊緣發光"],
      camera: ["正視角 UI 展示", "輕微透視產品畫面", "俯視 workflow 板塊", "局部功能放大視角", "等角介面展示", "中景產品 mockup 視角"],
      surfaceMaterial: ["玻璃morphism 面板感", "霧面儀表板感", "平面產品截圖感", "輕立體卡片疊層", "細緻網格資料感", "螢幕投影質感"],
      accents: ["無額外元素，主打介面", "數據小卡點綴", "功能標籤 chips", "流程箭頭與連線", "圖表與 KPI 模組", "簡潔導引框線"],
      textLayout: ["左上標題 + 右側 UI", "置中主標 + 下方產品畫面", "左側賣點清單 + 右側 dashboard", "上方主標 + 下方功能卡片", "右下 CTA 區", "模組化 bento 排版"],
      typographyMood: ["清楚無襯線產品感", "B2B 簡報式字級對比", "介面型數位字感", "成熟 SaaS landing page 感", "功能模組標籤字感", "精準理性資訊字感"],
      pacing: ["節奏清楚專業", "節奏像產品發布素材", "節奏先問題後解法", "節奏先功能後價值", "節奏像 B2B 轉換廣告", "節奏像產品首頁 hero"]
    }
  }
};

const CREATIVE_MODEL_CONFIG = {
  none: {
    label: "不要模特兒",
    foundation: "不要出現完整人物，畫面主角必須是產品與版面設計本身。可以用物件、使用痕跡、桌面道具或情境線索補足畫面，但不要讓人像成為視覺主角。",
    variants: {
      presence: ["純產品主視覺", "產品搭配少量道具", "產品搭配情境痕跡", "產品搭配包裝陳列", "產品搭配靜物配件", "產品搭配使用前後線索"],
      framing: ["產品單獨置中", "產品偏左留文案區", "產品偏右留文案區", "近距離局部特寫", "中景完整展示", "多件組合陳列"],
      interaction: ["無人物互動", "僅保留使用痕跡", "僅保留器物陪襯", "僅保留場景暗示", "僅保留桌面生活感", "僅保留包裝與內容物關係"],
      styling: ["極簡陳列感", "生活靜物感", "商品棚拍感", "品牌展示櫥窗感", "乾淨電商精品感", "編排式產品介紹感"]
    }
  },
  adult: {
    label: "生活感模特兒",
    foundation: "可加入單一生活感模特兒，但人物不能壓過產品主體。重點是讓模特兒成為產品使用情境與情緒載體，而不是拍成時尚人物大片。",
    variants: {
      persona: ["都會上班族", "質感居家女性", "自然系生活男子", "年輕日常消費者", "成熟高質感使用者", "清爽健康感人物"],
      framing: ["半身入鏡", "三分之二身入鏡", "近距離臉部與產品同框", "側身與產品互動", "人物在後產品在前", "人物只佔畫面三分之一"],
      action: ["拿著產品觀看", "準備使用產品", "剛使用完露出滿意感", "把產品放到桌面", "在日常場景中自然接觸產品", "邊使用邊看向畫面外"],
      emotion: ["自然放鬆", "微笑有信任感", "安靜專注", "輕鬆舒服", "有被照顧的安心感", "清爽有精神"],
      styling: ["簡潔日常穿搭", "乾淨居家服裝", "質感中性色服裝", "品牌感淺色穿搭", "俐落都會感穿搭", "柔和生活感配色"],
      gaze: ["看向產品", "看向鏡頭", "看向畫面外", "低頭專注產品", "自然側看", "不強調眼神接觸"]
    }
  },
  family: {
    label: "家庭互動模特兒",
    foundation: "可加入家庭互動感模特兒，但畫面重點是分享、陪伴、一起使用的氛圍，不要變成純人物合照。產品仍要清楚可辨識，而且是互動中的重要物件。",
    variants: {
      grouping: ["一大一小互動", "雙人家庭互動", "三人輕家庭場景", "親子同框", "伴侶分享情境", "家人圍繞產品的片刻"],
      framing: ["中景餐桌互動", "半身親密互動", "側拍共享時刻", "產品在前人物在後", "局部人物加完整產品", "帶環境的家庭場景"],
      action: ["一起拿著產品", "準備分享產品", "剛開箱一起看", "餐桌上共同使用", "彼此遞產品", "圍繞產品自然交流"],
      emotion: ["溫暖陪伴", "開心分享", "自然笑意", "安心照顧感", "輕鬆團聚感", "柔和日常幸福感"],
      styling: ["柔和居家穿搭", "日常家庭服裝", "暖色系親和配色", "乾淨簡約家居感", "舒適休閒穿搭", "節制不誇張的品牌感服裝"],
      focus: ["產品清楚、人物稍退後", "人物互動清楚、產品在中心", "產品與手部最清楚", "互動畫面與產品各半", "以分享動作帶出產品", "以桌面場景襯托產品"]
    }
  },
  couple: {
    label: "雙人互動模特兒",
    foundation: "可加入雙人互動，但重點要放在一起使用、一起挑選、一起分享的關係感。不要拍成純婚紗感或人物寫真，產品仍然要是主要視覺物件。",
    variants: {
      grouping: ["伴侶自然互動", "雙人並肩使用", "一起挑選產品", "雙人分享時刻", "朋友系雙人情境", "雙人同框但產品在中心"],
      framing: ["半身雙人入鏡", "中景互動", "產品在前雙人在後", "側拍雙人互動", "近距離雙手與產品同框", "環境帶入式雙人場景"],
      action: ["一起拿著產品", "一人遞給另一人", "共同查看包裝", "共同使用或試用", "分享開箱瞬間", "圍繞產品自然聊天"],
      emotion: ["自然熟悉感", "輕鬆有默契", "開心分享", "低調高級感", "溫柔被照顧感", "一起做決定的安心感"],
      styling: ["簡約都會穿搭", "乾淨中性色服裝", "柔和淺色系穿搭", "高級生活感服裝", "日常質感休閒", "品牌感不誇張穿搭"],
      focus: ["產品在中線主視覺", "人物氛圍稍強但產品清楚", "以互動動作帶產品", "以桌面與產品做主體", "產品最清楚人物輔助", "人物與產品各半但視線回到產品"]
    }
  },
  senior: {
    label: "熟齡信任模特兒",
    foundation: "可加入熟齡人物，但要傳達穩定、可信、安心與生活智慧感，不要走刻板長輩宣傳照或過度戲劇化的醫療感。產品仍需清楚可辨識。",
    variants: {
      persona: ["熟齡質感女性", "熟齡沉穩男性", "溫暖家庭長輩", "自在健康系熟齡使用者", "高信任感熟齡人物", "生活感退休族角色"],
      framing: ["半身入鏡", "中景生活場景", "產品在前人物在後", "近距離手拿產品", "側拍自然互動", "人物只佔畫面三分之一"],
      action: ["拿著產品端詳", "準備使用產品", "使用後自然放鬆", "在桌邊整理產品", "向家人分享產品", "以日常節奏自然接觸產品"],
      emotion: ["安心穩定", "自然溫和", "被照顧感", "信任與放心", "沉穩有精神", "舒服自在"],
      styling: ["簡潔熟齡穿搭", "高質感中性色服裝", "乾淨居家服裝", "柔和針織或襯衫感", "品牌感穩重服裝", "日常但體面的穿搭"],
      gaze: ["看向產品", "看向鏡頭", "看向畫面外", "低頭專注產品", "自然側看", "不強調眼神接觸"]
    }
  },
  staff: {
    label: "專人示範模特兒",
    foundation: "可加入店員、顧問、服務人員或品牌示範者，但人物角色是協助理解產品，不是搶主角。要讓畫面像有人在清楚展示、介紹或協助使用。",
    variants: {
      persona: ["門市顧問", "品牌示範員", "產品顧問", "服務人員", "專業介紹者", "教學型示範角色"],
      framing: ["半身示範入鏡", "產品在前人物在後", "側身介紹產品", "近距離手持展示", "中景解說構圖", "人物只佔畫面三分之一"],
      action: ["拿著產品介紹", "指向產品重點", "示範使用方式", "將產品遞向鏡頭", "在桌面上擺放產品", "搭配簡潔手勢說明賣點"],
      emotion: ["清楚有自信", "親切可信", "俐落專業", "自然不壓迫", "友善說明感", "成熟穩定感"],
      styling: ["俐落工作穿搭", "品牌感制服元素", "乾淨襯衫或上衣", "簡潔專業休閒", "中性色門市風格", "低調不誇張服裝"],
      focus: ["產品最清楚人物輔助", "人物引導視線到產品", "產品與手部最清楚", "以示範動作帶出產品", "產品與資訊版位並重", "人物站位退後產品置前"]
    }
  },
  hand: {
    label: "只出現手部互動",
    foundation: "只加入手部互動，不要出現完整人物臉部。手部要讓畫面更有使用情境與節奏，但產品仍然要是主體，不能讓手勢太誇張或搶戲。",
    variants: {
      handType: ["單手拿取", "雙手捧持", "手部開箱", "手部操作產品", "手部遞出產品", "手部指向產品細節"],
      framing: ["近距離手部特寫", "中景手與產品同框", "局部裁切手部入鏡", "桌面上方俯拍手勢", "側拍手部接觸產品", "前景手勢搭配後方產品"],
      action: ["正在拿起產品", "正在打開包裝", "正在倒出或取用", "輕觸產品細節", "把產品放到場景中", "用手勢帶出賣點區塊"],
      styling: ["乾淨自然手部", "保養感細緻手部", "生活感真實手部", "中性色美感手部", "品牌感簡潔手勢", "柔和光線下的手部質感"],
      pace: ["安靜示範感", "俐落操作感", "溫柔觸碰感", "有節奏的導視感", "高級展示感", "自然生活使用感"]
    }
  }
};

const CREATIVE_IMAGE_MODEL_CONFIG = {
  "openai/gpt-5.4-image-2": { label: "GPT-5.4 Image 2", kind: "image" }
};

function normalizeCreativePlatform(value) {
  return Object.prototype.hasOwnProperty.call(CREATIVE_PLATFORM_META, value) ? value : "facebook";
}

function normalizeCreativeStyle(value) {
  return Object.prototype.hasOwnProperty.call(CREATIVE_STYLE_CONFIG, value) ? value : "clean";
}

function normalizeCreativeModel(value) {
  return Object.prototype.hasOwnProperty.call(CREATIVE_MODEL_CONFIG, value) ? value : "none";
}

function normalizeCreativeImageModel(value) {
  return Object.prototype.hasOwnProperty.call(CREATIVE_IMAGE_MODEL_CONFIG, value)
    ? value
    : "openai/gpt-5.4-image-2";
}

function getCreativePlatformMeta(platform) {
  return CREATIVE_PLATFORM_META[normalizeCreativePlatform(platform)];
}

function getCreativeStyleLabel(style) {
  return CREATIVE_STYLE_CONFIG[normalizeCreativeStyle(style)].label;
}

function getCreativeModelLabel(model) {
  return CREATIVE_MODEL_CONFIG[normalizeCreativeModel(model)].label;
}

function getCreativeImageModelLabel(model) {
  return CREATIVE_IMAGE_MODEL_CONFIG[normalizeCreativeImageModel(model)].label;
}

function getCreativeStyleConfig(style) {
  return CREATIVE_STYLE_CONFIG[normalizeCreativeStyle(style)];
}

function getCreativeModelConfig(model) {
  return CREATIVE_MODEL_CONFIG[normalizeCreativeModel(model)];
}

function resolveCreativeImageModelConfig(model) {
  return CREATIVE_IMAGE_MODEL_CONFIG[normalizeCreativeImageModel(model)];
}

function normalizeCreativeInput(body = {}) {
  const platform = normalizeCreativePlatform(body?.platform);
  const creativeProfile = String(body?.config?.creativeProfile || body?.creativeProfile || "").trim();
  const style = normalizeCreativeStyle(body?.config?.style);
  const talent = normalizeCreativeModel(body?.config?.talent || body?.config?.model);
  const imageModel = normalizeCreativeImageModel(body?.config?.imageModel);
  const platformMeta = getCreativePlatformMeta(platform);
  const productName = String(body?.productName || "未命名產品").trim();
  const primaryCopy = compactCreativeText(body?.primaryCopy || "");
  const title = compactCreativeText(body?.source?.title || productName);
  const bodyText = compactCreativeText(body?.source?.body || primaryCopy || "");
  const cta = compactCreativeText(body?.source?.cta || "了解更多");
  const benefitPoints = resolveCreativeBenefitPoints(body);
  const references = resolveCreativeReferences(body);
  const variantSelections = resolveCreativeVariantSelections(style, body?.config?.variantSelections);
  const talentSelections = resolveCreativeTalentSelections(talent, body?.config?.talentSelections);

  return {
    platform,
    platformMeta,
    creativeProfile,
    style,
    talent,
    imageModel,
    productName,
    primaryCopy,
    title,
    bodyText,
    cta,
    benefitPoints,
    references,
    variantSelections,
    talentSelections
  };
}

function buildCreativePrompt(body = {}) {
  const input = isNormalizedCreativeInput(body) ? body : normalizeCreativeInput(body);
  const { platformMeta, productName, primaryCopy, title, bodyText, style, talent, benefitPoints, talentSelections, references } = input;
  const styleConfig = CREATIVE_STYLE_CONFIG[style];
  const talentConfig = CREATIVE_MODEL_CONFIG[talent];
  const variants = input.variantSelections;
  const benefitLines = benefitPoints.map((item, index) => `${index + 1}. ${item}`);
  const sourceCopy = truncateText(primaryCopy || bodyText || title || productName, 220);
  const styleGuard = style === "luxury"
    ? "若本次變體不是深色背景，請明確使用淺色、米色、石材灰、香檳色或其他高級淺底，不要整張落成黑底。"
    : style === "bold"
      ? "若本次變體沒有指定深色背景，請優先使用亮色、高彩、撞色或漸層背景，不要整張默認落成黑底。"
      : style === "saas"
        ? "請明確讓畫面看起來像 SaaS 產品或數位服務，不要退回成一般消費品海報、生活風廣告或實體商品棚拍。"
      : "請讓畫面配色服從本次變體，不要默認套用同一種背景色。";
  const sizeInstruction = input.platform === "google_ads"
    ? `請根據以下主文案，產出一張 ${platformMeta.width}x${platformMeta.height} 的 ${platformMeta.label} 橫幅廣告主視覺，主體與文字請集中在中央安全區，避免貼邊。`
    : `請根據以下主文案，產出一張 ${platformMeta.width}x${platformMeta.height} 的 ${platformMeta.label} 廣告主視覺。`;
  const referenceInstructions = [];

  if (references.product) {
    referenceInstructions.push("有提供產品圖參考：請優先沿用產品本體、包裝、顏色、材質與外觀辨識，不要把產品換成另一個東西。");
  }

  if (references.logo) {
    referenceInstructions.push("有提供 logo 參考：若畫面適合放品牌識別，請盡量沿用這個 logo 的造型、字樣與品牌視覺，不要自行重畫成別的品牌。");
  }

  return [
    sizeInstruction,
    "文案 -",
    `${sourceCopy}`,
    "",
    `${input.cta}`,
    `視覺風格：${styleConfig.label}`,
    `固定風格骨架：${styleConfig.foundation}`,
    `本次變體請採用以下組合：\n- 構圖：${variants.composition}\n- 背景：${variants.background}\n- 色彩：${variants.color}\n- 光線：${variants.lighting}\n- 鏡頭視角：${variants.camera}\n- 材質語感：${variants.surfaceMaterial}\n- 輔助元素：${variants.accents}\n- 文字版位：${variants.textLayout}\n- 字體情緒：${variants.typographyMood}\n- 視覺節奏：${variants.pacing}`,
    `模特兒設定：${talentConfig.label}`,
    `模特兒骨架：${talentConfig.foundation}`,
    `本次模特兒變體請採用以下組合：\n${Object.entries(talentSelections).map(([key, value]) => `- ${getTalentDimensionLabel(key)}：${value}`).join("\n")}`,
    "圖上文案規則：1. 圖上不能只有產品名或一句空泛標題，至少要放 2 到 3 個和賣點相關的短文案。2. 這 2 到 3 個賣點必須優先從主文案與提供的產品優點中萃取，不要自行發明新的功效或承諾。3. 每個賣點請寫成短句、短標籤或短 bullet，重點清楚、好掃讀，不要整段長文。4. 除了主標外，畫面上至少還要看得到 2 個賣點；如果版面足夠，最多可放到 3 個。",
    benefitLines.length ? "建議優先使用以下賣點：" : "若可萃取到賣點，請優先轉成 2 到 3 個短句放上圖。",
    ...benefitLines,
    ...referenceInstructions,
    "這張圖會和外部文案一起投放，圖片的任務是先吸引注意，不是把所有文案完整排進圖內。",
    "同一風格下請優先做出和常見結果不同的變體，不要重複常見的背景色、構圖與版面配置。",
    "請把這次抽中的變體真的反映在畫面上，不要只換一個小地方，其餘設計還是沿用上一張的慣性解法。",
    "若同風格連續生成多張，請主動讓鏡頭、背景結構、材質、字體情緒、節奏至少有 3 個維度明顯不同。",
    "若同一個模特兒類型連續生成多張，請主動讓人物角色感、鏡位、動作或情緒至少有 2 個維度明顯不同。",
    styleGuard,
    "若畫面需要文字，請只使用繁體中文，不要使用簡體中文。"
  ].join("\n");
}

async function generateCreativeAsset(body = {}, options = {}) {
  const input = normalizeCreativeInput(body);
  const prompt = buildCreativePrompt(input);
  const fallbackAsset = buildFallbackCreativeAsset(input, prompt);
  const providerConfig = resolveCreativeProviderConfig({
    model: input.imageModel,
    ...options
  });

  if (!providerConfig.apiKey) {
    return {
      ...fallbackAsset,
      mode: "mock",
      provider: "creative-fallback"
    };
  }

  try {
    const imageResult = await generateImageWithFallback(prompt, input, providerConfig);
    return {
      ...fallbackAsset,
      imageUrl: imageResult.imageUrl,
      mimeType: imageResult.mimeType,
      mode: "live",
      provider: imageResult.provider,
      imageModel: imageResult.model,
      renderModel: imageResult.renderModel || imageResult.model,
      orchestratorModel: imageResult.orchestratorModel || "",
      prompt: imageResult.prompt || fallbackAsset.prompt,
      usage: imageResult.usage || null
    };
  } catch (error) {
    return {
      ...fallbackAsset,
      mode: "mock",
      provider: "creative-fallback",
      warning: formatError(error)
    };
  }
}

function buildCreativeAsset(body = {}) {
  const input = isNormalizedCreativeInput(body) ? body : normalizeCreativeInput(body);
  const prompt = buildCreativePrompt(input);
  return buildFallbackCreativeAsset(input, prompt);
}

function isNormalizedCreativeInput(value) {
  return Boolean(
    value &&
    value.platformMeta &&
    value.variantSelections &&
    value.talentSelections &&
    Array.isArray(value.benefitPoints)
  );
}

function resolveCreativeReferences(body = {}) {
  const references = body?.references && typeof body.references === "object" ? body.references : {};
  return {
    logo: normalizeCreativeReference(references.logo),
    product: normalizeCreativeReference(references.product)
  };
}

function normalizeCreativeReference(value) {
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

function resolveCreativeVariantSelections(style, providedSelections) {
  const config = CREATIVE_STYLE_CONFIG[normalizeCreativeStyle(style)];
  const dimensions = config.variants;
  const selections = {};

  for (const key of Object.keys(dimensions)) {
    const candidates = dimensions[key];
    const provided = providedSelections?.[key];
    selections[key] = candidates.includes(provided)
      ? provided
      : candidates[Math.floor(Math.random() * candidates.length)];
  }

  return selections;
}

function resolveCreativeTalentSelections(talent, providedSelections) {
  const config = CREATIVE_MODEL_CONFIG[normalizeCreativeModel(talent)];
  const dimensions = config.variants;
  const selections = {};

  for (const key of Object.keys(dimensions)) {
    const candidates = dimensions[key];
    const provided = providedSelections?.[key];
    selections[key] = candidates.includes(provided)
      ? provided
      : candidates[Math.floor(Math.random() * candidates.length)];
  }

  return selections;
}

function getTalentDimensionLabel(key) {
  const labelMap = {
    presence: "出現方式",
    framing: "人物鏡位",
    interaction: "互動方式",
    styling: "人物風格",
    persona: "角色感",
    action: "人物動作",
    emotion: "人物情緒",
    gaze: "視線方向",
    grouping: "家庭組合",
    focus: "人物與產品焦點分配",
    handType: "手部形式",
    pace: "手部節奏"
  };

  return labelMap[key] || key;
}

function resolveCreativeBenefitPoints(body = {}) {
  const explicitBenefits = Array.isArray(body?.source?.benefits)
    ? body.source.benefits
    : Array.isArray(body?.benefits)
      ? body.benefits
      : [];
  const cleanedExplicit = explicitBenefits
    .map((item) => normalizeCreativeBenefitText(item))
    .filter(Boolean);

  if (cleanedExplicit.length >= 2) {
    return cleanedExplicit.slice(0, 3);
  }

  const extracted = extractCreativeBenefitCandidates([
    body?.source?.title,
    body?.source?.body,
    body?.primaryCopy
  ]);
  const merged = dedupeCreativeBenefits([...cleanedExplicit, ...extracted]);
  return merged.slice(0, Math.min(3, Math.max(2, merged.length)));
}

function extractCreativeBenefitCandidates(values) {
  const candidates = [];
  for (const value of values) {
    const parts = String(value || "")
      .split(/[。\n!！?？;；]+/g)
      .map((item) => item.trim())
      .filter(Boolean);
    for (const part of parts) {
      const normalized = normalizeCreativeBenefitText(part);
      if (normalized) {
        candidates.push(normalized);
      }
    }
  }
  return dedupeCreativeBenefits(candidates);
}

function normalizeCreativeBenefitText(value) {
  const collapsed = String(value || "")
    .replace(/^[\-\d.、\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!collapsed) {
    return "";
  }

  const shortened = truncateText(collapsed, 18).replace(/[。.!！?？,，、:：；;]+$/g, "");
  return shortened.length >= 2 ? shortened : "";
}

function dedupeCreativeBenefits(items) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const normalizedKey = String(item || "").replace(/\s+/g, "").toLowerCase();
    if (!normalizedKey || seen.has(normalizedKey)) {
      continue;
    }
    seen.add(normalizedKey);
    result.push(item);
  }

  return result;
}

function resolveCreativeProviderConfig(options = {}) {
  return {
    apiKey: String(
      options.apiKey ||
      process.env.OPENROUTER_API_KEY ||
      process.env.OPENAI_API_KEY ||
      ""
    ).trim(),
    model: String(
      options.model ||
      process.env.CREATIVE_IMAGE_MODEL ||
      process.env.OPENROUTER_IMAGE_MODEL ||
      "openai/gpt-5.4-image-2"
    ).trim(),
    apiUrl: String(options.apiUrl || process.env.OPENROUTER_IMAGE_API_URL || OPENROUTER_IMAGE_API_URL).trim(),
    fetchImpl: options.fetchImpl || globalThis.fetch
  };
}

async function generateImageWithFallback(prompt, input, providerConfig) {
  const preferredModel = normalizeCreativeImageModel(providerConfig.model);
  const attempted = new Set();
  const selections = [preferredModel].filter((value) => {
    const key = String(value || "").trim();
    if (!key || attempted.has(key)) {
      return false;
    }
    attempted.add(key);
    return true;
  });

  let lastError = null;
  for (const selection of selections) {
    const selectionConfig = resolveCreativeImageModelConfig(selection);
    try {
      return await generateImageWithOpenRouter(prompt, input, {
        ...providerConfig,
        model: selection,
        resolution: selectionConfig.resolution || input.platformMeta.resolution
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("creative_image_generation_failed");
}

async function generateImageWithOpenRouter(prompt, input, providerConfig) {
  const payload = {
    model: providerConfig.model,
    prompt,
    aspect_ratio: input.platformMeta.apiAspectRatio || input.platformMeta.aspectRatio,
    resolution: providerConfig.resolution || input.platformMeta.resolution,
    n: 1
  };

  const inputReferences = await buildOpenRouterInputReferences(input.references);
  if (inputReferences.length > 0) {
    payload.input_references = inputReferences;
  }

  const response = await providerConfig.fetchImpl(providerConfig.apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${providerConfig.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`creative_image_invalid_json:${response.status}`);
  }

  if (!response.ok || parsed?.error) {
    const message = parsed?.error?.message || parsed?.error || raw || `creative_image_failed:${response.status}`;
    throw new Error(String(message));
  }

  const first = Array.isArray(parsed?.data) ? parsed.data[0] : null;
  const b64 = first?.b64_json;
  if (!b64) {
    throw new Error("creative_image_missing_output");
  }

  const mimeType = String(first?.media_type || "image/png");
  const imageUrl = `data:${mimeType};base64,${b64}`;
  return {
    imageUrl: conformImageToPlatformFrame(imageUrl, mimeType, input.platformMeta),
    mimeType,
    usage: parsed?.usage || null,
    provider: "openrouter-image",
    model: providerConfig.model
  };
}

async function buildOpenRouterInputReferences(references = {}) {
  const output = [];
  for (const item of [references.product, references.logo]) {
    const normalized = await normalizeReferenceForImageApi(item);
    if (!normalized) {
      continue;
    }
    output.push({
      type: "image_url",
      image_url: {
        url: normalized
      }
    });
  }
  return output;
}

async function normalizeReferenceForImageApi(reference) {
  if (!reference?.dataUrl) {
    return "";
  }

  const mimeType = String(reference.mimeType || "").trim().toLowerCase();
  if (mimeType !== "image/svg+xml") {
    return reference.dataUrl;
  }

  return await rasterizeSvgReferenceToPngDataUrl(reference.dataUrl);
}

async function rasterizeSvgReferenceToPngDataUrl(dataUrl) {
  if (!sharp) {
    return "";
  }

  const decoded = decodeDataUrl(dataUrl);
  if (!decoded || decoded.mimeType !== "image/svg+xml") {
    return "";
  }

  const pngBuffer = await sharp(decoded.buffer, { density: 288 })
    .resize({
      width: 1024,
      height: 1024,
      fit: "inside",
      withoutEnlargement: true
    })
    .png()
    .toBuffer();

  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

function decodeDataUrl(dataUrl) {
  const raw = String(dataUrl || "").trim();
  const matched = raw.match(/^data:([^;,]+)?((?:;[^;,=]+=[^;,]+)*)(;base64)?,([\s\S]*)$/i);
  if (!matched) {
    return null;
  }

  const mimeType = String(matched[1] || "").trim().toLowerCase();
  const isBase64 = Boolean(matched[3]);
  const payload = matched[4] || "";
  return {
    mimeType,
    buffer: isBase64
      ? Buffer.from(payload, "base64")
      : Buffer.from(decodeURIComponent(payload), "utf8")
  };
}

function conformImageToPlatformFrame(imageUrl, mimeType, platformMeta) {
  const requestedAspectRatio = String(platformMeta.apiAspectRatio || platformMeta.aspectRatio || "").trim();
  const displayAspectRatio = String(platformMeta.aspectRatio || "").trim();
  if (!imageUrl || !requestedAspectRatio || requestedAspectRatio === displayAspectRatio) {
    return imageUrl;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${platformMeta.width}" height="${platformMeta.height}" viewBox="0 0 ${platformMeta.width} ${platformMeta.height}">
      <rect width="${platformMeta.width}" height="${platformMeta.height}" fill="#ffffff"/>
      <image href="${imageUrl}" width="${platformMeta.width}" height="${platformMeta.height}" preserveAspectRatio="xMidYMid slice"/>
    </svg>
  `.replace(/\n\s+/g, " ").trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}


function buildFallbackCreativeAsset(input, prompt) {
  const { platform, platformMeta, style, talent, imageModel, productName, title, bodyText, cta, variantSelections, talentSelections } = input;
  return {
    platform,
    platformLabel: platformMeta.label,
    sizeLabel: platformMeta.sizeLabel || `${platformMeta.width} x ${platformMeta.height}`,
    creativeProfile: String(input?.creativeProfile || "").trim(),
    style,
    talent,
    model: talent,
    imageModel,
    variantSelections,
    talentSelections,
    prompt,
    imageUrl: buildCreativeSvgDataUrl({ platformMeta, style, talent, productName, title, bodyText, cta }),
    alt: `${productName} ${platformMeta.label} 素材預覽`
  };
}

function buildCreativeSvgDataUrl({ platformMeta, style, talent, productName, title, bodyText, cta }) {
  const palette = getCreativePalette(style);
  const product = escapeHtml(truncateText(productName, 24));
  const modelBadge = talent === "none"
    ? ""
    : `<text x="${platformMeta.width - 64}" y="92" text-anchor="end" font-size="28" fill="${palette.badgeText}" font-family="Avenir Next, Noto Sans TC, sans-serif">TALENT ON</text>`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${platformMeta.width}" height="${platformMeta.height}" viewBox="0 0 ${platformMeta.width} ${platformMeta.height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.bgStart}" />
          <stop offset="100%" stop-color="${palette.bgEnd}" />
        </linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.panelStart}" />
          <stop offset="100%" stop-color="${palette.panelEnd}" />
        </linearGradient>
      </defs>
      <rect width="${platformMeta.width}" height="${platformMeta.height}" fill="url(#bg)" rx="28" />
      <circle cx="${platformMeta.width * 0.16}" cy="${platformMeta.height * 0.18}" r="${platformMeta.width * 0.13}" fill="${palette.glowA}" />
      <circle cx="${platformMeta.width * 0.84}" cy="${platformMeta.height * 0.2}" r="${platformMeta.width * 0.18}" fill="${palette.glowB}" />
      <rect x="48" y="48" width="${platformMeta.width - 96}" height="${platformMeta.height - 96}" rx="34" fill="url(#panel)" stroke="${palette.border}" />
      <rect x="${platformMeta.width * 0.62}" y="${platformMeta.height * 0.18}" width="${platformMeta.width * 0.24}" height="${platformMeta.height * 0.52}" rx="28" fill="${palette.card}" stroke="${palette.border}" />
      <circle cx="${platformMeta.width * 0.74}" cy="${platformMeta.height * 0.34}" r="${platformMeta.width * 0.07}" fill="${palette.cardAccent}" />
      <rect x="${platformMeta.width * 0.66}" y="${platformMeta.height * 0.48}" width="${platformMeta.width * 0.16}" height="${platformMeta.height * 0.05}" rx="18" fill="${palette.cardAccentSoft}" />
      <rect x="${platformMeta.width * 0.66}" y="${platformMeta.height * 0.56}" width="${platformMeta.width * 0.12}" height="${platformMeta.height * 0.05}" rx="18" fill="${palette.cardAccentSoft}" />
      ${talent === "none" ? "" : `<circle cx="${platformMeta.width * 0.78}" cy="${platformMeta.height * 0.5}" r="${platformMeta.width * 0.045}" fill="${palette.modelSkin}" /><rect x="${platformMeta.width * 0.73}" y="${platformMeta.height * 0.55}" width="${platformMeta.width * 0.1}" height="${platformMeta.height * 0.12}" rx="30" fill="${palette.modelOutfit}" />`}
      <text x="88" y="104" font-size="28" letter-spacing="5" fill="${palette.overline}" font-family="Avenir Next, Noto Sans TC, sans-serif">VISUAL CONCEPT</text>
      ${modelBadge}
      <text x="88" y="${platformMeta.height - 34}" font-size="26" fill="${palette.product}" font-family="Avenir Next, Noto Sans TC, sans-serif">${product}</text>
    </svg>
  `.replace(/\n\s+/g, " ").trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getCreativePalette(style) {
  const palettes = {
    clean: {
      bgStart: "#F7F9FC", bgEnd: "#EAEFF6", panelStart: "#FFFFFF", panelEnd: "#F9FBFD", border: "rgba(24,39,75,0.10)",
      glowA: "rgba(80,126,255,0.18)", glowB: "rgba(24,39,75,0.10)", overline: "#4F6EF7", headline: "#18274B",
      body: "#42526E", ctaBg: "#18274B", ctaText: "#FFFFFF", product: "#4F6EF7", badgeText: "#18274B",
      card: "#EEF3FF", cardAccent: "#5C7CFA", cardAccentSoft: "#DCE6FF", modelSkin: "#F1C7A8", modelOutfit: "#18274B"
    },
    bold: {
      bgStart: "#111827", bgEnd: "#1F2937", panelStart: "#18212F", panelEnd: "#0F172A", border: "rgba(255,255,255,0.12)",
      glowA: "rgba(255,120,72,0.28)", glowB: "rgba(255,206,84,0.18)", overline: "#FFB38A", headline: "#FFFFFF",
      body: "#F5F7FA", ctaBg: "#FF6A3D", ctaText: "#FFFFFF", product: "#FFD1BF", badgeText: "#FFDCCF",
      card: "#FF6A3D", cardAccent: "#FFD166", cardAccentSoft: "#FF9E7A", modelSkin: "#F1C5AA", modelOutfit: "#FFD166"
    },
    warm: {
      bgStart: "#FFF8F1", bgEnd: "#F5E6D6", panelStart: "#FFFFFF", panelEnd: "#FBF4EC", border: "rgba(109,76,65,0.10)",
      glowA: "rgba(232,143,101,0.22)", glowB: "rgba(214,180,154,0.20)", overline: "#B76E4D", headline: "#3E302A",
      body: "#5B4B42", ctaBg: "#C97A51", ctaText: "#FFFFFF", product: "#A65A3A", badgeText: "#A65A3A",
      card: "#FBECDD", cardAccent: "#E39A6B", cardAccentSoft: "#F3C9A8", modelSkin: "#F1C5AA", modelOutfit: "#B76E4D"
    },
    luxury: {
      bgStart: "#F6F1E8", bgEnd: "#E8DED0", panelStart: "#FFFDF9", panelEnd: "#F2EAE0", border: "rgba(78,61,44,0.10)",
      glowA: "rgba(190,156,103,0.16)", glowB: "rgba(126,108,88,0.10)", overline: "#A27B49", headline: "#33261D",
      body: "#5E4B3D", ctaBg: "#A27B49", ctaText: "#FFFDF8", product: "#8A6A44", badgeText: "#8A6A44",
      card: "#E9DCC9", cardAccent: "#C5A06A", cardAccentSoft: "#F3E7D6", modelSkin: "#E7B898", modelOutfit: "#8A6A44"
    },
    saas: {
      bgStart: "#F5F8FC", bgEnd: "#EAF1FB", panelStart: "#FFFFFF", panelEnd: "#F6F9FE", border: "rgba(23,43,77,0.10)",
      glowA: "rgba(64,124,255,0.14)", glowB: "rgba(20,184,166,0.10)", overline: "#407CFF", headline: "#172B4D",
      body: "#42526E", ctaBg: "#172B4D", ctaText: "#FFFFFF", product: "#407CFF", badgeText: "#172B4D",
      card: "#EEF4FF", cardAccent: "#4F8CFF", cardAccentSoft: "#D9E7FF", modelSkin: "#E7B898", modelOutfit: "#2A4365"
    }
  };

  return palettes[style] || palettes.clean;
}

function compactCreativeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function truncateText(value, maxLength) {
  const chars = Array.from(String(value || "").trim());
  if (chars.length <= maxLength) {
    return chars.join("");
  }

  return `${chars.slice(0, Math.max(0, maxLength - 1)).join("")}…`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

module.exports = {
  buildCreativeAsset,
  buildCreativePrompt,
  generateCreativeAsset,
  getCreativeImageModelLabel,
  getCreativeModelConfig,
  getCreativePlatformMeta,
  getCreativeStyleConfig,
  getCreativeStyleLabel,
  getCreativeModelLabel,
  normalizeCreativeImageModel,
  normalizeCreativePlatform,
  normalizeCreativeStyle,
  normalizeCreativeModel,
  normalizeCreativeReference,
  resolveCreativeVariantSelections,
  resolveCreativeTalentSelections,
  resolveCreativeImageModelConfig,
  resolveCreativeProviderConfig,
  buildOpenRouterInputReferences
};
