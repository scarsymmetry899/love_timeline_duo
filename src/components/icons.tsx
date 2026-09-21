// Small inline icons, stroked in the current text colour.
type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  viewBox: "0 0 24 24",
};

export const PlusIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const LockIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const HeartIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
);
export const PinIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 21s-6-5.4-6-11a6 6 0 0 1 12 0c0 5.6-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></svg>
);
export const CameraIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
);
export const MusicIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>
);
export const LinkIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);
export const ArrowLeftIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const TrashIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
);
export const PencilIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M14 7l3 3" /></svg>
);
export const CloseIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
