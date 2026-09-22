"use client";

import { useEffect } from "react";

/**
 * One shared scroll loop for the landing page.
 * Every element with [data-act] gets --p (0..1): how far the reader has
 * scrolled through that act's pinned travel. CSS does the rest.
 * Under reduced motion nothing is written, and CSS shows static compositions.
 */
export function useScrollActs() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reduce.matches) return;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-act]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const travel = Math.max(r.height - vh, 1);
        const p = Math.min(1, Math.max(0, -r.top / travel));
        const rounded = Math.round(p * 1000) / 1000;
        if (el.style.getPropertyValue("--p") !== String(rounded)) el.style.setProperty("--p", String(rounded));
      });
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    reduce.addEventListener("change", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      reduce.removeEventListener("change", request);
    };
  }, []);
}
