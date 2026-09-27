"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { sitePath } from "../utils/sitePath";
import { HeadingLines } from "./HeadingLines";

type StoryStage = {
  number: string;
  titleLines: readonly string[];
  description: string;
  imageLabel: string;
  tone: "paper" | "ink" | "ochre" | "green";
  image?: string;
  imageMobile?: string;
  imageWidth?: number;
  objectPosition?: string;
  objectFit?: "cover" | "contain";
};

const STAGES: StoryStage[] = [
  {
    number: "01",
    titleLines: ["這裡是過港。"],
    description: "一個沿著基隆河生活的地方。",
    imageLabel: "過港河岸、壺穴與周邊環境",
    image: "/images/home/updated-20260920/home-scroll-01.webp",
    imageMobile: "/images/home/updated-20260920/home-scroll-01-1280.webp",
    objectPosition: "center center",
    tone: "paper",
  },
  {
    number: "02",
    titleLines: ["過港的樣子，", "藏在不同人的日常裡。"],
    description: "居民相聚、活動的日常，也慢慢留下過港的樣子。",
    imageLabel: "過港居民在社區空間進行團體活動",
    image: "/images/home/updated-20260920/home-scroll-02.webp",
    imageMobile: "/images/home/updated-20260920/home-scroll-02-1280.webp",
    objectPosition: "center center",
    tone: "ink",
  },
  {
    number: "03",
    titleLines: ["而這些日常，", "也被一雙雙手做成了味道。"],
    description: "從備料到料理，一雙雙手把熟悉的味道慢慢做出來。",
    imageLabel: "居民雙手刨製蘿蔔、準備料理",
    image: "/images/home/updated-20260920/home-scroll-03.webp",
    imageMobile: "/images/home/updated-20260920/home-scroll-03-1280.webp",
    objectPosition: "center center",
    tone: "ochre",
  },
  {
    number: "04",
    imageWidth: 1672,
    objectFit: "contain",
    titleLines: ["把過港的故事，", "帶到更遠的地方。"],
    description: "完成的商品，也把過港的生活與故事帶向更遠的地方。",
    imageLabel: "過港好味商品合照",
    image: "/images/home/updated-20260920/home-scroll-04.webp",
    imageMobile: "/images/home/updated-20260920/home-scroll-04-1280.webp",
    objectPosition: "center center",
    tone: "green",
  },
];

function StoryPhoto({ index, decorative = false }: { index: number; decorative?: boolean }) {
  const stage = STAGES[index];
  return <figure className={`narrative-image narrative-page-${index % 2 === 0 ? 'left' : 'right'}`}>
    <img src={sitePath(stage.image!)} srcSet={`${sitePath(stage.image!.replace(".webp", "-768.webp"))} 768w, ${sitePath(stage.imageMobile!)} 1280w, ${sitePath(stage.image!)} ${stage.imageWidth ?? 2560}w`}
      sizes="(max-width: 700px) 100vw, 50vw" style={{ objectPosition: stage.objectPosition, objectFit: stage.objectFit }}
      alt={decorative ? "" : stage.imageLabel} loading={index === 0 || decorative ? "eager" : "lazy"} fetchPriority={index === 0 && !decorative ? "high" : "low"} />
    <figcaption><span>{stage.number} / GUOGANG</span><span>{stage.imageLabel}</span></figcaption>
  </figure>;
}

function StoryCopy({ index, decorative = false }: { index: number; decorative?: boolean }) {
  const stage = STAGES[index], title = <HeadingLines lines={stage.titleLines} />;
  return <div className={`narrative-copy narrative-page-${index % 2 === 0 ? 'right' : 'left'}`}>
    {decorative ? <p className="story-heading">{title}</p> : index === 0 ? <h1>{title}</h1> : <h2>{title}</h2>}
    <p>{stage.description}</p>
    {index === STAGES.length - 1 && <div className="button-row">
      <a className="text-link" href={sitePath("/guogang")}>閱讀過港的故事 <span aria-hidden="true">→</span></a>
      <a className="text-link" href="#home-guides">繼續往下</a>
    </div>}
  </div>;
}

function BookPage({ index, side }: { index: number; side: 'left' | 'right' }) {
  const photoSide = index % 2 === 0 ? 'left' : 'right';
  return side === photoSide ? <StoryPhoto index={index} decorative /> : <StoryCopy index={index} decorative />;
}

export function HomeScrollStory() {
  const storyRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [turn, setTurn] = useState<{ from: number; to: number; direction: 'forward' | 'backward' } | null>(null);
  const indexRef = useRef(0);
  const transitionUntil = useRef(0);
  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(STAGES.length - 1, index));
    if (next === indexRef.current || performance.now() < transitionUntil.current) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTurn(reducedMotion ? null : { from: indexRef.current, to: next, direction: next > indexRef.current ? 'forward' : 'backward' });
    indexRef.current = next;
    transitionUntil.current = reducedMotion ? 0 : performance.now() + 900;
    setActiveIndex(next);
  }, []);
  useEffect(() => {
    if (!turn) return;
    const fallback = window.setTimeout(() => { setTurn(null); transitionUntil.current = 0; }, 1200);
    return () => window.clearTimeout(fallback);
  }, [turn]);
  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const header = document.querySelector('.site-header');
    const fitHeader = () => { if (header) story.style.setProperty('--story-header-height', `${header.getBoundingClientRect().height}px`); };
    fitHeader();
    const headerSize = new ResizeObserver(fitHeader);
    if (header) headerSize.observe(header);
    const canTurn = (direction: number) => indexRef.current + direction >= 0 && indexRef.current + direction < STAGES.length;
    // Oversized text / short screens remain scrollable before changing chapters.
    const atReadingEdge = (direction: number) => {
      const bounds = story.getBoundingClientRect();
      return direction > 0 ? bounds.bottom <= innerHeight + 2 && bounds.top < innerHeight / 2 : bounds.top >= -2 && bounds.bottom > innerHeight / 2;
    };
    let lastWheel = 0, lastDirection = 0, wheelDistance = 0, gestureHandled = false;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY || document.querySelector('.menu-open')) return;
      const direction = Math.sign(event.deltaY), now = performance.now();
      if (!atReadingEdge(direction)) return;
      if (now - lastWheel > 180 || direction !== lastDirection) { wheelDistance = 0; gestureHandled = false; }
      lastWheel = now; lastDirection = direction;
      // Consume the rest of one gesture, including its momentum at the final page.
      if (gestureHandled || now < transitionUntil.current) { event.preventDefault(); return; }
      if (!canTurn(direction)) return;
      event.preventDefault();
      wheelDistance += Math.abs(event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (wheelDistance >= 24) { gestureHandled = true; goTo(indexRef.current + direction); }
    };
    let touch: { x: number; y: number; handled: boolean } | null = null;
    const touchStart = (event: TouchEvent) => {
      touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY, handled: false } : null;
    };
    const touchMove = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - touch.x, dy = touch.y - event.touches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy)) { touch = null; return; }
      if (Math.abs(dy) < 8) return;
      const direction = Math.sign(dy);
      if (touch.handled) { event.preventDefault(); return; }
      if (!canTurn(direction) || !atReadingEdge(direction)) return;
      event.preventDefault();
      if (Math.abs(dy) >= 45 && performance.now() >= transitionUntil.current) { touch.handled = true; goTo(indexRef.current + direction); }
    };
    const touchEnd = () => { touch = null; };
    window.addEventListener('wheel', wheel, { passive: false });
    story.addEventListener('touchstart', touchStart, { passive: true });
    story.addEventListener('touchmove', touchMove, { passive: false });
    story.addEventListener('touchend', touchEnd);
    story.addEventListener('touchcancel', touchEnd);
    return () => {
      headerSize.disconnect();
      window.removeEventListener('wheel', wheel);
      story.removeEventListener('touchstart', touchStart);
      story.removeEventListener('touchmove', touchMove);
      story.removeEventListener('touchend', touchEnd);
      story.removeEventListener('touchcancel', touchEnd);
    };
  }, [goTo]);
  return (
    <section className="home-narrative" ref={storyRef} data-active-scene={activeIndex} aria-label="捲動閱讀過港地方故事" aria-roledescription="翻頁書">
      <div className="narrative-pages">
      {STAGES.map((stage, index) => (
        <article className={`narrative-scene narrative-scene-${index + 1} ${index === activeIndex ? 'is-current' : index < activeIndex ? 'is-before' : 'is-after'}`} id={`scene-${stage.number}`} data-scene={index} key={stage.number} aria-hidden={index !== activeIndex} inert={index !== activeIndex}>
          <StoryPhoto index={index} />
          <StoryCopy index={index} />
        </article>
      ))}
      {turn && <div className="book-turn" aria-hidden="true" inert>
        <div className={`book-still-page is-${turn.direction}`}>
          <BookPage index={turn.from} side={turn.direction === 'forward' ? 'left' : 'right'} />
        </div>
        <div className={`book-turn-leaf is-${turn.direction}`} onAnimationEnd={(event) => { if (event.target === event.currentTarget) { setTurn(null); transitionUntil.current = 0; } }}>
          <div className="book-face book-face-front">
            <div className="book-desktop-page"><BookPage index={turn.from} side={turn.direction === 'forward' ? 'right' : 'left'} /></div>
            <div className="book-mobile-page"><StoryPhoto index={turn.from} decorative /><StoryCopy index={turn.from} decorative /></div>
          </div>
          <div className="book-face book-face-back"><div className="book-desktop-page">
            <BookPage index={turn.to} side={turn.direction === 'forward' ? 'left' : 'right'} />
          </div></div>
        </div>
      </div>}
      </div>
      <nav className="narrative-index" aria-label="首頁敘事章節">
        <span className="narrative-scroll-hint">向下捲動，翻閱過港</span>
        <div>{STAGES.map((stage, index) => <a key={stage.number} href={`#scene-${stage.number}`} onClick={(event) => { event.preventDefault(); goTo(index); }}
          onKeyDown={(event) => {
            const direction = ['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key) ? 1 : ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key) ? -1 : 0;
            const next = activeIndex + direction;
            if (direction && next >= 0 && next < STAGES.length) { event.preventDefault(); goTo(next); storyRef.current?.querySelectorAll<HTMLAnchorElement>('.narrative-index a')[next]?.focus(); }
          }} aria-label={stage.titleLines.join("")} aria-current={activeIndex === index ? "step" : undefined}>{stage.number}</a>)}</div>
      </nav>
    </section>
  );
}
