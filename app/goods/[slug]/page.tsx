import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhoneContact } from "../../components/PhoneAction";
import { ProductGallery } from "../../components/ProductGallery";
import { GOODS } from "../../data/site";
import { sitePath } from "../../utils/sitePath";

type GoodPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: GoodPageProps): Promise<Metadata> {
  const { slug } = await params;
  const good = GOODS.find((item) => item.slug === slug);
  return { title: good?.name ?? "過港好味", description: good?.summary ?? "過港好味內容" };
}

export default async function GoodDetailPage({ params }: GoodPageProps) {
  const { slug } = await params;
  const good = GOODS.find((item) => item.slug === slug);
  if (!good) notFound();
  const index = GOODS.findIndex((item) => item.slug === slug);

  return (
    <main className="article-page good-detail-page">
      <div className="breadcrumb"><a href={sitePath("/")}>首頁</a><span>/</span><a href={sitePath("/goods")}>過港好味</a><span>/</span><span>{good.name}</span></div>
      <header className="good-detail-hero">
        <div className="good-title-block">
          <p className="eyebrow">GUOGANG GOODS / {String(index + 1).padStart(2, "0")}</p>
          <h1>{good.name}</h1>
          <p>{good.summary}</p>

        </div>
        <ProductGallery images={[good.coverImage, ...good.galleryImages]} name={good.name} ratio="landscape" tone="clay" />
      </header>
      <section className="article-body good-story-body">
        <aside><span>GUOGANG GOODS</span><strong>熟悉的味道，好好做好。</strong></aside>
        <div>
          <h2>從日常開始</h2>
          <p>{good.story}</p>
          <PhoneContact />
        </div>
      </section>
      <nav className="article-navigation" aria-label="好物文章導覽">
        <a href={sitePath("/goods")}>← 返回全部好物</a>
        <a href={sitePath(`/goods/${GOODS[(index + 1) % GOODS.length].slug}`)}>下一項好物 →</a>
      </nav>
    </main>
  );
}
