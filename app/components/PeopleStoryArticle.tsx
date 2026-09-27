import { HeadingLines } from "./HeadingLines";
import type { PeopleStory, StoryBlock, StoryImage } from "../data/peopleStories";
import { PEOPLE_STORY_PHOTOS } from "../data/peopleStoryPhotos";
import type { Person } from "../data/site";
import { sitePath } from "../utils/sitePath";

type PeopleStoryArticleProps = {
  story: PeopleStory;
  previous: Person;
  next: Person;
};

function StoryFigure({ image, className = "" }: { image: StoryImage; className?: string }) {
  return (
    <figure className={`people-article-figure ${className}`.trim()}>
      <img src={sitePath(image.src)} alt={image.alt} loading={className.includes("hero") ? "eager" : "lazy"} decoding="async" />
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}

function StoryBlocks({ blocks }: { blocks: StoryBlock[] }) {
  return blocks.map((block, index) => block.type === "quote" ? (
    <blockquote key={index}>{block.text.split(/(一天過一天[，。]?[」]?)/g).map((part, partIndex) => part.startsWith("一天過一天") ? <span className="story-phrase" key={partIndex}>{part}</span> : part)}</blockquote>
  ) : (
    <p key={index}>{block.emphasizedLines ? block.text.split("\n").map((line, lineIndex) => (
      <span key={lineIndex}>{lineIndex > 0 ? "\n" : ""}{block.emphasizedLines!.includes(lineIndex) ? <span className="people-inline-quote">{line}</span> : line}</span>
    )) : block.text}</p>
  ));
}

// Hero-only phrase groups preserve the overview headings and all article copy.
const HERO_TITLE_LINES: Record<string, string[][]> = {
  "bottle-cap-grandma": [["把時間，"], ["一個瓶蓋一個瓶蓋", "留在過港。"]],
  "breakfast-shop-owner": [["二十五年，"], ["早晨裡的人", "慢慢熟了。"]],
  "community-kitchen-mother": [["這條半小時的路，"], ["她走了十年。"]],
  "community-volunteer": [["一天過一天，"], ["他們一起", "走到了現在。"]],
  "couple-story-one": [["四十多年，"], ["他們一起把日子", "過到了過港。"]],
  "couple-story-two": [["去看看，", "最近好不好。"]],
};

export function PeopleStoryArticle({ story, previous, next }: PeopleStoryArticleProps) {
  const photos = PEOPLE_STORY_PHOTOS[story.slug];
  const heroImage = photos?.hero ?? story.heroImage;

  return (
    <main className="article-page people-article-page">
      <div className="breadcrumb">
        <a href={sitePath("/")}>首頁</a>
        <span>/</span>
        <a href={sitePath("/people")}>人與過港</a>
        <span>/</span>
        <span>故事 {story.storyNumber}</span>
      </div>

      <header className={`people-article-hero${heroImage ? "" : " people-article-hero-text-only"}`}>
        <div className="people-article-heading">
          <p className="eyebrow">INTERVIEW / {story.storyNumber}</p>
          <div className="people-article-identity">
            <strong>{story.name}</strong>
            {story.role ? <span>{story.role}</span> : null}
          </div>
          <h1>{HERO_TITLE_LINES[story.slug].map((line, index) => (
            <span className="people-title-line" key={index}>{line.map((phrase, phraseIndex) => (
              <span className={`people-title-phrase${story.slug === "bottle-cap-grandma" && phraseIndex > 0 ? " people-title-phrase-gap" : ""}`} key={phrase}>{phrase}</span>
            ))}</span>
          ))}</h1>
          {story.subtitleLines.length ? <p className="people-article-subtitle"><HeadingLines lines={story.subtitleLines} /></p> : null}
        </div>
        {heroImage ? <StoryFigure image={heroImage} className="people-article-hero-image" /> : null}
      </header>

      <article className="people-article-content">
        <div className="people-article-section people-article-opening">
          <div className="people-article-section-copy">
            <StoryBlocks blocks={story.introBlocks} />
          </div>
        </div>
        {story.sections.map((section, sectionIndex) => (
          <section className="people-article-section" key={section.heading}>
            <div className="people-article-section-marker" aria-hidden="true">
              {String(sectionIndex + 1).padStart(2, "0")}
            </div>
            <div className="people-article-section-copy">
              <h2>{section.heading}</h2>
              <StoryBlocks blocks={section.blocks} />
            </div>
          </section>
        ))}
        <footer className="people-article-ending">
          <p className="people-article-ending-large">{story.ending.largeLines.join("\n")}</p>
          <p className="people-article-ending-small">{story.ending.smallLines.join("\n")}</p>
        </footer>
        {photos?.gallery.length ? (
          <section className="people-article-gallery" aria-label={`${story.name}的影像紀錄`}>
            {photos.gallery.map((image) => <StoryFigure image={image} key={image.src} />)}
          </section>
        ) : null}
      </article>

      <nav className="article-navigation" aria-label="人物專訪導覽">
        <a href={sitePath(`/people/${previous.slug}`)}>← 上一篇人物</a>
        <a href={sitePath("/people")}>返回全部人物</a>
        <a href={sitePath(`/people/${next.slug}`)}>下一篇人物 →</a>
      </nav>
    </main>
  );
}
