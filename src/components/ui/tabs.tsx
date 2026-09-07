"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export function Tabs({ items, ariaLabel = "Tabs" }: { items: TabItem[]; ariaLabel?: string }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const instanceId = useId();

  if (items.length === 0) return null;

  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const activeItem = items[activeIndex] ?? items[0];
  const tabListId = `${instanceId}-tablist`;

  function selectTab(index: number) {
    const nextIndex = (index + items.length) % items.length;
    setActiveId(items[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab(items.length - 1);
    }
  }

  return <div>
    <div id={tabListId} className="-mx-1 flex max-w-full gap-1 overflow-x-auto border-b border-[var(--line)] px-1 [scrollbar-width:none]" role="tablist" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const tabId = `${instanceId}-tab-${item.id}`;
        const panelId = `${instanceId}-panel-${item.id}`;
        const selected = item.id === activeItem.id;
        return <button
          key={item.id}
          ref={(element) => { tabRefs.current[index] = element; }}
          id={tabId}
          type="button"
          role="tab"
          aria-selected={selected}
          aria-controls={panelId}
          tabIndex={selected ? 0 : -1}
          onClick={() => setActiveId(item.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className={`relative shrink-0 rounded-t-md px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 ${selected ? "text-blue-700 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
        >{item.label}</button>;
      })}
    </div>
    <div
      id={`${instanceId}-panel-${activeItem.id}`}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby={`${instanceId}-tab-${activeItem.id}`}
      className="pt-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
    >{activeItem.content}</div>
  </div>;
}
