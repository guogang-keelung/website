import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { peopleSources, assertPeopleSourceIntegrity } from "./people-source-integrity.mjs";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const worker = (await import(workerUrl.href)).default;

async function render(pathname) {
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

const routes = [
  "/",
  "/goods",
  "/goods/goods-01",
  "/guogang",
  "/people",
  "/people/bottle-cap-grandma",
  "/people/breakfast-shop-owner",
  "/people/community-kitchen-mother",
  "/people/couple-story-one",
  "/people/couple-story-two",
  "/people/community-volunteer",
  "/goods/goods-02",
  "/goods/goods-03",
  "/goods/goods-04",
  "/goods/goods-05",
  "/about",
];

test("all required public routes render", async () => {
  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should return 200`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  }
});

test("self-hosted serif Unicode ranges cover all published Chinese text", async () => {
  const css = await readFile(new URL("../app/fonts.css", import.meta.url), "utf8");
  const globals = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(globals, /@import "\.\/fonts\.css"/);
  assert.doesNotMatch(css, /url\(https?:/);
  const covered = new Set();
  for (const range of css.matchAll(/U\+([0-9a-f]+)(?:-([0-9a-f]+))?/gi)) {
    const start = parseInt(range[1], 16), end = parseInt(range[2] ?? range[1], 16);
    for (let code = start; code <= end; code++) covered.add(code);
  }
  for (const route of routes) {
    const html = await (await render(route)).text();
    const missing = [...new Set(html.match(/[\u3000-\u303f\u3400-\u9fff]/gu) ?? [])].filter(character => !covered.has(character.codePointAt(0)));
    assert.deepEqual(missing, [], `${route} must not need a system font for Chinese glyphs`);
  }
});

test("homepage scroll story maps all four supplied photos in order", async () => {
  const source = await readFile(
    new URL("../app/components/HomeScrollStory.tsx", import.meta.url),
    "utf8",
  );
  const desktopImages = ["01", "02", "03", "04"].map(
    (number) => `home-scroll-${number}.webp`,
  );

  for (const number of ["01", "02", "03", "04"]) {
    assert.match(source, new RegExp(`home-scroll-${number}\\.webp`));
    assert.match(source, new RegExp(`home-scroll-${number}-1280\\.webp`));
  }

  assert.deepEqual(
    desktopImages.map((image) => source.indexOf(image)),
    desktopImages.map((image) => source.indexOf(image)).toSorted((a, b) => a - b),
    "homepage scroll photos should follow scene order",
  );
});

test("goods catalog contains every existing product story without detail-page navigation", async () => {
  const html = await (await render("/goods")).text();
  for (const number of ["01", "02", "03", "04", "05"]) {
    const detail = await (await render(`/goods/goods-${number}`)).text();
    const story = detail.match(/<section class="article-body good-story-body">([\s\S]*?)<\/section>/)?.[1];
    assert.ok(story, `existing story ${number} is available`);
    const paragraph = story.match(/<p>([\s\S]*?)<\/p>/);
    assert.ok(paragraph && html.includes(paragraph[1]), `complete product story ${number} remains unchanged`);
    assert.match(html, new RegExp(`id="goods-${number}"`));
  }
  assert.doesNotMatch(html, /href="[^\"]*\/goods\/goods-\d+/);
  assert.doesNotMatch(html, /查看這份好味/);
  assert.doesNotMatch(html, /catalog-purchase/);
  assert.equal((html.match(/<p>如欲訂購或了解更多，歡迎來電洽詢過港社區發展協會。<\/p>/g) ?? []).length, 1, "shared telephone information appears once");
});

test("chapter order, supplied goods photos and interactive map match the current site", async () => {
  const goodsResponse = await render("/goods");
  const goodsHtml = await goodsResponse.text();
  assert.match(goodsHtml, /page-intro-index[^>]*>03</);
  assert.match(goodsHtml, /hero-updated\.webp/);
  assert.doesNotMatch(goodsHtml, /catalog-index|product-gallery-count|product-gallery-dots|product-gallery-controls/);
  assert.doesNotMatch(goodsHtml, /商品完整照｜待提供|商品製作過程照｜待提供|商品料理或食用情境照｜待提供/);
  assert.match(goodsHtml, /updated-20260919\/collection\.webp/);
  for (let index = 1; index <= 5; index++) {
    const id = String(index).padStart(2, "0");
    assert.match(goodsHtml, new RegExp(`processed-20260920/${id}-cutout${id === "04" ? "-rim" : ""}\\.webp`));
    assert.match(goodsHtml, new RegExp(`updated-20260919/${id}-photo\\.webp`));
  }

  const guogangResponse = await render("/guogang");
  const guogangHtml = await guogangResponse.text();
  assert.match(guogangHtml, /page-intro-index[^>]*>01</);
  assert.match(guogangHtml, /認識過港\.webp/);
  assert.match(guogangHtml, /在這裡落腳/);
  assert.match(guogangHtml, /可探索的過港手繪生活地圖/);
  assert.match(guogangHtml, /guogang-map-2026\/background\.webp/);
  assert.match(guogangHtml, /guogang-map-2026\/shengguang-church\.webp/);
  assert.match(guogangHtml, /guogang-map-2026\/nuanjiang-walkway\.webp/);
  assert.match(guogangHtml, /小倆口福利社/);
  assert.match(guogangHtml, /過港社區發展協會/);
  for (const locationName of ["小倆口福利社", "美食坊早餐店", "舊警察宿舍", "暖江國小", "聖光堂", "黃蠟石文化館", "過港社區發展協會", "過港幼兒園", "過港郵局", "暖江步道", "暖江兒童公園", "北方大陸餅", "暖新住民會館", "過港福德宮"]) {
    assert.match(guogangHtml, new RegExp(locationName));
  }
  for (const name of ["港式／原味蘿蔔糕", "鴉片鐵蛋", "雙匯水餃", "清潤銀耳露", "海涼石花凍｜黑糖／百香果"]) {
    assert.match(goodsHtml, new RegExp(name));
  }
  assert.doesNotMatch(goodsHtml, /商品故事與特色待社區確認後補上|味道或特色｜待確認|製作者｜待確認/);
  assert.doesNotMatch(guogangHtml, /地點名單待確認/);
  assert.match(guogangHtml, /故事走到今天/);
  assert.doesNotMatch(guogangHtml, /ABOUT THE SOURCE/);
});

test("People article titles preserve the Google document's explicit line breaks", async () => {
  const peopleStories = await readFile(new URL("../app/data/peopleStories.ts", import.meta.url), "utf8");
  const stories = JSON.parse(peopleStories.split("export const PEOPLE_STORIES: PeopleStory[] = ")[1].split(/;\r?\n/)[0]);

  for (const [slug, lines] of Object.entries({
    "bottle-cap-grandma": ["把時間，", "一個瓶蓋一個瓶蓋留在過港。"],
    "breakfast-shop-owner": ["二十五年，早晨裡的人慢慢熟了。"],
    "couple-story-one": ["四十多年，他們一起把日子過到了過港。"],
    "couple-story-two": ["去看看，最近好不好。"],
  })) {
    assert.deepEqual(stories.find((story) => story.slug === slug).titleLines, lines);
  }
});

test("finalized people stories render complete editorial pages from shared data", async () => {
  for (const source of peopleSources) {
    const route = `/people/${source.slug}`;
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should return 200`);
    const html = await response.text();
    assertPeopleSourceIntegrity(html, source);
    assert.match(html, /people-article-page/);
    assert.doesNotMatch(html, /people-article-inline-image/);
    const galleryStart = html.indexOf('class="people-article-gallery"');
    assert.ok(galleryStart > html.indexOf('class="people-article-ending"'), "gallery follows the complete story");
    const bodyBeforeGallery = html.slice(html.indexOf('<article class="people-article-content">'), galleryStart);
    assert.doesNotMatch(bodyBeforeGallery, /<img\b/, "no photos interrupt the article");
    assert.match(html, /← 上一篇人物/);
    assert.match(html, /返回全部人物/);
    assert.match(html, /下一篇人物 →/);
  }
});

test("shared Drive people photos are connected to all six finalized articles", async () => {
  const photos = await readFile(new URL("../app/data/peopleStoryPhotos.ts", import.meta.url), "utf8");
  for (const slug of ["bottle-cap-grandma", "breakfast-shop-owner", "community-kitchen-mother", "community-volunteer", "couple-story-one", "couple-story-two"]) {
    assert.match(photos, new RegExp(`"${slug}"`));
  }
  assert.match(photos, /people-updated-20260920\/lin-hero\.webp/);
  assert.match(photos, /people-updated-20260920\/breakfast-hero\.webp/);
  assert.match(photos, /people-updated-20260920\/kitchen-hero\.webp/);
  assert.match(photos, /people-updated-20260920\/meihua-hero\.webp/);
});

test("about page does not publish the supplied organization chart", async () => {
  const response = await render("/about");
  const html = await response.text();
  assert.match(html, /page-intro-index[^>]*>04</);
  assert.match(html, /about-updated-20260920\/hero\.webp/);
  assert.doesNotMatch(html, /association-structure\.png|組織架構圖|會員大會/);
});

test("retired story routes point visitors to the association history", async () => {
  for (const route of ["/stories", "/stories/story-01"]) {
    const response = await render(route);
    assert.ok([307, 308].includes(response.status), `${route} should redirect`);
    assert.equal(response.headers.get("location"), "/about#history");
  }
});

test("placeholder people detail pages are no longer public", async () => {
  const response = await render("/people/interview-01");
  assert.equal(response.status, 404);
});

test("contact actions use the existing community telephone", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /href="tel:0224588802"/);
  assert.doesNotMatch(html, /class="button button-phone/);
  assert.doesNotMatch(html, /line\.me|lin\.ee/i);
});

test("original page copy is preserved except explicitly replaced map copy and removed goods summaries", async () => {
  const { createHash } = await import("node:crypto");
  const baseline = JSON.parse(await readFile(new URL("./fixtures/editorial-content-integrity.json", import.meta.url), "utf8"));
  // The user's 建築物文字敘述.docx explicitly supplies a new map opening.
  // Keep the historical fixture intact; only these two superseded nodes are exempt.
  const replacedHistory = new Set(JSON.parse(await readFile(new URL("./fixtures/history-replaced-copy.json", import.meta.url), "utf8")));
  // Home copy explicitly replaced by the user's 2026-09-20 document.
  const replacedHome = new Set([
    "d711c5049a39761f5f71a4a139bc9b9e76bca49456760a348c2b022c58f55c16",
    "7e368e1c35d379f7ff1e214cdc8665acdb746fb2c92005278a8409b8a2ec4650",
    "df53acb6ee734cc1b62b4fca2822081c70d06f65fba7a88bcf928101b2d19485",
    "25916a6e8bf76d96257aa80132b34424b2ba262faf375169e244e4245809f288",
    "e07cc64a76a0e2546631c9a64297eb3d874cf6adc9076e8601560a5b01f47cbb",
    "00581d197d229e577192e217ad8c5c4b29c3c26fb15c5245c09435af83e0a100",
    "5305bf164061b090cc0490a567222fe34be7437a4bbac3ece511468168c74752",
    "f4abf91e41123a25e0e200b4a3197d91fab633035015462f9ef19d4ebedde2fd",
    "eb8c547feac9194ae3fd3ee9d0a7337c466e6c728e821a4fe6425df19044b7a7",
  ]);
  // Previously approved home caption removal, plus current telephone-only contact copy.
  const replacedContact = new Set([
    "GUOGANG GOODS", "想把過港的味道帶回家？", "HOW TO ORDER",
    "過港的產品以小量製作為主。每次做什麼、做多少，會跟著當期的製作安排而不同，所以不一定隨時都有固定的品項與數量。",
    "最新品項、價格與可訂購數量，都會公布在 LINE。看看這次做了什麼，再挑一份喜歡的帶回家。",
    "過港的產品以小量製作為主。※ 每次製作的品項、數量與價格可能不同，請以 LINE 當期公告為準。",
    "過港好味以社區小量製作為主，商品會依實際產量不定期開團。如果想知道最近有哪些商品，可以加入 LINE 社群查看最新開團資訊；也可以從 Facebook 看見更多過港的日常與活動。",
    "想知道最近的社區好味與活動，可以加入 LINE 社群；也歡迎從 Facebook 看見更多過港的日常。",
  ].map(text => createHash("sha256").update(text.replace(/\s/g, "")).digest("hex")));
  const replacedMapOpening = new Set([
    "21191945e15e2cc05fc52373a5d8775e5df03cc2f62c156c2bf4bc32d66f8fb1",
    "22100d0d4b19151508f86eccef945f26a610145163ca0a1ac31b48787cc7677f",
  ]);
  // On 2026-09-13 the user removed these five duplicated catalog summaries.
  // The full stories remain covered by the catalog story preservation test.
  const removedGoodsSummaries = new Set([
    "8e0517396f26c9abaf4fc0af64c64b4fb45f2ec331e6943dd7ab824b1ee08051",
    "c59edc9587355ade59dc111a8eef6bc9a0385e704fe93aec9cbc341a4c07b50b",
    "8db6533a18a3bde7f870a791cb4f04aba65db3a140230408d8872d1758a5e87b",
    "8a6cff173253b21992a8170276bbbb7a0e002f3fca9bc96b6eeb6d8074e4ea16",
    "8ee2612181b07cb45e2628f66b9b74cd1cfc6c310d2d51d9ed845cf467f0eb52",
  ]);
  // 2026-09-20: user requested a shorter hero and one consolidated ordering note.
  const consolidatedGoodsCopy = new Set([
    "有些味道，原本就在過港的日常裡。做著、吃著，慢慢也成了大家熟悉的滋味。",
    "SMALL BATCH / 慢慢做",
    "GUOGANG GOODS",
    "慢慢做，把每一份好味做好。",
    "過港的產品以小量製作為主。每次做什麼、做多少，會跟著當期的製作安排而不同，所以不一定隨時都有固定的品項與數量。有什麼，就把這次做好的分享出去；每一次能訂購的品項，也可能不太一樣。",
    "每一次能訂購的品項、價格與數量，會隨當期製作安排而不同；最新資訊會公布在 LINE。",
  ].map(text => createHash("sha256").update(text.replace(/\s/g, "")).digest("hex")));
  const clean = (text) => text.replace(/<[^>]*>/g, "").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replace(/\s/g, "");
  // These index excerpts are superseded by the user's six Google Docs stories.
  // Exact new paragraphs and line breaks are checked by assertPeopleSourceIntegrity.
  // 2026-09-20: replace only the final People index block with author credits.
  const replacedPeopleEnding = new Set([
    // Explicit 2026-09-20 identity corrections; story text remains independently checked.
    "07701d532a658e3df61d0a3ce66566c47c991caa09d31909ab86e37574ae4eaf",
    "f5ccd27ee243cf0015b6ac156d29f2456bb993c9b6801674882e6c9941b26b4b",
    "db94ad3d8570a447e3fb4055f5413d763711c1b74ace7f479fa58899720e6a27",

    "51ecad67e4e22b234c4bdf9917571d145b1cf9bd83fbc2b76dbf966870555905",
    "0640097a2aeeee09b6368a91275adf01f213c3e655f99d4e12dff990d062f675",
    "6e8eaff845f59dc35315b443ce51119e624a2debb7da5513be6a5d17ba2cbe2e",
    "21e99724082ecdcb0a9e56123f436a1556ff9a5a4d84cdaea023507a05e28e01",
    "551acc38e27f0332b454c010ed1de412930dd0503b0c587dcd683e25675b4ed1",
    "57b66617f3b05f1544796a08ee4f4a00bbb0a9f5e37231d378911ee3ad8b3aa1",
    "1b8918a9221ffb01831cb5ed831deb66a52084cf025bf3a5b008bee15f8a788a",
    "c42a1955161f42cb8d3c3e70cd39f83e08422733c551522e6d523662015d71b6",
    "11120f5f616516468aca22fb6941b97d78b9f28af9564ddcad0aac23cef33309",
    "48f128f7720b1ceae7c32c98b359b47d2bb9533e776fb148865757bf5fb626b2",
    "c4bce28fa6aa9c66e86e89fdc6f10cc9285b5ca53e2d3b22a3afa8acc4370fd1",
  ]);
  const replacedPeopleExcerpts = new Set(JSON.parse(await readFile(new URL("./fixtures/people-replaced-excerpts.json", import.meta.url), "utf8")));
  for (const [route, expected] of Object.entries(baseline)) {
    // The six replacement articles have their own exact-source integrity checks.
    if (peopleSources.some(source => route === `/people/${source.slug}`)) continue;
    const html = await (await render(route)).text();
    const actual = new Set([...html.matchAll(/<(p|h[123]|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((match) => createHash("sha256").update(clean(match[2])).digest("hex")));
    if (route === "/goods") {
      for (const hash of removedGoodsSummaries) assert.ok(!actual.has(hash), "removed catalog summaries stay absent");
      assert.doesNotMatch(html, /<h3[^>]*>從日常開始<\/h3>/);
    }
    for (const record of expected) {
      if (replacedContact.has(record.sha256)) continue;
      // Previously approved about hero wording: 一直 -> 總是.
      if (route === "/about" && record.sha256 === "6de51d8e3000341dd1cdf508bec96858466ed9acdd8e7204e698b76beaaad780") continue;
      if (route === "/" && replacedHome.has(record.sha256)) continue;
      if (route === "/guogang" && (replacedMapOpening.has(record.sha256) || replacedHistory.has(record.sha256))) continue;
      if (route === "/goods" && (removedGoodsSummaries.has(record.sha256) || consolidatedGoodsCopy.has(record.sha256))) continue;
      if (route === "/people" && (replacedPeopleExcerpts.has(record.sha256) || replacedPeopleEnding.has(record.sha256))) continue;
      assert.ok(actual.has(record.sha256), `${route}: original ${record.tag} (${record.characters} characters) must be preserved: ${record.sha256}`);
    }
  }
});

test("homepage preserves four photo chapters and original copy in the book presentation", async () => {
  const html = await (await render("/")).text();
  assert.match(html, /home-narrative/);
  assert.match(html, /aria-roledescription="翻頁書"/);
  assert.equal((html.match(/data-scene="[0-3]"[^>]*aria-hidden="true"[^>]*inert/g) ?? []).length, 3);
  for (const number of ["01", "02", "03", "04"]) {
    assert.match(html, new RegExp(`id="scene-${number}"`));
    assert.match(html, new RegExp(`home-scroll-${number}\\.webp`));
  }
  assert.match(html, /一個沿著基隆河生活的地方。/);
  assert.match(html, /從備料到料理，一雙雙手把熟悉的味道慢慢做出來。/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /scroll-story-sticky|linear-gradient/);
});

test("the editorial system shares typography roles and removes dark photo overlays", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const intro = await readFile(new URL("../app/components/PageIntro.tsx", import.meta.url), "utf8");
  for (const role of ["hero", "page", "section", "card", "name", "article-title", "article-section", "body", "label"]) assert.ok(css.includes(`--type-${role}:`));
  assert.match(css, /--paper:\s*#f5f4f2;/);
  assert.match(css, /h2\s*\{\s*font-size:\s*var\(--type-section\)/);
  assert.match(css, /\.people-article-heading h1\s*\{\s*font-size:\s*var\(--type-article-title\)/);
  assert.match(css, /\.heading-unit\s*\{[^}]*white-space:\s*nowrap/);
  assert.doesNotMatch(intro, /minHeight|position:\s*"absolute"|linear-gradient/);
  assert.doesNotMatch(css, /overflow-x:\s*hidden|text-overflow:\s*ellipsis|--type-history-lead/);
});

test("all six People entries include photographs while preserving the original editorial order", async () => {
  const html = await (await render("/people")).text();
  const cards = [...html.matchAll(/<article class="people-story-card[\s\S]*?<\/article>/g)].map((match) => match[0]);
  const order = ["林秀英", "黃淑惠", "丁梅花", "清爽 × 阿笑", "謝水錦", "順發阿公 × 宜慧阿嬤"];
  assert.equal(cards.length, 6);
  cards.forEach((card, index) => { assert.ok(card.includes(`>${order[index]}<`)); assert.match(card, /<img\b/); assert.match(card, /people-story-summary/); });
});

test("new map configuration is complete, source-specific and independently positioned", async () => {
  const source = await readFile(new URL("../app/data/guogangMap.ts", import.meta.url), "utf8");
  const locations = JSON.parse(source.split("export const GUOGANG_MAP_LOCATIONS: MapLandmark[] = ")[1].trim().replace(/;$/, ""));
  const names = ["小倆口福利社", "美食坊早餐店", "舊警察宿舍", "暖江國小", "聖光堂", "黃蠟石文化館", "過港社區發展協會", "過港幼兒園", "過港郵局", "暖江步道", "暖江兒童公園", "北方大陸餅", "暖新住民會館", "過港福德宮"];
  assert.deepEqual(locations.map((location) => location.name), names);
  assert.equal(new Set(locations.map((location) => location.id)).size, 14);
  assert.ok(locations[3].x < locations[2].x, "the school is to the left of the blue police dormitory, as confirmed by the user");
  const rows = [locations.slice(0, 5), locations.slice(5, 9), locations.slice(9)];
  rows.forEach((row, rowIndex) => {
    assert.ok(row.every((location) => location.row === ["upper", "middle", "lower"][rowIndex]));
    for (let index = 1; index < row.length; index++) {
      assert.ok(row[index - 1].x > row[index].x, `${row[index].name}: names read right to left within each row`);
    }
    if (rowIndex > 0) assert.ok(Math.max(...rows[rowIndex - 1].map((location) => location.y)) < Math.min(...row.map((location) => location.y)), "rows read top to bottom");
  });
  const html = await (await render("/guogang")).text();
  const groups = [...html.matchAll(/<optgroup label="([^"]+)">([\s\S]*?)<\/optgroup>/g)];
  assert.deepEqual(groups.map((group) => group[1]), ["上排（由右至左）", "中排（由右至左）", "下排（由右至左）"]);
  groups.forEach((group, index) => assert.deepEqual([...group[2].matchAll(/<option[^>]*>([^<]+)<\/option>/g)].map((option) => option[1]), rows[index].map((location) => location.name)));
  for (const location of locations) {
    for (const field of ["x", "y", "width", "height", "labelX", "labelY"]) assert.ok(location[field] >= 0 && location[field] <= 100);
    assert.ok(location.x + location.width <= 100.001 && location.y + location.height <= 100.001);
    const png = await readFile(new URL(`../public/images/guogang-map-2026/${location.id}.png`, import.meta.url));
    assert.equal(png[25], 6, `${location.name}: RGBA cutout required`);
  }
});

test("map has real labels, stable hit areas and equivalent pointer, touch and keyboard controls", async () => {
  const source = await readFile(new URL("../app/components/GuogangInteractiveMap.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const contract of ["onPointerEnter", "onPointerLeave", "onFocus", "onClick", "onPointerDown", "onPointerMove", "scrollLeft", "suppressActivationRef", "aria-expanded", "guogang-map-labels", "map-place-picker"]) assert.ok(source.includes(contract), contract);
  assert.match(css, /\.guogang-map-landmark\.is-active img\s*\{[^}]*translateY\(-8px\)/);
  assert.match(css, /\.guogang-handdrawn-map-canvas\s*\{[^}]*aspect-ratio:\s*16 \/ 9/);
  assert.match(css, /\.guogang-map-scroll\s*\{[^}]*overflow-x:\s*auto/);
  assert.doesNotMatch(source, /guogang-map-stamps|guogang-map-landmarks\/|guogang-handdrawn-map\.jpg/);
});

test("every illustrated place has location metadata and details stay hidden before activation", async () => {
  const mapSource = await readFile(new URL("../app/data/guogangMap.ts", import.meta.url), "utf8");
  const locations = JSON.parse(mapSource.split("export const GUOGANG_MAP_LOCATIONS: MapLandmark[] = ")[1].trim().replace(/;$/, ""));
  const details = await readFile(new URL("../app/data/guogangMapDetails.ts", import.meta.url), "utf8");
  assert.deepEqual([...details.matchAll(/^ {2}"([^"]+)": \{/gm)].map(match => match[1]), locations.map(location => location.id));
  const html = await (await render("/guogang")).text();
  assert.match(html, /<aside[^>]*aria-label="地點介紹"[^>]*hidden/);
  assert.doesNotMatch(html, /<iframe\b/);
  assert.equal((html.match(/data-landmark="[^"]+"[^>]*aria-expanded="false"/g) ?? []).length, 14);
});

test("the map introduction and every place preserve the supplied DOCX text", async () => {
  const { createHash } = await import("node:crypto");
  const copy = JSON.parse(await readFile(new URL("../app/data/guogangMapCopy.json", import.meta.url), "utf8"));
  const fixture = JSON.parse(await readFile(new URL("./fixtures/map-copy-integrity.json", import.meta.url), "utf8"));
  const blocks = { "散步地圖｜開頭介紹": [copy.intro.titleLines, ...copy.intro.paragraphs], ...Object.fromEntries(copy.places.map(place => [place.name, place.paragraphs])) };
  assert.deepEqual(Object.keys(blocks), Object.keys(fixture.blocks));
  for (const [name, paragraphs] of Object.entries(blocks)) {
    const text = paragraphs.map(lines => lines.join("")).join("");
    assert.equal(createHash("sha256").update(text).digest("hex"), fixture.blocks[name].sha256, `${name}: original DOCX wording`);
    assert.equal(paragraphs.length, fixture.blocks[name].paragraphCount);
  }
  const html = await (await render("/guogang")).text();
  const plain = html.replace(/<[^>]*>/g, "");
  for (const lines of blocks["散步地圖｜開頭介紹"]) assert.ok(plain.includes(lines.join("")), "Supplied opening must render intact; activated place copy is checked in browser QA");
});


test("goods reads from introduction through products and making to collection and ordering", async () => {
  const html = await (await render("/goods")).text();
  const sections = ["goods-story-intro", "goods-catalog\"", "goods-makers", "goods-collection", "goods-order\"", "goods-ending"];
  const positions = sections.map(section => html.indexOf(`class="${section}`));
  assert.ok(positions.every(position => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.equal((html.match(/class="heading-line">過港的好味，/g) ?? []).length, 1);
  assert.doesNotMatch(html, /goods-catalog-intro|goods-small-batch/);
  const ordering = html.slice(positions[4], positions[5]);
  assert.match(ordering, /如欲訂購或了解更多，歡迎來電洽詢過港社區發展協會。/);
  assert.match(ordering, /02-2458-8802/);
  assert.ok(html.indexOf("updated-20260919/collection.webp") > positions[3]);
});

test("history timeline uses the six supplied final texts and deliberate text-only chapters", async () => {
  const expected = JSON.parse(await readFile(new URL("./fixtures/history-final-copy.json", import.meta.url), "utf8"));
  const html = await (await render("/guogang")).text();
  const timeline = html.match(/<ol class="history-timeline"[^>]*>([\s\S]*?)<\/ol>/)?.[1];
  assert.ok(timeline);
  const nodes = [...timeline.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)];
  assert.equal(nodes.length, 6);
  const clean = text => text.replace(/<[^>]*>/g, "").replace(/\s/g, "");
  for (const [index, entry] of expected.entries()) {
    const node = nodes[index][1];
    assert.ok(clean(node).includes(entry.titleLines.join("")));
    for (const paragraph of entry.description.split("\n\n")) assert.ok(clean(node).includes(clean(paragraph)));
    if (index === 3) assert.doesNotMatch(node, /<img|<figure|placeholder/);
  }
  assert.match(nodes[2][0], /history-node-archive/);
  assert.equal((nodes[2][1].match(/<img\b/g) ?? []).length, 4);
  assert.equal((timeline.match(/圖片來源｜國家電影及視聽文化中心/g) ?? []).length, 1);
  assert.match(nodes[3][0], /history-node-center/);
  assert.doesNotMatch(nodes[5][1], /故事留在時間裡/);
  assert.match(html, /class="history-transition"/);
  assert.match(nodes[5][0], /history-node-closing/);
  assert.match(nodes[0][1], /過港早期渡河情景的圖像紀錄/);
});

test("home people CTA avoids misidentification and community photos appear together", async () => {
  const html = await (await render("/")).text();
  const people = html.match(/<article class="home-guide home-guide-people">([\s\S]*?)<\/article>/)?.[1];
  assert.ok(people);
  assert.doesNotMatch(people, /林秀英|bottle-cap-grandma|閱讀她的故事|生活於這裡的人身上/);
  assert.match(people, /href="\/people"[^>]*>認識更多過港的人/);
  assert.match(people.replace(/<[^>]*>/g, ""), /藏在不同人的日常裡。/);
  const about = html.match(/<article class="home-guide home-guide-about">([\s\S]*?)<\/article>/)?.[1];
  assert.ok(about);
  assert.equal((about.match(/<img\b/g) ?? []).length, 3);
  assert.doesNotMatch(about, /product-gallery|上一張|下一張/);
  assert.match(html, /revision-20260920\/place\.webp/);
});


test("People overview and articles share the approved names and roles", async () => {
  const overview = await (await render("/people")).text();
  const identities = [
    ["bottle-cap-grandma", "林秀英", "瓶蓋牆製作者"],
    ["breakfast-shop-owner", "黃淑惠", "早餐店老闆娘"],
    ["couple-story-two", "丁梅花", "過港社區訪視組組長"],
    ["couple-story-one", "清爽 × 阿笑", "過港的鬥嘴夫妻"],
    ["community-kitchen-mother", "謝水錦", "過港社區煮飯阿姨"],
    ["community-volunteer", "順發阿公 × 宜慧阿嬤", "一起來過港上課的老夫妻"],
  ];
  for (const [slug, name, role] of identities) {
    const html = await (await render(`/people/${slug}`)).text();
    assert.ok(overview.includes(`<p class="people-story-name">${name}</p>`));
    assert.ok(overview.includes(`<p class="people-story-role">${role}</p>`));
    assert.ok(html.includes(`<strong>${name}</strong><span>${role}</span>`));
    assert.doesNotMatch(html, /李水錦|過港社區課程學員|過港社區志工夫妻/);
  }
});
