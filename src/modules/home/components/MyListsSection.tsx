import type { ListRegistryEntry } from "@/types/dto";

interface MyListsSectionProps {
  myLists: ListRegistryEntry[];
  onNavigateToList: (id: string) => void;
  onOpenNewListModal: () => void;
}

export default function MyListsSection({
  myLists,
  onNavigateToList,
  onOpenNewListModal,
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
        <button
          onClick={onOpenNewListModal}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
          style={{ background: "var(--brand)" }}
        >
          + New List
        </button>
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
        <div className="flex flex-col gap-2">
          {myLists.map((list) => (
            <button
              key={list.id}
              onClick={() => onNavigateToList(list.id)}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl text-left"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <span
                className="font-semibold text-base truncate"
                style={{ color: "var(--foreground)" }}
              >
                {list.name}
              </span>
              <span className="text-lg shrink-0 ml-2" style={{ color: "var(--brand)" }}>
                →
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
