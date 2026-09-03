"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BookOpen, CalendarDays, CheckSquare, FileText, Gauge, GraduationCap, LayoutDashboard, Settings, Sparkles, UserRound } from "lucide-react";

const groups: { label: string; links: { label: string; href: string; icon: LucideIcon }[] }[] = [
  {
    label: "Workspace",
    links: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Courses", href: "/courses", icon: GraduationCap },
      { label: "Assignments", href: "/assignments", icon: BookOpen },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "Study",
    links: [
      { label: "Calendar", href: "/calendar", icon: CalendarDays },
      { label: "Notes", href: "/notes", icon: FileText },
      { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
      { label: "Progress", href: "/progress", icon: Gauge },
    ],
  },
  {
    label: "Account",
    links: [
      { label: "Profile", href: "/profile", icon: UserRound },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="flex gap-1 lg:block">
      {groups.map((group) => (
        <div key={group.label} className="flex shrink-0 gap-1 lg:mb-6 lg:block">
          <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:block">{group.label}</p>
          {group.links.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
