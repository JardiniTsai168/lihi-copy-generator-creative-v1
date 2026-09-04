const assert = require("node:assert");
const { describe, it } = require("node:test");
const { buildOpenRouterInputReferences, normalizeCreativeReference } = require("../creative-engine.js");
const SVG_DATA_URL = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22%23FF6B9D%22%2F%3E%3C%2Fsvg%3E";

describe("Creative References", () => {
  describe("normalizeCreativeReference", () => {
    it("應回傳 null 當輸入為空值", () => {
      assert.strictEqual(normalizeCreativeReference(null), null);
      assert.strictEqual(normalizeCreativeReference(undefined), null);
      assert.strictEqual(normalizeCreativeReference({}), null);
    });

    it("應回傳 null 當 dataUrl 為空字串", () => {
      const ref = { dataUrl: "", name: "test.png", mimeType: "image/png" };
      assert.strictEqual(normalizeCreativeReference(ref), null);
    });

    it("應回傳標準化的參考物件當 dataUrl 有效", () => {
      const ref = {
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        name: "logo.png",
        mimeType: "image/png"
      };
      const result = normalizeCreativeReference(ref);
      assert.strictEqual(result.dataUrl, ref.dataUrl);
      assert.strictEqual(result.name, "logo.png");
      assert.strictEqual(result.mimeType, "image/png");
    });

    it("應處理缺少 name 或 mimeType 的輸入", () => {
      const ref = {
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      };
      const result = normalizeCreativeReference(ref);
      assert.strictEqual(result.dataUrl, ref.dataUrl);
      assert.strictEqual(result.name, "");
      assert.strictEqual(result.mimeType, "");
    });
  });

  describe("buildOpenRouterInputReferences", () => {
    it("應回傳空陣列當沒有參考圖片", async () => {
      const result = await buildOpenRouterInputReferences({});
      assert.deepStrictEqual(result, []);
    });

    it("應回傳空陣列當 logo 跟 product 都為 null", async () => {
      const result = await buildOpenRouterInputReferences({
        logo: null,
        product: null
      });
      assert.deepStrictEqual(result, []);
    });

    it("應只包含 product 當只有 product 有 dataUrl", async () => {
      const productDataUrl = "data:image/png;base64,product123";
      const result = await buildOpenRouterInputReferences({
        logo: null,
        product: { dataUrl: productDataUrl, name: "product.png", mimeType: "image/png" }
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].type, "image_url");
      assert.strictEqual(result[0].image_url.url, productDataUrl);
    });

    it("應把 svg logo 轉成 png 後再帶進 references", async () => {
      const result = await buildOpenRouterInputReferences({
        logo: { dataUrl: SVG_DATA_URL, name: "logo.svg", mimeType: "image/svg+xml" },
        product: null
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].type, "image_url");
      assert.match(result[0].image_url.url, /^data:image\/png;base64,/);
    });

    it("應同時包含 product 跟已轉成 png 的 logo", async () => {
      const productDataUrl = "data:image/png;base64,product123";
      const result = await buildOpenRouterInputReferences({
        logo: { dataUrl: SVG_DATA_URL, name: "logo.svg", mimeType: "image/svg+xml" },
        product: { dataUrl: productDataUrl, name: "product.png", mimeType: "image/png" }
      });
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].type, "image_url");
      assert.strictEqual(result[0].image_url.url, productDataUrl);
      assert.strictEqual(result[1].type, "image_url");
      assert.match(result[1].image_url.url, /^data:image\/png;base64,/);
    });

    it("應忽略沒有 dataUrl 的參考物件", async () => {
      const result = await buildOpenRouterInputReferences({
        logo: { dataUrl: "", name: "logo.png", mimeType: "image/png" },
        product: { dataUrl: "data:image/png;base64,product123", name: "product.png", mimeType: "image/png" }
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].image_url.url, "data:image/png;base64,product123");
    });
  });
});
