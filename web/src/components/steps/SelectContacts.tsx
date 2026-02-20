import type { Contact } from "@/types/meetup";

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
      <p className="text-xs text-zinc-400 font-heading">
        Select 2+ people to meet up with
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {contacts.map((contact) => {
          const isSelected = selectedIds.includes(contact.id);
          return (
            <button
              key={contact.id}
              onClick={() => onToggle(contact.id)}
              className={`
                text-left p-3 border-2 transition-colors cursor-pointer
                ${
                  isSelected
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    w-5 h-5 border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5
                    ${isSelected ? "border-yellow-400 bg-yellow-400/20 text-yellow-300" : "border-zinc-600"}
                  `}
                >
                  {isSelected ? "+" : ""}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{contact.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {contact.phone}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {contact.cuisinePreferences.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      >
                        {c}
                      </span>
                    ))}
                    {contact.dietaryRestrictions.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`
          w-full py-2.5 font-heading text-xs border-2 transition-colors
          ${
            canProceed
              ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 cursor-pointer"
              : "border-zinc-700 bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
          }
        `}
      >
        {canProceed
          ? `Next: Pick a Time (${selectedIds.length} selected)`
          : `Select at least 2 contacts`}
      </button>
    </div>
  );
}
