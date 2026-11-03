"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealElement = HTMLElement;

interface RevealOptions {
  delay?: number;
  mode?: "rise" | "fade";
  /** "view" waits until the element scrolls into view, "mount" reveals immediately */
  trigger?: "view" | "mount";
}

function useReveal<T extends RevealElement>({
  delay = 0,
  mode = "rise",
  trigger = "view",
}: RevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (trigger === "mount") {
      el.dataset.visible = "true";
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      el.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger]);

  return {
    ref,
    style: { "--reveal-delay": `${delay}ms` } as React.CSSProperties,
    "data-reveal": mode,
  };
}

interface RevealProps extends RevealOptions {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header" | "footer";
}

/** Fades and lifts content into view once, driven by CSS + IntersectionObserver. */
export function Reveal({
  children,
  className,
  delay = 0,
  mode = "rise",
  trigger = "view",
  as: Tag = "div",
}: RevealProps) {
  const { ref, style, ...attrs } = useReveal<HTMLDivElement>({ delay, mode, trigger });
  return (
    <Tag ref={ref as never} className={className} style={style} {...attrs}>
      {children}
    </Tag>
  );
}

/** Parent that staggers direct <StaggerItem> children. */
export function Stagger({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
}) {
  return (
    <Tag className={className} data-stagger>
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as: Tag = "div",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  delay?: number;
}) {
  const { ref, style, ...attrs } = useReveal<HTMLDivElement>({ delay, mode: "rise" });
  return (
    <Tag ref={ref as never} className={className} style={style} {...attrs}>
      {children}
    </Tag>
  );
}
