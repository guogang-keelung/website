import type { Metadata } from "next";
import { ImagePlaceholder } from "../components/ImagePlaceholder";
import { PhoneAction, PhoneContact } from "../components/PhoneAction";
import { PageIntro } from "../components/PageIntro";
import { SITE_CONFIG } from "../data/site";
import { sitePath } from "../utils/sitePath";

export const metadata: Metadata = {
  title: "關於我們",
  description: "從居民的生活出發，認識過港社區發展協會一路累積的地方行動。",
};

const WORK_AREAS = [
  { number: "01", title: "陪伴長者", description: "從關懷據點、樂齡學習，到巷弄長照、餐食與關懷訪視，讓長輩在熟悉的社區裡，有人陪伴，也能繼續參與生活。", image: "/images/about-updated-20260920/elders.webp", alt: "長輩參與社區活動" },
  { number: "02", title: "陪孩子成長", description: "透過課後陪伴、安心學園、親子活動與不同的學習體驗，陪孩子在社區裡安心長大，也慢慢認識自己生活的地方。", image: "/images/about-updated-20260920/children.webp", alt: "居民與孩子一起參與社區活動" },
  { number: "03", title: "守護生活的環境", description: "從河川巡守、環境教育，到地方環境與壺穴等自然資源的關心，居民用自己的方式，一起照顧每天生活的地方。", image: "/images/about-updated-20260920/environment.webp", alt: "社區居民帶著清掃工具合影" },
  { number: "04", title: "一起讓社區變得更好", description: "累積多年社區工作的經驗後，過港也開始和暖暖地區其他社區交流、合作，讓原本從過港開始的力量，慢慢連結到更多地方。", image: "/images/about-updated-20260920/community.webp", alt: "不同世代居民一起參與活動" },
];

const JOURNEY = [
  ["1993", "過港社區發展協會成立"],
  ["地方行動", "開始投入地方環境、社區營造與居民服務"],
  ["服務發展", "陸續發展長者、兒少、樂齡與環境相關服務"],
  ["經驗分享", "成為福利社區化旗艦計畫的領航社區"],
  ["跨區合作", "與暖暖地區其他社區交流合作"],
  ["今天", "持續從居民的需要出發，尋找過港下一步能一起完成的事情"],
];

export default function AboutPage() {
  return (
    <main className="inner-page about-page">
      <PageIntro index="04" title="關於我們" description="過港社區發展協會成立於民國 82 年，做的事情總是從一個很簡單的問題開始：這個地方，現在需要什麼？" vertical="ABOUT US / GUOGANG" />

      <section id="page-story" className="about-who">
        <ImagePlaceholder label="/images/about-updated-20260920/who.webp" alt="居民一起參與社區活動" ratio="landscape" tone="paper" />
        <div>
          <p className="eyebrow">WHO WE ARE</p>
          <h2><span className="heading-line">從一起生活，</span><span className="heading-line">到一起做社區。</span></h2>
          <p>過港社區發展協會成立後，居民開始用更有組織的方式，一起面對社區裡不同的需要。從環境、居民照顧，到活動、課程與地方營造，許多事情不是由一個人完成，而是靠著居民、志工與不同夥伴，一點一點累積起來。</p>
          <p>對過港來說，社區不只是一個居住的範圍，也是大家可以一起參與、一起改變生活的地方。</p>
        </div>
      </section>

      <section className="about-work" aria-labelledby="about-work-title">
        <header>
          <p className="eyebrow">WHAT WE DO</p>
          <h2 id="about-work-title"><span className="heading-line">從生活裡看見需要，</span><span className="heading-line">再一起想辦法。</span></h2>
        </header>
        <div className="about-work-grid">
          {WORK_AREAS.map((area, index) => (
            <article key={area.number}>
              <ImagePlaceholder label={area.image} alt={area.alt} ratio="landscape" tone={index % 2 ? "clay" : "green"} />
              <span>{area.number}</span>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-people-power">
        <div>
          <p className="eyebrow light">PEOPLE MAKE A COMMUNITY</p>
          <h2><span className="heading-line">很多事情，</span><span className="heading-line heading-keep">都是從「有人願意」開始。</span></h2>
        </div>
        <p>社區裡的活動、課程與服務，背後都有許多居民與志工一起投入。有人準備餐食，有人陪伴長輩，有人照顧孩子，有人整理環境，也有人負責把大家重新聚在一起。每一件事情看起來或許不大，但長時間累積下來，就成為過港持續往前的力量。</p>
      </section>

      <section id="history" className="about-journey" aria-labelledby="about-journey-title">
        <header>
          <p className="eyebrow">OUR JOURNEY</p>
          <h2 id="about-journey-title"><span className="heading-line">從過港開始，</span><span className="heading-line heading-keep">把經驗慢慢分享出去。</span></h2>
        </header>
        <ol>
          {JOURNEY.map(([year, text]) => <li key={year}><span>{year}</span><strong>{text}</strong></li>)}
        </ol>
      </section>

      <section className="about-future">
        <div>
          <p className="eyebrow">WHAT COMES NEXT</p>
          <h2><span className="heading-line">讓過港被看見，</span><span className="heading-line">也讓地方的生活</span><span className="heading-line">繼續走下去。</span></h2>
          <p>現在的過港，除了持續陪伴居民與推動社區服務，也開始把地方的故事、人物與好味整理下來。希望讓原本發生在社區裡的事情，能被更多人認識；也讓過港的產品與生活故事，有機會走到更遠的地方。</p>
        </div>
        <ImagePlaceholder label="/images/about-updated-20260920/future.webp" alt="過港社區夥伴在舞台上合影" ratio="portrait" tone="ochre" />
      </section>

      <section className="about-ending">
        <h2><span className="heading-line">過港的故事，</span><span className="heading-line">還會繼續寫下去。</span></h2>
        <p>一個社區能走多遠，從來不是一個人的事情。謝謝每一位願意參與、願意留下來一起做事的人，也歡迎更多人從不同的方式，慢慢認識過港。</p>
        <div className="button-row">
          <a className="button button-primary" href={sitePath("/guogang")}>認識過港</a>
          <a className="button button-outline" href={sitePath("/people")}>人與過港</a>
          <a className="button button-outline" href={sitePath("/goods")}>看看過港好味</a>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div><p className="eyebrow light">CONTACT US</p><h2>與過港保持聯絡</h2><PhoneContact /><PhoneAction /></div>
        <dl>
          <div><dt>地址</dt><dd>{SITE_CONFIG.address.slice(0, -4)}<span className="address-unit">{SITE_CONFIG.address.slice(-4)}</span></dd></div>
          <div><dt>電話</dt><dd><a href={`tel:${SITE_CONFIG.phone.replace(/-/g, "")}`}>{SITE_CONFIG.phone}</a></dd></div>
          <div><dt>Facebook</dt><dd><a href={SITE_CONFIG.facebookUrl} target="_blank" rel="noreferrer">前往 Facebook 專頁</a></dd></div>
        </dl>
      </section>
      <section className="about-journey site-information" id="site-info" aria-labelledby="site-info-title">
        <header>
          <p className="eyebrow">ABOUT THIS WEBSITE</p>
          <h2 id="site-info-title">網站資訊與隱私權</h2>
          <p className="site-information-date">更新日期｜2026 年 9 月 29 日</p>
        </header>
        <div className="site-information-copy">
          <section>
            <h3>網站與聯絡窗口</h3>
            <p>本網站介紹基隆市暖暖區過港社區發展協會、地方故事與社區特色商品。如有網站內容、照片或隱私相關問題，請聯絡過港社區發展協會。</p>
            <p>聯絡電話｜<a href={`tel:${SITE_CONFIG.phone.replace(/-/g, "")}`}>{SITE_CONFIG.phone}</a><br />地址｜{SITE_CONFIG.address}</p>
          </section>
          <section>
            <h3>人物故事與資料來源</h3>
            <p>六篇人物故事由參與「蹲點・台灣」的學生林品均、李佩璇採訪、撰寫與製作，整理自十八天的訪談、走訪與實際相處。其他資料如有來源標示，請參閱各頁說明。</p>
          </section>
          <section>
            <h3>文章與照片的使用</h3>
            <p>歡迎分享本網站連結。如需轉載文章或使用照片，請先聯絡協會確認使用方式與授權；各項內容的權利仍屬原權利人。如發現內容有誤，或照片涉及您的權益，也歡迎來電告知。</p>
          </section>
          <section>
            <h3>瀏覽資料與隱私</h3>
            <p>本網站目前不設會員註冊或資料填寫表單，也未安裝流量分析或廣告追蹤工具。網站程式本身未設定 Cookie，亦未使用瀏覽器儲存空間記錄訪客資料。</p>
            <p>網站由 GitHub Pages 提供託管服務。瀏覽時，服務提供者可能處理 IP 位址、瀏覽器資訊與連線紀錄等技術資料，詳見 <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">GitHub 隱私權聲明</a>。</p>
          </section>
          <section>
            <h3>地圖與外部網站</h3>
            <p>開啟互動地圖的地點資訊時，頁面會載入 Google 地圖，並向 Google 傳送連線所需資訊；Google 可能使用 Cookie 或處理相關資料，詳見 <a href="https://policies.google.com/privacy?hl=zh-TW" target="_blank" rel="noreferrer">Google 隱私權政策</a>。</p>
            <p>點擊 Facebook、資料來源或其他外部連結後，將前往第三方網站，其資料處理方式依各網站的隱私權政策辦理。本說明會隨網站功能調整而更新。</p>
          </section>
        </div>
      </section>
    </main>
  );
}
