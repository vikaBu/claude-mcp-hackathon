import type { Restaurant } from "@/types/meetup";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";

const CUISINE_ICON: Record<string, string> = {
  Japanese: "\u{1F363}",
  Mexican: "\u{1F32E}",
  Indian: "\u{1F35B}",
  Italian: "\u{1F355}",
  Thai: "\u{1F962}",
  Korean: "\u{1F372}",
  Chinese: "\u{1F961}",
  American: "\u{1F354}",
  French: "\u{1F950}",
  Mediterranean: "\u{1F957}",
  Vietnamese: "\u{1F35C}",
};

function cuisineIcon(cuisine: string): string {
  return CUISINE_ICON[cuisine] ?? "\u{1F37D}\u{FE0F}";
}

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
    <span className="text-primary text-xs tracking-wider">
      {"*".repeat(full)}
      {half ? "." : ""}
      <span className="text-muted-foreground">
        {"*".repeat(5 - full - (half ? 1 : 0))}
      </span>
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
      <p className="retro text-[10px] text-muted-foreground">
        Choose a restaurant (sorted by group match)
      </p>

      <div className="flex flex-col gap-2">
        {restaurants.map((restaurant) => {
          const isSelected = selectedId === restaurant.id;
          return (
            <Card
              key={restaurant.id}
              font="normal"
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "!border-primary bg-primary/10"
                  : "hover:!border-muted-foreground"
              }`}
              onClick={() => onSelect(restaurant.id)}
            >
              <CardContent font="normal" className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl leading-none mt-0.5 pixelated" aria-hidden="true">
                    {cuisineIcon(restaurant.cuisine)}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-foreground">
                      {restaurant.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        font="normal"
                        className="text-[9px] bg-purple-500/20 text-purple-300 border-purple-500/30"
                      >
                        {restaurant.cuisine}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {restaurant.priceRange}
                      </span>
                      <Stars rating={restaurant.rating} />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {restaurant.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          font="normal"
                          className="text-[9px] bg-muted text-muted-foreground border-border"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {restaurant.matchScore > 0 && (
                    <Badge
                      font="retro"
                      className="text-[8px] bg-green-500/20 text-green-300 border-green-500/30 flex-shrink-0"
                    >
                      {restaurant.matchScore} match
                      {restaurant.matchScore > 1 ? "es" : ""}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 text-xs"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedId}
          variant={selectedId ? "default" : "secondary"}
          className="flex-1 text-xs"
        >
          Next: Review & Send
        </Button>
      </div>
    </div>
  );
}
