import { cn } from "../../utils/cn";

// Pas de photo de profil : des initiales sur une teinte stable propre à chaque membre
const TONES = [
  "bg-accent text-accent-ink",
  "bg-ink text-paper",
  "bg-[#7a5c3e] text-white",
  "bg-[#3f5a4c] text-white",
  "bg-[#4a4e69] text-white",
  "bg-[#8d6a9f] text-white",
];

const hash = (text: string) => Array.from(text).reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);

const initials = (name: string) =>
  name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const Avatar = ({ name, id, size = "md", className }: { name: string; id?: string | null; size?: "sm" | "md" | "lg" | "xl"; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold",
      TONES[hash(id ?? name) % TONES.length],
      size === "sm" && "h-8 w-8 text-xs",
      size === "md" && "h-11 w-11 text-sm",
      size === "lg" && "h-14 w-14 text-lg",
      size === "xl" && "h-24 w-24 font-display text-3xl",
      className
    )}
  >
    {initials(name)}
  </span>
);

export default Avatar;
