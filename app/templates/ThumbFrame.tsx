"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import styles from "./templates.module.css";

// The site renders as if on a 1024x640 desktop viewport, then gets scaled
// down to whatever width the card actually is (works for 2- or 3-col grids).
const VIRTUAL_W = 1024;
const VIRTUAL_H = 640;

export function ThumbFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.27);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / VIRTUAL_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.thumbFrame}>
      <div
        className={styles.thumbInner}
        style={{ width: VIRTUAL_W, height: VIRTUAL_H, transform: `scale(${scale})` }}
        aria-hidden="true"
        // inert: no focus/clicks inside the preview. Spread keeps this
        // compiling regardless of which @types/react version you have.
        {...{ inert: true }}
      >
        {children}
      </div>
    </div>
  );
}
