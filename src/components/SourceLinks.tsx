import { ArrowUpRight, FileCode2 } from "lucide-react";
import { sources, sourceUrl } from "../content";

export function SourceLinks({
  ids,
  compact = false,
}: {
  ids: string[];
  compact?: boolean;
}) {
  return (
    <div className={`source-links ${compact ? "compact" : ""}`}>
      {ids.map((id) => {
        const source = sources.find((s) => s.id === id);
        if (!source) return null;
        return (
          <a
            key={id}
            href={sourceUrl(source)}
            target="_blank"
            rel="noreferrer"
            title={`${source.repository}@${source.commit.slice(0, 8)} · ${source.path || source.kind}`}
          >
            <FileCode2 size={15} aria-hidden="true" />
            <span>{source.title}</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
