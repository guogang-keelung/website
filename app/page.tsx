import type { Metadata } from "next";
import { HomeScrollStory } from "./components/HomeScrollStory";
import { HeadingLines } from "./components/HeadingLines";
import { ImagePlaceholder } from "./components/ImagePlaceholder";
import { PhoneContact } from "./components/PhoneAction";
import { SITE_CONFIG } from "./data/site";
import { sitePath } from "./utils/sitePath";

export const metadata: Metadata = {
  title: { absolute: "過港｜地方、人物與生活的故事" },
  description: "從河岸的名字、過港好味與居民日常，慢慢認識過港。",
};

export default function Home() {
  return (
    <main>
      <HomeScrollStory />

      <section className="home-guides" id="home-guides" aria-label="認識過港的地方、好味與人物">
        <article className="home-guide home-guide-place">
          <div className="home-guide-number">01</div>
          <ImagePlaceholder
            label="/images/home/revision-20260920/place.webp"
            alt="過港街角以瓶蓋拼成的鳥與樹木牆面"
            ratio="wide"
            tone="paper"
          />
          <div className="home-guide-copy">
            <p className="eyebrow">01 / 認識過港</p>
            <h2><HeadingLines lines={["過港的故事，", "也留在今天的街角裡。"]} /></h2>
            <p>一面用瓶蓋拼起來的牆、一條每天走過的路，都是現在看得見的過港。</p>
            <p>再往前走，從河岸、宿舍到後來的社區生活，不同時期留下來的人與事，也一點一點成了今天的模樣。</p>
            <a className="text-link" href={sitePath("/guogang")}>認識過港 <span aria-hidden="true">→</span></a>
          </div>
        </article>

        <article className="home-guide home-guide-goods">
          <div className="home-guide-number">02</div>
          <div className="home-feature-single home-goods-feature">
            <ImagePlaceholder label="/images/home/updated-20260920/goods.webp" alt="過港好味餐點合照" ratio="landscape" tone="clay" />
          </div>
          <div className="home-guide-copy">
            <p className="eyebrow">02 / 過港好味</p>
            <h2><HeadingLines lines={["把熟悉的日常，", "做成可以分享的味道。"]} /></h2>
            <p>蘿蔔糕、水餃、鐵蛋、銀耳露和石花凍，一樣一樣從社區裡做出來。</p>
            <p>從備料、製作到裝好分享，原本熟悉的日常味道，也慢慢成了可以帶回家的過港好味。</p>
            <a className="text-link" href={sitePath("/goods")}>看更多過港好味 <span aria-hidden="true">→</span></a>
          </div>
        </article>

        <article className="home-guide home-guide-people">
          <div className="home-guide-number">03</div>
          <div className="home-feature-single home-people-feature">
            <ImagePlaceholder label="/images/home/updated-20260920/people.webp" alt="居民一起準備社區料理" ratio="landscape" tone="green" />
          </div>
          <div className="home-guide-copy">
            <p className="eyebrow">03 / 人與過港</p>
            <h2><HeadingLines lines={["過港的樣子，", "藏在不同人的日常裡。"]} /></h2>
            <p>有人在這裡住了大半輩子，有人每天來這裡工作，也有人因為家人、志工，或生活裡的一些緣分，慢慢和過港有了關係。</p>
            <p>從他們的日常裡，也能看見這個地方不同的樣子。</p>
            <a className="text-link" href={sitePath("/people")}>認識更多過港的人 <span aria-hidden="true">→</span></a>
          </div>
        </article>

        <article className="home-guide home-guide-about">
          <div className="home-guide-number">04</div>
          <div className="home-community-collage" role="group" aria-label="居民一起關懷長者、整理環境的三張照片">
            <img src={sitePath("/images/home/revision-20260920/community-care.webp")} width="1400" height="933" alt="居民在社區空間陪伴長者、協助量血壓" loading="lazy" decoding="async" />
            <img src={sitePath("/images/home/revision-20260920/community-outdoors.webp")} width="800" height="600" alt="居民一起整理竹林環境" loading="lazy" decoding="async" />
            <img src={sitePath("/images/home/revision-20260920/community-cleanup.webp")} width="800" height="450" alt="志工一起清掃社區街道" loading="lazy" decoding="async" />
          </div>
          <div className="home-guide-copy">
            <p className="eyebrow">04 / 關於我們</p>
            <h2><HeadingLines lines={["社區的事情，", "就是一件一件一起做。"]} /></h2>
            <p>過港社區發展協會長期陪伴居民，從長者關懷、兒少陪伴，到環境整理與社區活動，把生活裡真正需要的事情，一件一件做起來。</p>
            <p>也讓更多人有機會一起參與，一起把生活的地方照顧好。</p>
            <div className="button-row">
              <a className="button button-primary" href={sitePath("/about")}>認識過港社區發展協會</a>

            </div>
          </div>
        </article>

        <section className="home-more" aria-labelledby="home-more-title">
          <div className="home-more-copy">
            <p className="eyebrow">MORE GUOGANG / 更多過港</p>
            <h2 id="home-more-title"><HeadingLines lines={["如果喜歡過港，", "也歡迎把這份味道帶回家。"]} /></h2>
            <PhoneContact />
            <div className="button-row">

              <a className="button button-outline" href={SITE_CONFIG.facebookUrl} target="_blank" rel="noreferrer">前往 Facebook</a>
              <a className="button button-outline" href={sitePath("/guogang#guogang-map")}>查看交通資訊</a>
            </div>
          </div>
          <div className="home-more-side">
            <address>
              <strong>{SITE_CONFIG.associationName}</strong>
              <span>{SITE_CONFIG.address}</span>
              <a href={`tel:${SITE_CONFIG.phone.replace(/-/g, "")}`}>{SITE_CONFIG.phone}</a>
            </address>
          </div>
        </section>
      </section>
    </main>
  );
}
