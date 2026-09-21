"use client";

import { useEffect, useRef } from "react";
import { signOut } from "@/app/actions";
import MySide from "./my-side";

type Props = { name: string; pen: string; pin: string };

export default function AccountMenu({ name, pen, pin }: Props) {
  const ref = useRef<HTMLDetailsElement>(null);

  // Close on outside click or Escape, like a normal menu.
  useEffect(() => {
    const close = (e: Event) => {
      const el = ref.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  return (
    <details ref={ref} className="relative">
      <summary
        className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full border-[3px] border-polaroid text-lg font-extrabold text-white shadow-md"
        style={{ background: pin }}
        aria-label="Your settings"
      >
        {name.trim().charAt(0).toUpperCase() || "?"}
      </summary>
      <div className="menu-panel absolute right-0 z-30 mt-2 w-72 rounded-3xl bg-polaroid p-5">
        <p className="text-sm text-ink-soft">Signed in as</p>
        <p className="text-lg font-bold">{name}</p>
        <hr className="my-4 border-line" />
        <MySide pen={pen} pin={pin} name={name} />
        <hr className="my-4 border-line" />
        <form action={signOut}>
          <button className="btn-quiet text-sm">Sign out</button>
        </form>
      </div>
    </details>
  );
}
