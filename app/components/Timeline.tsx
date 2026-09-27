import { HistoryGallery } from "./HistoryGallery";
import { HeadingLines } from "./HeadingLines";
import { sitePath } from "../utils/sitePath";

export type TimelineEntry = {
  year: string;
  titleLines: readonly string[];
  description: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageCaption?: string;
  images?: { src: string; alt: string; width: number; height: number }[];
  imageSource?: string;
};

type TimelineProps = { entries: TimelineEntry[]; label: string };

export function Timeline({ entries, label }: TimelineProps) {
  return (
    <ol className="history-timeline" aria-label={label}>
      {entries.map((entry, index) => {
        const title = entry.titleLines.join("");
        const [period, equivalentYear] = entry.year.split("／");
        const layout = index === entries.length - 1 ? "closing" : index === 3 ? "center" : index === 1 ? "right" : "left";
        return (
          <li key={`${entry.year}-${title}`} className={`history-node history-node-${layout}${index === 2 ? " history-node-archive" : ""}${index === 4 ? " history-node-return" : ""}`}>
            <article className="history-copy">
              <div className="timeline-year">
                <span className="eyebrow" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <strong>{period}</strong>
                {equivalentYear ? <span className="timeline-year-equivalent">{equivalentYear}</span> : null}
              </div>
              <h2><HeadingLines lines={entry.titleLines} /></h2>
              <div className="history-paragraphs">
                {entry.description.split("\n\n").map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </article>
            {entry.images ? (
              <figure className="history-archive">
                <HistoryGallery images={entry.images} />
                <figcaption>{entry.imageSource}</figcaption>
              </figure>
            ) : null}
            {entry.image ? (
              <figure className="history-photo">
                <img src={sitePath(entry.image)}
                  srcSet={`${sitePath(entry.image.replace(".webp", "-768.webp"))} 768w, ${sitePath(entry.image)} ${entry.imageWidth}w`}
                  sizes={layout === "closing" ? "90vw" : "(max-width: 900px) 90vw, 48vw"}
                  width={entry.imageWidth} height={entry.imageHeight}
                  alt={entry.imageAlt ?? title} loading="lazy" decoding="async" />
                {entry.imageCaption ? <figcaption>{entry.imageCaption}</figcaption> : null}
              </figure>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
