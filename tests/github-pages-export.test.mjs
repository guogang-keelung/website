import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import test from "node:test";
import { peopleSources, assertPeopleSourceIntegrity } from "./people-source-integrity.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputRoot = path.join(projectRoot, "github-pages-dist");
const basePath = normalizeBasePath(process.env.PAGES_BASE_PATH ?? inferBasePath());

test("font URLs depend on font bytes rather than the application release", async () => {
  const releases = path.join(outputRoot, "_next", "releases");
  let checked = 0;
  for (const release of await readdir(releases)) {
    const assets = path.join(releases, release);
    for (const file of await readdir(assets, { recursive: true })) {
      if (!file.endsWith(".css")) continue;
      const css = await readFile(path.join(assets, file), "utf8");
      assert.doesNotMatch(css, /\/_next\/releases\/[^/]+\/fonts\//);
      for (const match of css.matchAll(/\/fonts\/noto-serif-tc\/(\d{3}(?:-site|-home)?)-([a-f0-9]{12})\.woff2/g)) {
        const font = await readFile(path.join(outputRoot, "fonts", "noto-serif-tc", `${match[1]}-${match[2]}.woff2`));
        assert.equal(createHash("sha256").update(font).digest("hex").slice(0, 12), match[2]);
        checked++;
      }
    }
  }
  assert.ok(checked >= 108, "the entire segmented font family must use stable URLs");
});

test("hydration entry uses a consistent hashed URL and high priority", async () => {
  for (const file of ["index.html", "guogang/index.html"]) {
    const html = await read(file);
    assert.doesNotMatch(html, /\/_next\/static\//, "all framework resources share the release namespace");
    const entries = [...html.matchAll(/<(?:link|script)\b[^>]*(?:href|src)="([^"]*\/chunks\/index-[^"]+\.js[^\"]*)"[^>]*>/g)];
    assert.ok(entries.length >= 2, "entry preload and execution must both exist");
    assert.equal(new Set(entries.map((entry) => entry[1])).size, 1);
    for (const entry of entries) {
      assert.match(entry[1], /index-[A-Za-z0-9_-]+\.js$/);
      assert.match(entry[1], /\/_next\/releases\/[a-f0-9]{12}\/chunks\//);
      assert.match(entry[0], /fetchpriority="high"/i);
    }
  }
});

const requiredFiles = [
  "index.html",
  "goods/index.html",
  "goods/goods-01/index.html",
  "goods/goods-05/index.html",
  "guogang/index.html",
  "people/index.html",
  "people/bottle-cap-grandma/index.html",
  "people/breakfast-shop-owner/index.html",
  "people/community-kitchen-mother/index.html",
  "people/couple-story-one/index.html",
  "people/couple-story-two/index.html",
  "about/index.html",
  "fonts/guogang-serif-mobile.woff2",
  "fonts/OFL-NotoSerifTC.txt",
  "_next/static/fonts/guogang-serif-mobile.woff2",
  "images/guogang-history-1949.png",
  "images/guogang-header-logo.png",
  "images/guogang-map-2026/background.webp",
  "images/guogang-map-2026/little-couple-store.png",
  "images/guogang-map-2026/breakfast-shop.png",
  "images/guogang-map-2026/old-police-dormitory.png",
  "images/guogang-map-2026/nuanjiang-elementary-school.png",
  "images/guogang-map-2026/shengguang-church.png",
  "images/guogang-map-2026/wax-culture-hall.png",
  "images/guogang-map-2026/community-association.png",
  "images/guogang-map-2026/guogang-kindergarten.png",
  "images/guogang-map-2026/guogang-post-office.png",
  "images/guogang-map-2026/nuanjiang-walkway.png",
  "images/guogang-map-2026/children-park.png",
  "images/guogang-map-2026/northern-pastry.png",
  "images/guogang-map-2026/nuan-new-immigrant-hall.png",
  "images/guogang-map-2026/guogang-fude-temple.png",
  "images/home/home-scroll-01.webp",
  "images/home/home-scroll-01-1280.webp",
  "images/home/home-scroll-02.webp",
  "images/home/home-scroll-02-1280.webp",
  "images/home/home-scroll-03.webp",
  "images/home/home-scroll-03-1280.webp",
  "images/home/home-scroll-04.webp",
  "images/home/home-scroll-04-1280.webp",
  "images/認識過港.jpg",
  "images/過港人物.jpg",
  "images/過港好味.jpg",
  "images/關於我們.jpg",
  "images/goods/double-bamboo-shoot-dumplings.jpg",
  "images/goods/radish-cake.jpg",
  "images/goods/iron-eggs.jpg",
  "images/goods/white-fungus-drink.jpg",
  "images/goods/stone-flower-jelly.jpg",
  "images/goods/updated-20260919/collection.webp",
  "images/people/community-kitchen-mother/li-shui-jin-kitchen.jpg",
  "images/people/community-kitchen-mother/li-shui-jin-community.jpg",
  "images/people/community-kitchen-mother/li-shui-jin-learning.jpg",
  "images/people/couple-story-one/qingshuang-axiao-portrait.jpg",
  "images/people/couple-story-one/qingshuang-axiao-community.jpg",
  "images/people-drive/lin/lin-dscf5586.webp",
  "images/people-drive/breakfast/breakfast-dscf5920.webp",
  "images/people-drive/li/li-48.webp",
  "images/people-drive/qing/qing-dscf5762.webp",
  "images/people-drive/meihua/meihua-29.webp",
  "og-revision.png",
  ".nojekyll",
  "404.html",
  "sitemap.xml",
  "robots.txt",
];

test("GitHub Pages output contains every public route and required image", async () => {
  for (const relativePath of requiredFiles) await access(path.join(outputRoot, relativePath));
});

test("exported pages preserve revision content and interactions", async () => {
  const home = await read("index.html");
  const goods = await read("goods/index.html");
  const guogang = await read("guogang/index.html");
  const people = await read("people/index.html");
  const about = await read("about/index.html");

  assert.match(home, /這裡是過港/);
  assert.match(home, /home-scroll-01\.webp/);
  assert.match(home, /home-scroll-01-1280\.webp/);
  assert.match(home, /如果喜歡過港/);
  assert.doesNotMatch(home, /scroll-story-cue|⌄/);
  assert.match(home, /首頁敘事章節/);
  assert.doesNotMatch(home, /往下看看/);
  assert.match(home, /02-2458-8802/);
  assert.match(goods, /updated-20260919\/collection\.webp/);
  for (let index = 1; index <= 5; index++) {
    const id = String(index).padStart(2, "0");
    assert.match(goods, new RegExp(`processed-20260920/${id}-cutout${id === "04" ? "-rim" : ""}\\.webp`));
    assert.match(goods, new RegExp(`updated-20260919/${id}-photo\\.webp`));
  }
  assert.match(goods, /hero-updated\.webp/);
  assert.match(guogang, /認識過港\.webp/);
  assert.match(guogang, /可探索的過港手繪生活地圖/);
  assert.match(guogang, /guogang-map-2026\/background\.webp/);
  assert.match(guogang, /guogang-map-2026\/shengguang-church\.webp/);
  assert.match(guogang, /guogang-map-2026\/nuanjiang-walkway\.webp/);
  assert.match(guogang, /小倆口福利社/);
  assert.match(guogang, /過港社區發展協會/);
  for (const locationName of ["小倆口福利社", "美食坊早餐店", "舊警察宿舍", "暖江國小", "聖光堂", "黃蠟石文化館", "過港社區發展協會", "過港幼兒園", "過港郵局", "暖江步道", "暖江兒童公園", "北方大陸餅", "暖新住民會館", "過港福德宮"]) {
    assert.match(guogang, new RegExp(locationName));
  }
  assert.doesNotMatch(guogang, /地點名單待確認/);
  assert.match(people, /people-updated-20260920\/index-hero\.webp/);
  assert.match(people, /PEOPLE OF GUOGANG \/ 人與過港/);
  assert.match(people, /過港的樣子，[\s\S]*?藏在不同人的日常裡。/);

  const peopleCards = [...people.matchAll(/<article class="people-story-card[\s\S]*?<\/article>/g)].map((match) => match[0]);
  const peopleOrder = ["林秀英", "黃淑惠", "丁梅花", "清爽 × 阿笑", "謝水錦", "順發阿公 × 宜慧阿嬤"];
  assert.equal(peopleCards.length, peopleOrder.length, "exported People page should contain six editorial entries");
  assert.deepEqual(
    peopleCards.map((card) => peopleOrder.find((name) => card.includes(`>${name}<`))),
    peopleOrder,
    "exported People page should preserve the editorial reading order",
  );

  for (const [name, href] of [
    ["林秀英", "/people/bottle-cap-grandma"],
    ["黃淑惠", "/people/breakfast-shop-owner"],
    ["丁梅花", "/people/couple-story-two"],
    ["清爽 × 阿笑", "/people/couple-story-one"],
    ["謝水錦", "/people/community-kitchen-mother"],
    ["順發阿公 × 宜慧阿嬤", "/people/community-volunteer"],
  ]) {
    assert.match(people, new RegExp(`${name}[\\s\\S]*?href="[^"]*${href}`));
  }

  assert.match(people, /把時間，[\s\S]*?一個瓶蓋[\s\S]*?一個瓶蓋[\s\S]*?留在過港。/);
  assert.match(people, /二十五年，[\s\S]*?早晨裡的人[\s\S]*?慢慢熟了。/);
  assert.match(people, /四十多年，[\s\S]*?他們一起[\s\S]*?把日子[\s\S]*?過到了過港。/);
  assert.match(people, /這條半小時的路，[\s\S]*?她走了十年。/);
  assert.match(people, /ABOUT THE STORIES[\s\S]*?六篇人物故事，[\s\S]*?來自十八天的[\s\S]*?訪談與相處。/);
  assert.match(people, /採訪、文字與製作｜林品均、李佩璇/);
  assert.match(people, /參與計畫｜蹲點・台灣/);
  assert.doesNotMatch(people, /STORY 01|STORY 02|STORY 03|STORY 04/);
  assert.doesNotMatch(people, /page-intro-index[^>]*>\d{2}/);

  const breakfastCard = peopleCards.find((card) => card.includes(">早餐店老闆娘<"));
  assert.ok(breakfastCard, "exported Huang Shu-hui entry should exist");
  assert.match(breakfastCard, /href="[^"]*\/people\/breakfast-shop-owner/);
  assert.match(breakfastCard, /people-story-editorial-cover/);
  assert.match(breakfastCard, /breakfast-hero\.webp/);

  const bottleCapStory = await read("people/bottle-cap-grandma/index.html");
  const breakfastStory = await read("people/breakfast-shop-owner/index.html");
  const kitchenStory = await read("people/community-kitchen-mother/index.html");
  const coupleStory = await read("people/couple-story-one/index.html");
  const meiHuaStory = await read("people/couple-story-two/index.html");
  const bottleCapArticle = bottleCapStory.match(/<main class="article-page people-article-page">[\s\S]*?<\/main>/)?.[0];
  assert.ok(bottleCapArticle, "exported Lin Xiu-ying page should contain the shared editorial article");
  assert.match(bottleCapStory, /把時間/);
  assert.match(bottleCapStory, /時間留下來的形狀/);
  assert.doesNotMatch(bottleCapArticle, /來源未提供|IMAGE|待提供/);
  assert.match(breakfastStory, /早晨裡的人慢慢熟了。/);
  assert.match(kitchenStory, /people-updated-20260920\/kitchen-hero\.webp/);
  assert.match(coupleStory, /people-updated-20260920\/qing-hero\.webp/);
  assert.match(meiHuaStory, /丁梅花/);
  assert.match(meiHuaStory, /去看看，最近好不好。/);
  for (const source of peopleSources) {
    assertPeopleSourceIntegrity(await read(`people/${source.slug}/index.html`), source);
  }
  assert.match(about, /about-updated-20260920\/hero\.webp/);
  assert.doesNotMatch(`${home}${about}`, /association-structure\.png|組織架構圖|會員大會/);
});

test("repository subpath is applied to every root-relative link and asset", async () => {
  if (!basePath) return;
  for (const relativePath of ["index.html", "goods/index.html", "guogang/index.html", "people/index.html", "about/index.html"]) {
    const html = await read(relativePath);
    const references = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((match) => match[1]);
    assert.ok(references.length > 0, `${relativePath} should contain local links or assets`);
    for (const reference of references) {
      assert.ok(reference.startsWith(`${basePath}/`) || reference === basePath, `${relativePath}: ${reference}`);
    }
  }
});

test("every exported local asset reference resolves inside the Pages artifact", async () => {
  const pages = ["index.html", "goods/index.html", "guogang/index.html", "people/index.html", "about/index.html"];
  const assetPaths = new Set();

  for (const relativePath of pages) {
    const html = await read(relativePath);
    const references = [...html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)].map((match) => match[1]);

    for (const reference of references) {
      const assetPath = toArtifactAssetPath(reference);
      if (assetPath) assetPaths.add(assetPath);
    }
  }

  assert.ok(assetPaths.size > 0, "exported pages should reference local assets");

  for (const assetPath of [...assetPaths].filter((value) => value.endsWith(".css"))) {
    const css = await read(assetPath);
    const references = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1].replace(/["']/g, ""));
    for (const reference of references) {
      if (/^(?:data:|https?:)/i.test(reference)) continue;
      const referencedAsset = toArtifactAssetPath(reference);
      if (referencedAsset) assetPaths.add(referencedAsset);
    }
  }

  for (const assetPath of assetPaths) await access(path.join(outputRoot, assetPath));
});

async function read(relativePath) {
  return readFile(path.join(outputRoot, relativePath), "utf8");
}

function inferBasePath() {
  const [owner = "", repository = ""] = (process.env.GITHUB_REPOSITORY ?? "").split("/");
  if (!repository || repository.toLowerCase() === `${owner.toLowerCase()}.github.io`) return "";
  return `/${repository}`;
}

function normalizeBasePath(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

function toArtifactAssetPath(reference) {
  const pathname = new URL(reference, "https://example.invalid").pathname;
  const relativePath = basePath && pathname.startsWith(`${basePath}/`)
    ? pathname.slice(basePath.length + 1)
    : pathname.replace(/^\/+/, "");

  if (
    relativePath.startsWith("_next/") ||
    relativePath.startsWith("images/") ||
    /\.(?:avif|css|gif|ico|jpe?g|js|png|svg|webp|woff2?)$/i.test(relativePath)
  ) {
    return decodeURIComponent(relativePath);
  }

  return null;
}


test("homepage serif subsets stay within a 200 KB cold-load budget", async () => {
  const fonts = path.join(outputRoot, "fonts", "noto-serif-tc");
  const names = (await readdir(fonts)).filter(name => /^\d{3}-home\.woff2$/.test(name));
  assert.ok(names.length > 0);
  const sizes = await Promise.all(names.map(async name => (await readFile(path.join(fonts, name))).length));
  assert.ok(sizes.reduce((a, b) => a + b, 0) < 200_000, "preserve the optimized homepage font budget");
});

test("each page loads one complete content-addressed font and reserves image space", async () => {
  const manifest = JSON.parse(await readFile(path.join(projectRoot, "scripts/page-fonts.json"), "utf8"));
  for (const [route, font] of Object.entries(manifest)) {
    const html = await read(route === "/" ? "index.html" : `${route.slice(1)}/index.html`);
    const name = font.file.replace(".woff2", `-${font.sha256.slice(0, 12)}.woff2`);
    assert.ok(html.includes(`${basePath}/fonts/pages/${name}`));
    assert.match(html, /id="page-font"/);
    const bytes = await readFile(path.join(outputRoot, "fonts/pages", name));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), font.sha256);
    const visible = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, "").replace(/<[^>]*>/g, "");
    const missing = [...new Set(visible.match(/[\u3000-\u303f\u3400-\u9fff]/gu) ?? [])].filter(c => !font.codepoints.includes(c.codePointAt(0)));
    assert.deepEqual(missing, [], `${route}: regenerate page fonts after adding characters`);
    for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
      if (!/src="[^"]*\/images\//.test(tag)) continue;
      assert.match(tag, /\bwidth="\d+"/, `${route}: image needs reserved width`);
      assert.match(tag, /\bheight="\d+"/, `${route}: image needs reserved height`);
    }
  }
});

// All exported routes, including unlinked product pages, must use phone contact only.
test("exported HTML contains no online ordering or messaging contact remnants", async () => {
  const { readdir } = await import("node:fs/promises");
  const root = new URL("../github-pages-dist/", import.meta.url);
  const entries = await readdir(root, { recursive: true });
  for (const file of entries.filter(file => file.endsWith(".html"))) {
    const html = await readFile(new URL(file.replaceAll("\\", "/"), root), "utf8");
    assert.doesNotMatch(html, /\bLINE\b|賣貨便|線上訂購|線上下單|立即訂購|立即購買|下單|購買|line\.me|lin\.ee|myship\.7-11|shopee/, file);
    if (file.endsWith("index.html") && !/http-equiv="refresh"/i.test(html)) {
      assert.match(html, /href="tel:0224588802"/, file);
      const buttons = html.match(/class="button button-phone"/g) ?? [];
      assert.equal(buttons.length, /^(goods|about)[\\/]index\.html$/.test(file) ? 1 : 0, `${file}: keep inquiry buttons only in dedicated contact sections`);
    }
  }
});


test("public pages identify their canonical URL and serve the community icon", async () => {
  const xml = await read("sitemap.xml");
  for (const [, url] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const relative = new URL(url).pathname.slice(basePath.length).replace(/^\//, "");
    const html = await read(`${relative}index.html`);
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`));
    assert.ok(html.includes(`${basePath}/favicon.svg`));
  }
  assert.match(await read("favicon.svg"), /data:image\/png;base64,/);
});
