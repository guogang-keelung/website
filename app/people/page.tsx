import type { Metadata } from "next";
import { HeadingLines } from "../components/HeadingLines";
import { PageIntro } from "../components/PageIntro";
import { PEOPLE_STORY_PHOTOS } from "../data/peopleStoryPhotos";
import { PEOPLE, PEOPLE_READING_ORDER } from "../data/site";
import { getPeopleStory } from "../data/peopleStories";
import { sitePath } from "../utils/sitePath";

export const metadata: Metadata = {
  title: "人與過港",
  description: "從六種與過港相遇的方式，看見這個地方不同的模樣。",
};

type IndexEntry = {
  slug: string;
  name: string;
  role?: string;
  headlineLines: Array<{ text: string }>;
  summaryLines: string[];
  cta: string;
  visual: {
    type: "image" | "editorial";
    ratio: "portrait" | "landscape";
    src?: string;
    alt?: string;
    eyebrow?: string;
    frameLine?: string[];
    annotation?: string[];
    treatment?: "text-led";
  };
  side: "left" | "right";
  offset: number;
};

const PEOPLE_INDEX_ORDER: IndexEntry[] = [
  {
    "slug": "bottle-cap-grandma",
    "visual": {
      "type": "editorial",
      "ratio": "portrait"
    },
    "side": "left",
    "offset": 0
  },
  {
    "slug": "breakfast-shop-owner",
    "visual": {
      "type": "editorial",
      "ratio": "landscape",
      "treatment": "text-led"
    },
    "side": "right",
    "offset": 3
  },
  {
    "slug": "couple-story-two",
    "visual": {
      "type": "editorial",
      "ratio": "landscape"
    },
    "side": "left",
    "offset": 0
  },
  {
    "slug": "couple-story-one",
    "visual": {
      "type": "image",
      "ratio": "portrait",
      "src": "/images/people/couple-story-one/qingshuang-axiao-portrait.jpg",
      "alt": "清爽 × 阿笑"
    },
    "side": "right",
    "offset": 2
  },
  {
    "slug": "community-kitchen-mother",
    "visual": {
      "type": "image",
      "ratio": "portrait",
      "src": "/images/people/community-kitchen-mother/li-shui-jin-kitchen.jpg",
      "alt": "煮飯阿姨"
    },
    "side": "left",
    "offset": 1
  },
  {
    "slug": "community-volunteer",
    "visual": {
      "type": "editorial",
      "ratio": "landscape"
    },
    "side": "right",
    "offset": 4
  }
].sort((a, b) => PEOPLE_READING_ORDER.indexOf(a.slug) - PEOPLE_READING_ORDER.indexOf(b.slug)).map((entry) => {
  const story = getPeopleStory(entry.slug)!;
  return {
    ...entry,
    side: entry.side as IndexEntry["side"],
    name: story.name,
    role: story.role,
    headlineLines: story.titleLines.map((text) => ({ text })),
    summaryLines: story.ending.smallLines,
    cta: `閱讀${story.name}的故事 →`,
    visual: {
      ...entry.visual,
      type: entry.visual.type as IndexEntry["visual"]["type"],
      ratio: entry.visual.ratio as IndexEntry["visual"]["ratio"],
      treatment: entry.visual.treatment as IndexEntry["visual"]["treatment"],
      eyebrow: story.name,
      frameLine: story.ending.largeLines,
    },
  };
});

function renderSummaryLines(lines: string[]) {
  return <p style={{ whiteSpace: "pre-wrap" }}>{lines.join("\n")}</p>;
}

function renderHeadlineLines(lines: IndexEntry["headlineLines"]) {
  return <HeadingLines lines={lines.map((line) => line.text)} />;
}

export default function PeoplePage() {
  const indexEntries = PEOPLE_INDEX_ORDER.map((entry) => {
    const person = PEOPLE.find((item) => item.slug === entry.slug);
    return {
      ...entry,
      href: person ? `/people/${person.slug}` : `/people/${entry.slug}`,
    };
  });

  return (
    <main className="inner-page people-page">
      <PageIntro
        index=""
        title="人與過港"
        description="有人每天來這裡工作，有人在這裡住了大半輩子，也有人因為家人、志工，或一件件生活裡的小事，慢慢和過港有了關係。"
        vertical="PEOPLE OF GUOGANG"
        hideIndex
      />

      <section id="page-story" className="people-overview" aria-labelledby="people-overview-title">
        <header className="people-overview-heading">
          <p className="eyebrow">PEOPLE OF GUOGANG / 人與過港</p>
          <h2 id="people-overview-title">
            <HeadingLines lines={["過港的樣子，", "藏在不同人的日常裡。"]} />
          </h2>
          <div className="people-overview-copy">
            <p>有人每天來這裡工作，</p>
            <p>有人在這裡住了大半輩子，</p>
            <p>也有人因為家人、志工，</p>
            <p>或因為生活裡的一件件小事，</p>
            <p>慢慢和過港有了關係。</p>
            <p>六段不同的人生，</p>
            <p>也留下六種認識過港的方式。</p>
          </div>
        </header>

        <div className="people-open-collage" aria-label="人物誌開場剪影">
          <figure className={`people-open-collage-image people-open-collage-image--wide`}>
            <img src={sitePath("/images/people-updated-20260920/index-49.webp")} alt="過港生活影像 49" loading="lazy" />
          </figure>
          <figure className={`people-open-collage-image people-open-collage-image--small people-open-collage-image--portrait`}>
            <img src={sitePath("/images/people-updated-20260920/index-58.webp")} alt="過港生活影像 58" loading="lazy" />
          </figure>
          <figure className={`people-open-collage-image people-open-collage-image--small`}>
            <img src={sitePath("/images/people-updated-20260920/index-105.webp")} alt="過港生活影像 105" loading="lazy" />
          </figure>
        </div>

        <div className="people-story-list">
          {indexEntries.map((entry, index) => (
            <article
              className={`people-story-card people-story-card--${entry.side} people-story-card--depth-${index % 3 + 1}`}
              key={entry.slug}
              style={{ ["--people-offset" as string]: `${entry.offset}rem` }}
            >
              <div className="people-story-copy">
                <p className="people-story-name">{entry.name}</p>
                {entry.role ? <p className="people-story-role">{entry.role}</p> : null}
                <h2 className="people-story-headline">{renderHeadlineLines(entry.headlineLines)}</h2>
                <div className="people-story-summary">{renderSummaryLines(entry.summaryLines)}</div>
                <a className="text-link people-story-cta" href={sitePath(entry.href)}>{entry.cta}</a>
              </div>

              <div className={`people-story-visual people-story-visual--${entry.visual.ratio} people-story-visual--${entry.visual.type}${entry.visual.treatment ? ` people-story-visual--${entry.visual.treatment}` : ""}`}>
                {entry.visual.type === "image" ? (
                  <figure>
                    <img src={sitePath(PEOPLE_STORY_PHOTOS[entry.slug].hero.src)} alt={PEOPLE_STORY_PHOTOS[entry.slug].hero.alt} loading="lazy" decoding="async" />
                  </figure>
                ) : (
                  <div className="people-story-editorial-portrait">
                  <img src={sitePath(PEOPLE_STORY_PHOTOS[entry.slug].hero.src)} alt={PEOPLE_STORY_PHOTOS[entry.slug].hero.alt} loading="lazy" />
                  <div className="people-story-editorial-cover" aria-label={`為 ${entry.name} 的手工編輯式封面`}>
                    <p className="eyebrow">{entry.visual.eyebrow}</p>
                    {entry.visual.frameLine
                      ? entry.visual.frameLine.map((line, i) => (
                          <p key={`${line}-${i}`} className="people-story-editorial-line">
                            {line}
                          </p>
                        ))
                      : null}
                    {entry.visual.annotation ? (
                      <p className="people-story-editorial-footnote">
                        {entry.visual.annotation.join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="people-ending">
        <p className="eyebrow">ABOUT THE STORIES</p>
        <div className="people-ending-intro">
          <h2>
            <HeadingLines lines={["六篇人物故事，", "來自十八天的訪談與相處。"]} />
          </h2>
        </div>
        <div className="people-ending-copy">
          <p>我們是參與「蹲點・台灣」的學生團隊。</p>
          <p>在過港的十八天裡，我們參與社區活動、跟著居民走訪，也一次次坐下來，聽他們說起自己的生活。</p>
          <p>這六篇故事，就是從這些訪談與相處裡慢慢整理出來的。</p>
          <div className="people-ending-credits">
            <p>採訪、文字與製作｜林品均、李佩璇</p>
            <p>參與計畫｜蹲點・台灣</p>
          </div>
          <img className="people-authors-photo" src={sitePath("/images/people-authors.webp")} width="560" height="420" alt="林品均與李佩璇參與蹲點・台灣計畫的合照" loading="lazy" decoding="async" />
        </div>
      </section>
    </main>
  );
}
