import type { MeetupMode } from "@/types/meetup";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import "@/components/ui/8bit/styles/retro.css";

interface SplashProps {
  onStart: () => void;
  mode: MeetupMode;
  onModeChange: (mode: MeetupMode) => void;
}

/* ═══════════════ Social mode background ═══════════════ */

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

const SKYLINE = [
  2, 4, 3, 6, 5, 2, 7, 4, 3, 5, 8, 6, 4, 2, 5, 7, 3, 4, 6, 2, 5, 3, 4, 6, 2, 4, 7, 5, 3,
];

/* ═══════════════ Work mode pixel-art suit ═══════════════ */

// Light palette so the suit is clearly visible against the dark (#18181b) card.
// 0=transparent 1=edge 2=suit 3=sleeve 4=shirt 5=tie 6=skin 7=accent
const SUIT_PALETTE = [
  "transparent",
  "#475569", // edge — silhouette definition
  "#64748b", // suit body — clearly lighter than card bg
  "#94a3b8", // sleeve — forearms
  "#f1f5f9", // shirt — near-white, high pop
  "#60a5fa", // tie — bright blue
  "#d4a574", // skin — hands
  "#facc15", // accent — pocket square & button (primary yellow)
];

// 26 wide × 22 tall — collar to midriff, crossed arms, pocket square
// prettier-ignore
const SUIT_ART: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,4,4,6,6,4,4,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,4,4,4,6,6,4,4,4,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,4,4,4,5,5,5,5,4,4,4,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,4,4,4,5,5,5,5,4,4,4,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,2,2,4,4,5,5,5,5,4,4,2,2,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,2,2,2,4,4,5,5,5,5,4,4,2,2,2,1,0,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,4,4,5,5,4,4,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,4,5,5,4,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,5,5,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,5,5,2,2,2,2,7,7,2,2,2,2,1,0],
  [1,2,2,2,2,2,2,2,2,2,2,2,5,5,2,2,2,2,2,2,2,2,2,2,2,1],
  [2,2,2,2,2,2,2,2,2,2,2,2,7,7,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,2,2,2],
  [2,2,1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,1,2,2],
  [2,1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,1,2],
  [2,2,1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,1,2,2],
  [2,2,2,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,2,2,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
  [0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
];

const PX = 20;

function SuitPixelArt() {
  const rows = SUIT_ART.length;
  const cols = SUIT_ART[0].length;
  return (
    <div
      className="pointer-events-none"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${PX}px)`,
        gridTemplateRows: `repeat(${rows}, ${PX}px)`,
        width: cols * PX,
        height: rows * PX,
      }}
    >
      {SUIT_ART.flat().map((c, i) => (
        <div
          key={i}
          style={{ backgroundColor: SUIT_PALETTE[c], width: PX, height: PX }}
        />
      ))}
    </div>
  );
}

/* ═══════════════ Shared ═══════════════ */

const SOCIAL_EMOJIS = "🍕🍜🌮🍣🍛";
const WORK_EMOJIS = "💼📋🤝📹🏢";

export function Splash({ onStart, mode, onModeChange }: SplashProps) {
  const isWork = mode === "work";

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <Card className="w-full overflow-hidden">
        <CardContent className="relative flex flex-col items-center gap-5 py-10 px-4 min-h-[320px]">

          {/* ─── Social: dark grid + scanlines + stars ─── */}
          {!isWork && (
            <>
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--color-foreground) 2px, var(--color-foreground) 3px)",
                }}
              />
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
            </>
          )}

          {/* ─── Work: spotlight + grid + large suit art ─── */}
          {isWork && (
            <>
              {/* Spotlight glow centred on the suit */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 45%, rgba(148,163,184,0.14) 0%, transparent 65%)",
                }}
              />
              {/* Subtle grid */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />
              {/* Suit pixel art — positioned from top so collar is visible */}
              <div
                className="absolute inset-x-0 top-0 flex justify-center pointer-events-none pt-2"
                style={{ opacity: 0.35 }}
              >
                <SuitPixelArt />
              </div>
            </>
          )}

          {/* ─── Foreground content ─── */}
          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="flex gap-1 mb-2">
              {[...(isWork ? WORK_EMOJIS : SOCIAL_EMOJIS)].map((e, i) => (
                <span
                  key={i}
                  className="text-2xl pixelated animate-bounce"
                  style={{ animationDelay: `${i * 120}ms`, animationDuration: "1.5s" }}
                >
                  {e}
                </span>
              ))}
            </div>

            <h1 className="retro text-xl text-primary text-center leading-relaxed drop-shadow-[0_0_12px_rgba(250,204,21,0.35)]">
              {isWork ? "Let's sync up!" : "Let's meet up!"}
            </h1>

            <p className="retro text-[9px] text-muted-foreground text-center leading-relaxed max-w-xs">
              {isWork
                ? "Pick your team, find a time, choose a venue, and send the invites"
                : "Pick your crew, find a time, choose a spot, and send the invites"}
            </p>

            {/* Mode toggle */}
            <div className="flex gap-0">
              <Button
                onClick={() => onModeChange("social")}
                variant={!isWork ? "default" : "outline"}
                className="text-[10px] px-4 rounded-r-none"
                size="sm"
              >
                Social
              </Button>
              <Button
                onClick={() => onModeChange("work")}
                variant={isWork ? "default" : "outline"}
                className="text-[10px] px-4 rounded-l-none"
                size="sm"
              >
                Work
              </Button>
            </div>

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

          {/* ─── Social: pixel cityscape at bottom ─── */}
          {!isWork && (
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] px-1 opacity-15 pointer-events-none">
              {SKYLINE.map((height, i) => (
                <div
                  key={i}
                  className="bg-primary flex-1"
                  style={{ height: `${height * 4}px`, maxWidth: "14px" }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
