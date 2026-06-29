import { Link, useLocation } from "wouter";
import { LayoutDashboard, Image as ImageIcon, MessageSquare, PartyPopper, BarChart3, Search, Users, Star } from "lucide-react";
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

  return (
    <div className="min-h-screen flex bg-background w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-lg">Dh</span>
            Dhandha AI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border mt-auto">
          <div className="bg-secondary/10 rounded-lg p-4 text-sm">
            <p className="font-medium text-secondary">Pro Plan Active</p>
            <p className="text-muted-foreground mt-1 mb-3 text-xs">You are growing your dhandha.</p>
            <Button variant="secondary" size="sm" className="w-full">Upgrade</Button>
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
