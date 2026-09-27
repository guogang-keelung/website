"use client";
import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "../data/site";
import { sitePath, stripSiteBasePath } from "../utils/sitePath";

export function SiteHeader() {
  const [pathname, setPathname] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const updatePath = () => setPathname(stripSiteBasePath(window.location.pathname));
    updatePath();
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) { setMenuOpen(false); toggleRef.current?.focus(); }
    };
    const desktop = window.matchMedia("(min-width: 901px)");
    const resize = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener("keydown", close);
    desktop.addEventListener("change", resize);
    return () => { document.removeEventListener("keydown", close); desktop.removeEventListener("change", resize); };
  }, [menuOpen]);
  return (
    <header className={`site-header${menuOpen ? " menu-open" : ""}`}>
      <div className="header-inner">
        <a className="wordmark" href={sitePath("/")} aria-label="過港首頁">
          <img src={sitePath("/images/guogang-header-logo-320.webp")} width={739} height={351} alt="過港社區發展協會商標" fetchPriority="high" />
        </a>
        <button ref={toggleRef} className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="sr-only">{menuOpen ? "關閉選單" : "開啟選單"}</span><span aria-hidden="true" /><span aria-hidden="true" />
        </button>
        <nav id="primary-navigation" className="primary-navigation" aria-label="主要導覽">
          <ul>{NAV_ITEMS.map((item, index) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <li key={item.href}><a className={active ? "is-active" : ""} href={sitePath(item.href)} aria-current={active ? "page" : undefined} onClick={() => { setPathname(item.href); setMenuOpen(false); }}>
              <span className="nav-index" aria-hidden="true">0{index + 1}</span>{item.label}
            </a></li>;
          })}</ul>

        </nav>
      </div>
    </header>
  );
}
