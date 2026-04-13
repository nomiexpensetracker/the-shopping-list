import { ArrowIcon } from "@/components/icons";
import type { ListRegistryEntry } from "@/types/dto";

interface MyListsSectionProps {
  myLists: ListRegistryEntry[];
  onNavigateToList: (id: string) => void;
}

export default function MyListsSection({
  myLists,
  onNavigateToList,
}: MyListsSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          My Lists
        </p>
      </div>

      {myLists.length === 0 ? (
        <div
          className="rounded-2xl px-5 py-8 text-center flex flex-col items-center gap-2"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            No lists yet.
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Create a list to plan your shopping trips and reuse it every time.
          </p>
        </div>
      ) : (
        <div
          className="flex flex-col rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {myLists.map((list, idx) => (
            <button
              key={list.id}
              onClick={() => onNavigateToList(list.id)}
              className="w-full flex items-center justify-between px-4 py-4 text-left"
              style={{
                background: "var(--card)",
                borderBottom: idx < myLists.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span
                className="font-semibold text-base truncate"
                style={{ color: "var(--foreground)" }}
              >
                {list.name}
              </span>
              <ArrowIcon fill="var(--foreground)" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
