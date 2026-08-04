import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Dumbbell,
  History,
  Utensils,
  Ruler,
  User,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/history", label: "History", icon: History },
  { to: "/nutrition", label: "Nutrition", icon: Utensils },
  { to: "/measurements", label: "Body", icon: Ruler },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 md:pl-64">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:pl-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Bollywood Body</h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">100 Day Tracker</p>
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Bollywood Body</h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">100 Day Tracker</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const active = currentPath === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="mx-auto max-w-5xl p-4 md:p-8">{children}</main>

      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-card md:hidden">
        <div className="grid h-16 grid-cols-6 items-center">
          {navItems.map((item) => {
            const active = currentPath === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium"
              >
                <item.icon
                  className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className={active ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
