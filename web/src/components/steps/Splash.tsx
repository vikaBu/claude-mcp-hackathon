import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import "@/components/ui/8bit/styles/retro.css";

interface SplashProps {
  onStart: () => void;
}

/* Deterministic pixel-star positions scattered across the card */
const STARS: { x: number; y: number; color: string; delay: string; size: number }[] = [
  { x: 6, y: 8, color: "bg-primary", delay: "0s", size: 2 },
  { x: 88, y: 6, color: "bg-primary/60", delay: "0.6s", size: 2 },
  { x: 22, y: 18, color: "bg-primary/40", delay: "1.3s", size: 1 },
  { x: 74, y: 12, color: "bg-blue-400/50", delay: "0.9s", size: 2 },
  { x: 48, y: 5, color: "bg-primary/50", delay: "1.6s", size: 1 },
  { x: 93, y: 22, color: "bg-blue-400/30", delay: "0.4s", size: 2 },
  { x: 12, y: 30, color: "bg-primary/30", delay: "2.1s", size: 1 },
  { x: 62, y: 10, color: "bg-primary/40", delay: "1.8s", size: 2 },
  { x: 35, y: 24, color: "bg-blue-400/40", delay: "0.7s", size: 1 },
  { x: 80, y: 28, color: "bg-primary/50", delay: "1.2s", size: 2 },
  { x: 52, y: 20, color: "bg-blue-400/20", delay: "2.4s", size: 1 },
  { x: 18, y: 14, color: "bg-primary/20", delay: "1.0s", size: 2 },
];

/* Heights (in 4px units) for pixel buildings along the bottom */
const SKYLINE = [
  2, 4, 3, 6, 5, 2, 7, 4, 3, 5, 8, 6, 4, 2, 5, 7, 3, 4, 6, 2, 5, 3, 4, 6, 2, 4, 7, 5, 3,
];

export function Splash({ onStart }: SplashProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <Card className="w-full overflow-hidden">
        <CardContent className="relative flex flex-col items-center gap-5 py-10 px-4 min-h-[320px]">
          {/* Pixel grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />

          {/* CRT scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--color-foreground) 2px, var(--color-foreground) 3px)",
            }}
          />

          {/* Twinkling pixel stars */}
          {STARS.map((star, i) => (
            <div
              key={i}
              className={`absolute rounded-none ${star.color} animate-pulse pointer-events-none`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size * 3}px`,
                height: `${star.size * 3}px`,
                animationDelay: star.delay,
                animationDuration: "2.5s",
              }}
            />
          ))}

          {/* Foreground content */}
          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Bouncing food emojis */}
            <div className="flex gap-1 mb-2">
              {[..."🍕🍜🌮🍣🍛"].map((e, i) => (
                <span
                  key={i}
                  className="text-2xl pixelated animate-bounce"
                  style={{ animationDelay: `${i * 120}ms`, animationDuration: "1.5s" }}
                >
                  {e}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="retro text-xl text-primary text-center leading-relaxed drop-shadow-[0_0_12px_rgba(250,204,21,0.35)]">
              Let's meet up!
            </h1>

            {/* Subtitle */}
            <p className="retro text-[9px] text-muted-foreground text-center leading-relaxed max-w-xs">
              Pick your crew, find a time, choose a spot, and send the invites
            </p>

            {/* Pixel divider */}
            <div className="flex gap-0.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 ${i % 2 === 0 ? "bg-primary" : "bg-primary/30"}`}
                />
              ))}
            </div>

            <Button onClick={onStart} size="lg" className="text-sm px-8">
              Start Planning
            </Button>
          </div>

          {/* Pixel cityscape silhouette */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] px-1 opacity-15 pointer-events-none">
            {SKYLINE.map((height, i) => (
              <div
                key={i}
                className="bg-primary flex-1"
                style={{ height: `${height * 4}px`, maxWidth: "14px" }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
