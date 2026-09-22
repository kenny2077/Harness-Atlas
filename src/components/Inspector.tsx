import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import type { ArchitectureNode } from "../content/types";
import { SourceLinks } from "./SourceLinks";

export function Inspector({
  node,
  onClose,
  onOpenLab,
}: {
  node: ArchitectureNode;
  onClose: () => void;
  onOpenLab?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [modal, setModal] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setModal(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!modal) return;
    const background = [
      ...document.querySelectorAll<HTMLElement>(
        ".site-header,.harness-bar,.lesson-pane,.stage,.harness-notes,.site-footer",
      ),
    ];
    const previous = background.map((element) => element.inert);
    background.forEach((element) => {
      element.inert = true;
    });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      background.forEach((element, index) => {
        element.inert = previous[index];
      });
      document.body.style.overflow = overflow;
    };
  }, [modal]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <aside
      ref={ref}
      tabIndex={-1}
      className="inspector"
      data-testid="component-inspector"
      role={modal ? "dialog" : "complementary"}
      aria-modal={modal || undefined}
      aria-label={`${node.label} details`}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
        if (modal && event.key === "Tab") {
          const focusable = [
            ...(ref.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),a[href]",
            ) || []),
          ];
          const first = focusable[0];
          const last = focusable.at(-1);
          if (
            event.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === ref.current)
          ) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <div className="inspector-head">
        <div>
          <span className="evidence-tag">{node.responsibility.evidence}</span>
          <h2>{node.label}</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close component details"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <div className="inspector-body">
        <h3>Responsibility</h3>
        <p>{node.responsibility.text}</p>
        <dl>
          <dt>Receives</dt>
          <dd>{node.inputs}</dd>
          <dt>Produces</dt>
          <dd>{node.outputs}</dd>
          <dt>Extension seam</dt>
          <dd>{node.extension}</dd>
          <dt>What to watch</dt>
          <dd>{node.failureMode}</dd>
        </dl>
        {node.code && (
          <>
            <h3>At the source</h3>
            <pre>
              <code>{node.code.text}</code>
            </pre>
            <p className="annotation">{node.code.annotation}</p>
          </>
        )}
        <h3>Source trail</h3>
        <SourceLinks ids={node.sourceIds} />
        {onOpenLab && (
          <button className="primary-button" onClick={onOpenLab}>
            Open guided lab
            <ArrowRight size={17} />
          </button>
        )}
      </div>
    </aside>
  );
}
