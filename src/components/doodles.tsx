// Hand-drawn margin doodles and washi tape, purely decorative.

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DOODLES = [
  // heart
  <path key="h" {...stroke} d="M20 34s-13-8-13-17a7 7 0 0 1 13-4 7 7 0 0 1 13 4c0 9-13 17-13 17z" />,
  // sparkle
  <path key="s" {...stroke} d="M20 4c1 9 5 13 14 16-9 3-13 7-14 16-1-9-5-13-14-16 9-3 13-7 14-16z" />,
  // sprig
  <g key="l" {...stroke}><path d="M8 36C16 26 22 16 32 6" /><path d="M14 28c-5-1-8-4-8-8 5 0 8 3 8 8zM20 20c-1-5 0-9 4-11 2 4 0 8-4 11zM20 20c5 1 8 4 8 8-5 0-8-3-8-8z" /></g>,
  // flower
  <g key="f" {...stroke}>
    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="20" cy="11" rx="4.5" ry="6.5" transform={`rotate(${a} 20 20)`} />)}
    <circle cx="20" cy="20" r="3.5" />
  </g>,
  // swirl
  <path key="w" {...stroke} d="M6 30c10 4 22-2 22-12 0-6-5-10-10-8s-5 9 0 10 8-3 7-6" />,
  // star
  <path key="t" {...stroke} d="M20 5l4.5 9.5 10 1.2-7.4 7 2 10L20 28l-9.1 4.7 2-10-7.4-7 10-1.2z" />,
];

export function Doodle({ i, className = "" }: { i: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`doodle ${className}`} aria-hidden="true">
      {DOODLES[i % DOODLES.length]}
    </svg>
  );
}

const TAPES = ["tape-rose", "tape-mint", "tape-sky", "tape-butter"];

export function Tape({ i = 0, className = "" }: { i?: number; className?: string }) {
  return <span className={`tape ${TAPES[i % TAPES.length]} ${className}`} aria-hidden="true" />;
}
