import { cn } from "@/lib/utils";

// A very soft light behind the current page's name: three stacked rounded
// boxes, each larger and fainter than the last, under a frosted layer.
const LAYERS = [
  { spread: "-inset-x-3 -inset-y-1", strength: 4, blur: 10 },
  { spread: "-inset-x-5 -inset-y-2", strength: 2.5, blur: 16 },
  { spread: "-inset-x-8 -inset-y-3.5", strength: 1.5, blur: 24 },
];

export function ActiveGlow({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      {LAYERS.map(({ spread, strength, blur }) => (
        <span
          key={spread}
          className={cn("absolute rounded-2xl", spread)}
          style={{
            background: `color-mix(in oklab, var(--foreground) ${strength}%, transparent)`,
            filter: `blur(${blur}px)`,
          }}
        />
      ))}
      <span className="absolute -inset-x-4 -inset-y-1.5 rounded-2xl backdrop-blur-md" />
    </span>
  );
}
