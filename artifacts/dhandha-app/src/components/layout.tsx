import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Image as ImageIcon, MessageSquare, PartyPopper, BarChart3, Search, Users, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/image-generator", label: "Image Gen", icon: ImageIcon },
  { href: "/social-posts", label: "Social Posts", icon: MessageSquare },
  { href: "/festive-images", label: "Festive Images", icon: PartyPopper },
  { href: "/business-audit", label: "Biz Audit", icon: BarChart3 },
  { href: "/seo-keywords", label: "SEO Keywords", icon: Search },
  { href: "/competitors", label: "Competitors", icon: Users },
  { href: "/review-replies", label: "Review Replies", icon: Star },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-border bg-card flex flex-col transition-all duration-300 relative shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer border-2 border-background"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        <div className={cn("flex items-center", collapsed ? "p-3 justify-center" : "p-6")}>
          <span className="bg-primary text-primary-foreground p-1.5 rounded-lg text-lg font-bold shrink-0">Dh</span>
          {!collapsed && (
            <h1 className="text-2xl font-bold text-primary ml-2 truncate">Dhandha AI</h1>
          )}
        </div>

        <nav className={cn("flex-1 space-y-1", collapsed ? "px-2" : "px-4")}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={cn("border-t border-border mt-auto", collapsed ? "p-2" : "p-4")}>
          <div className={cn("bg-secondary/10 rounded-lg text-sm", collapsed ? "p-2 text-center" : "p-4")}>
            {!collapsed && (
              <>
                <p className="font-medium text-secondary">Pro Plan Active</p>
                <p className="text-muted-foreground mt-1 mb-3 text-xs">You are growing your dhandha.</p>
              </>
            )}
            <Button variant="secondary" size="sm" className={collapsed ? "w-full px-1" : "w-full"}>
              {collapsed ? <ChevronRight className="h-3 w-3" /> : "Upgrade"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-8 shrink-0">
          <h2 className="font-semibold text-lg">
            {NAV_ITEMS.find((i) => i.href === location)?.label || "Welcome"}
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
