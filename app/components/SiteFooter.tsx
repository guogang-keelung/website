import { NAV_ITEMS, SITE_CONFIG } from "../data/site";
import { sitePath } from "../utils/sitePath";
import { HeadingLines } from "./HeadingLines";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <p className="eyebrow light">KEEP THE STORY GOING</p>
        <h2><HeadingLines lines={["從一個地方的名字開始，", "慢慢認識過港。"]} /></h2>

      </div>
      <div className="footer-grid">
        <div>
          <a className="footer-wordmark footer-wordmark-logo" href={sitePath("/")} aria-label="過港首頁">
            {SITE_CONFIG.logoImage ? <img loading="lazy" decoding="async" src={sitePath(SITE_CONFIG.logoImage)} alt="過港社區發展協會" /> : "過港"}
          </a>
          <p>{SITE_CONFIG.associationName}</p>
        </div>
        <nav aria-label="頁尾導覽">
          {NAV_ITEMS.map((item) => <a href={sitePath(item.href)} key={item.href}>{item.label}</a>)}
        </nav>
        <address>
          <span>地址｜{SITE_CONFIG.address}</span>
          <a href={`tel:${SITE_CONFIG.phone.replace(/-/g, "")}`}>電話｜{SITE_CONFIG.phone}</a>
        </address>
        <div className="footer-social">
          <a href={SITE_CONFIG.facebookUrl} target="_blank" rel="noreferrer">Facebook｜前往專頁</a>
        </div>
      </div>
      <div className="footer-bottom" id="site-info">
        <span>© {new Date().getFullYear()} 過港</span>
        <a href={sitePath("/about#site-info")}>網站資訊與隱私權｜內容待提供</a>
      </div>
    </footer>
  );
}
