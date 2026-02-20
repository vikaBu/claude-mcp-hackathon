import type { Restaurant } from "@/types/meetup";

interface PickRestaurantProps {
  restaurants: (Restaurant & { matchScore: number })[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-yellow-400 text-xs tracking-wider">
      {"*".repeat(full)}
      {half ? "." : ""}
      <span className="text-zinc-600">{"*".repeat(5 - full - (half ? 1 : 0))}</span>
    </span>
  );
}

export function PickRestaurant({
  restaurants,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: PickRestaurantProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-400 font-heading">
        Choose a restaurant (sorted by group match)
      </p>

      <div className="flex flex-col gap-2">
        {restaurants.map((restaurant) => {
          const isSelected = selectedId === restaurant.id;
          return (
            <button
              key={restaurant.id}
              onClick={() => onSelect(restaurant.id)}
              className={`
                text-left p-3 border-2 transition-colors cursor-pointer
                ${
                  isSelected
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-bold text-sm">{restaurant.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {restaurant.cuisine}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {restaurant.priceRange}
                    </span>
                    <Stars rating={restaurant.rating} />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {restaurant.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 bg-zinc-700/50 text-zinc-400 border border-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {restaurant.matchScore > 0 && (
                  <span className="text-[10px] px-2 py-1 border border-green-500/30 bg-green-500/20 text-green-300 flex-shrink-0">
                    {restaurant.matchScore} match{restaurant.matchScore > 1 ? "es" : ""}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 font-heading text-xs border-2 border-zinc-600 text-zinc-400 hover:border-zinc-500 cursor-pointer transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedId}
          className={`
            flex-1 py-2.5 font-heading text-xs border-2 transition-colors
            ${
              selectedId
                ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 cursor-pointer"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
            }
          `}
        >
          Next: Review & Send
        </button>
      </div>
    </div>
  );
}
