import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ImagePlaceholder } from "../components/ImagePlaceholder";
import { PhoneAction, PhoneContact } from "../components/PhoneAction";
import { PageIntro } from "../components/PageIntro";
import { ProductGallery } from "../components/ProductGallery";
import { GOODS } from "../data/site";
import { sitePath } from "../utils/sitePath";

export const metadata: Metadata = {
  title: "過港好味",
  description: "從過港的餐桌、廚房與一雙雙熟悉的手，認識可以分享的地方味道。",
};

export default function GoodsPage() {
  return (
    <main className="inner-page goods-page">
      <PageIntro index="03" title="過港好味" description="一起分享，過港的好味。" vertical="TASTE OF GUOGANG" />

      <section id="page-story" className="goods-story-intro">
        <div>
          <p className="eyebrow">FROM EVERYDAY LIFE</p>
          <h2><span className="heading-line">過港的好味，</span><span className="heading-line">從日常開始。</span></h2>
        </div>
        <div>
          <p>這些味道，原本就在過港的日常裡。有人備料、有人下鍋，從一次次共餐、活動和製作裡，慢慢成了現在會一起做、一起分享的東西。</p>
          <p>沒有太多花樣，就是把熟悉的味道好好做好。</p>
        </div>
      </section>

      <section className="goods-catalog" style={{ "--goods-paper": `url("${sitePath("/images/textures/goods-paper.png")}")` } as CSSProperties}>
        {GOODS.map((good, index) => (
          <article className="catalog-item" id={good.slug} aria-labelledby={`${good.slug}-title`} key={good.id}>
            <ProductGallery images={[`/images/goods/processed-20260920/${String(index + 1).padStart(2, "0")}-cutout${index === 3 ? "-rim" : ""}.webp`, ...good.galleryImages]} name={good.name} ratio="landscape" tone={index % 2 ? "ochre" : "clay"} />
            <div className="catalog-copy">
              <p className="eyebrow">GUOGANG GOODS / {String(index + 1).padStart(2, "0")}</p>
              <h2 id={`${good.slug}-title`}>{good.name.split("｜").map((line, index) => <span className="heading-line" key={line}>{index > 0 && <span className="sr-only">｜</span>}{line}</span>)}</h2>
              <div className="catalog-story">
                <p>{good.story}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="goods-makers">
        <div>
          <p className="eyebrow">THE HANDS BEHIND THE TASTE</p>
          <h2><span className="heading-line">味道的背後，</span><span className="heading-line">是一雙雙熟悉的手。</span></h2>
          <p>這些產品，就在過港一次次的製作裡慢慢完成。做久了，也成了大家熟悉的味道。</p>
        </div>
        <ImagePlaceholder label="/images/goods/processed-20260920/makers.webp" alt="社區製作水餃時，雙手包餡的近景" ratio="landscape" tone="paper" />
      </section>

      <section className="goods-collection" aria-label="過港好味五款商品合照">
        <ImagePlaceholder label="/images/goods/updated-20260919/collection.webp" alt="過港好味五款商品合照" ratio="wide" tone="green" />
      </section>

      <section className="goods-order" aria-labelledby="goods-order-title">
        <header>
          <p className="eyebrow">CONTACT US</p>
          <h2 id="goods-order-title">電話洽詢</h2>
        </header>
        <div className="goods-order-details">
          <PhoneContact />
          <PhoneAction />
        </div>
      </section>

      <section className="goods-ending">
        <h2><span className="heading-line">一份味道，</span><span className="heading-line">也可以是</span><span className="heading-line">認識地方的開始。</span></h2>
        <p>如果想知道這些好味從什麼樣的地方而來，也歡迎再走進過港，認識生活在這裡的人與故事。</p>
        <div className="button-row">
          <a className="button button-primary" href={sitePath("/guogang")}>認識過港</a>
          <a className="button button-outline" href={sitePath("/people")}>人與過港</a>
        </div>
      </section>
    </main>
  );
}
