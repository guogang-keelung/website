import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { sitePath } from "./utils/sitePath";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const siteUrl = `${protocol}://${host}`;

  return {
    metadataBase: new URL(siteUrl),
    icons: { icon: [{ url: sitePath("/favicon.svg"), type: "image/svg+xml" }] },
    title: {
      default: "基隆市暖暖區過港社區發展協會",
      template: "%s｜過港",
    },
    description: "從河岸的名字、過港好味、人物與社區生活，慢慢認識過港。",
    openGraph: {
      type: "website",
      locale: "zh_TW",
      siteName: "過港",
      title: "基隆市暖暖區過港社區發展協會",
      description: "走進過港，看見地方與人的生活。",
      images: [{ url: `${siteUrl}${sitePath("/images/guogang-share-logo-v2.jpg")}`, width: 1200, height: 1200, alt: "過港社區發展協會 Logo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "基隆市暖暖區過港社區發展協會",
      description: "走進過港，看見地方與人的生活。",
      images: [`${siteUrl}${sitePath("/images/guogang-share-logo-v2.jpg")}`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <a className="skip-link" href="#main-content">跳至主要內容</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
