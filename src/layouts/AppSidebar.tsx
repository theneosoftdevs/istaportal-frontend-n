import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import istaLogo from "@/assets/ista.jpeg";
import { i18n } from "@/lib/i18n";

interface AppSidebarProps {
  mode: "desktop" | "tablet";
}

export function AppSidebar({ mode }: AppSidebarProps) {
  const { nav, portal } = useApp();
  const isRail = mode === "tablet";

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-500 ease-in-out",
        isRail ? "w-[80px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border transition-all duration-500",
          isRail ? "px-2 justify-center" : "px-4 gap-3",
        )}
      >
        <img
          src={istaLogo}
          alt="Logo ISTA"
          className={cn(
            "shrink-0 rounded-lg object-cover shadow-md border border-sidebar-border bg-white p-0.5 transition-all duration-500",
            isRail ? "size-11" : "size-9",
          )}
        />
        {!isRail && (
          <div className="min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
            <p className="truncate text-sm font-black uppercase tracking-tighter text-sidebar-foreground">
              ISTA PORTAL
            </p>
            <p className="truncate text-[10px] font-bold uppercase tracking-widest text-primary">
              {portal?.role &&
                i18n.portals[portal.role as keyof typeof i18n.portals]}
            </p>
          </div>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 space-y-2 overflow-y-auto w-full",
          isRail ? "p-2 flex flex-col items-center" : "p-3",
        )}
      >
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isRail ? item.label : undefined}
            aria-label={isRail ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-xl transition-all duration-300",
                isRail ? "h-14 w-14 justify-center" : "px-3 py-2.5 gap-3",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary/20 ring-offset-2 ring-offset-sidebar"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon
              className={cn(
                "shrink-0 transition-transform duration-300",
                isRail ? "size-6" : "size-5",
              )}
            />
            {!isRail && (
              <span className="truncate text-xs font-bold uppercase tracking-widest">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className={cn(
          "border-t border-sidebar-border p-4 transition-all duration-300",
          isRail && "flex justify-center",
        )}
      >
        {!isRail ? (
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 animate-in fade-in duration-300">
            ISTA PORTAL · {new Date().getFullYear()}
          </p>
        ) : (
          <div className="size-2 rounded-full bg-primary/40 animate-pulse" />
        )}
      </div>
    </aside>
  );
}
