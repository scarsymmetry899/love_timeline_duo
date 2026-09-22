// Stored values stay as they are in the database; the UI shows a deeper shade
// of the same hue so each pin reads at 3:1 or better on the polaroid surface.
export const PINS = [
  { value: "#F44336", name: "Red", display: "#D32F2F" },
  { value: "#FF4081", name: "Pink", display: "#D81B60" },
  { value: "#FB8C00", name: "Orange", display: "#E65100" },
  { value: "#7CB342", name: "Green", display: "#558B2F" },
  { value: "#1E88E5", name: "Blue", display: "#1565C0" },
  { value: "#7E57C2", name: "Purple", display: "#6A3FB5" },
] as const;

export function pinDisplay(value: string | null | undefined) {
  return PINS.find((p) => p.value.toLowerCase() === (value ?? "").toLowerCase())?.display ?? "#705845";
}

export const penClass = (pen?: string | null) => (pen === "dancing" ? "hand-dancing" : "hand-caveat");

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Thu, 2 January 2025". Deterministic, so server and browser render the same text. */
export function formatDay(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  const weekday = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${d} ${MONTHS[m - 1]} ${y}`;
}
