import type { Contact } from "@/types/meetup";
import { ARCHETYPE_LABEL, ARCHETYPE_DESCRIPTION } from "@/types/meetup";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Checkbox } from "@/components/ui/8bit/checkbox";

interface SelectContactsProps {
  contacts: Contact[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}

export function SelectContacts({
  contacts,
  selectedIds,
  onToggle,
  onNext,
}: SelectContactsProps) {
  const canProceed = selectedIds.length >= 2;

  return (
    <div className="flex flex-col gap-3">
      <p className="retro text-[10px] text-muted-foreground">
        Select 2+ people to meet up with
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contacts.map((contact) => {
          const isSelected = selectedIds.includes(contact.id);
          return (
            <Card
              key={contact.id}
              font="normal"
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "!border-primary bg-primary/10"
                  : "hover:!border-muted-foreground"
              }`}
              onClick={() => onToggle(contact.id)}
            >
              <CardContent font="normal" className="p-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    className="mt-0.5"
                    font="normal"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">
                        {contact.name}
                      </span>
                      {contact.archetype && (
                        <Badge
                          font="retro"
                          className="text-[8px] bg-primary/20 text-primary border-primary/40"
                          title={ARCHETYPE_DESCRIPTION[contact.archetype]}
                        >
                          {ARCHETYPE_LABEL[contact.archetype]}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {contact.phone}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {contact.cuisinePreferences.map((c) => (
                        <Badge
                          key={c}
                          variant="secondary"
                          font="normal"
                          className="text-[9px] bg-blue-500/20 text-blue-300 border-blue-500/30"
                        >
                          {c}
                        </Badge>
                      ))}
                      {contact.dietaryRestrictions.map((r) => (
                        <Badge
                          key={r}
                          variant="secondary"
                          font="normal"
                          className="text-[9px] bg-orange-500/20 text-orange-300 border-orange-500/30"
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={onNext}
        disabled={!canProceed}
        variant={canProceed ? "default" : "secondary"}
        className="w-full text-xs"
        size="lg"
      >
        {canProceed
          ? `Next: Pick a Time (${selectedIds.length} selected)`
          : "Select at least 2 contacts"}
      </Button>
    </div>
  );
}
