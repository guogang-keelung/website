import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImagePlaceholder } from "../../components/ImagePlaceholder";
import { PeopleStoryArticle } from "../../components/PeopleStoryArticle";
import { getPeopleStory } from "../../data/peopleStories";
import { PEOPLE, PEOPLE_READING_ORDER } from "../../data/site";
import { sitePath } from "../../utils/sitePath";

type PersonPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = PEOPLE.find((item) => item.slug === slug);
  const story = getPeopleStory(slug);
  const number = PEOPLE.findIndex((item) => item.slug === slug) + 1;
  return {
    title: story ? `${story.name}｜${story.titleLines.join("")}｜人與過港` : person ? `人物故事 ${String(number).padStart(2, "0")}` : "人與過港",
    description: story?.description ?? person?.summary ?? "過港人物專訪",
  };
}

export default async function PersonDetailPage({ params }: PersonPageProps) {
  const { slug } = await params;
  const person = PEOPLE.find((item) => item.slug === slug);
  if (!person) notFound();
  const orderedPeople = PEOPLE_READING_ORDER.map(key => PEOPLE.find(item => item.slug === key)!);
  const index = orderedPeople.findIndex((item) => item.slug === slug);
  const previous = orderedPeople[(index - 1 + orderedPeople.length) % orderedPeople.length];
  const next = orderedPeople[(index + 1) % orderedPeople.length];
  const story = getPeopleStory(slug);

  if (story) return <PeopleStoryArticle story={story} previous={previous} next={next} />;

  return (
    <main className="article-page person-detail-page">
      <div className="breadcrumb"><a href={sitePath("/")}>首頁</a><span>/</span><a href={sitePath("/people")}>人與過港</a><span>/</span><span>故事 {String(index + 1).padStart(2, "0")}</span></div>
      <header className="person-article-hero">
        <div className="person-article-title">
          <p className="eyebrow">INTERVIEW / {String(index + 1).padStart(2, "0")}</p>
          <h1>{person.name}</h1>
          <p>{person.role}</p>
          <blockquote>「{person.quote}」</blockquote>
        </div>
        <ImagePlaceholder label={person.coverImage} ratio="portrait" tone="green" />
      </header>
      <section className="article-summary">
        <span>OPENING</span>
        <p>{person.summary}</p>
      </section>
      <section className="article-body interview-body">
        <aside><span>CONVERSATION</span><strong>人物與過港的生活片段</strong></aside>
        <div>
          {person.interviewContent.map((paragraph, paragraphIndex) => (
            <section key={paragraph}>
              <h2>{paragraphIndex === 0 ? "訪談開場" : `訪談段落 ${String(paragraphIndex).padStart(2, "0")}`}</h2>
              <p>{paragraph}</p>
            </section>
          ))}
        </div>
      </section>
      <section className="article-gallery">
        {person.galleryImages.map((image, galleryIndex) => <ImagePlaceholder key={image} label={image} ratio={galleryIndex === 1 ? "wide" : "landscape"} tone={galleryIndex === 1 ? "clay" : "paper"} />)}
      </section>
      <nav className="article-navigation" aria-label="人物專訪導覽">
        <a href={sitePath(`/people/${previous.slug}`)}>← 上一篇人物</a>
        <a href={sitePath("/people")}>返回全部人物</a>
        <a href={sitePath(`/people/${next.slug}`)}>下一篇人物 →</a>
      </nav>
    </main>
  );
}
