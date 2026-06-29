import { Layout } from "@/components/layout";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ImageIcon, Edit3, BarChart, Reply, Clock, TrendingUp, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  const stats = [
    { label: "Posts", value: summary?.totalPosts, icon: MessageSquare, color: "bg-blue-500/10 text-blue-500" },
    { label: "Images", value: summary?.imagesGenerated, icon: ImageIcon, color: "bg-indigo-500/10 text-indigo-500" },
    { label: "Captions", value: summary?.captionsGenerated, icon: Edit3, color: "bg-primary/10 text-primary" },
    { label: "Audits", value: summary?.auditsRun, icon: BarChart, color: "bg-green-500/10 text-green-500" },
    { label: "Replies", value: summary?.repliesGenerated, icon: Reply, color: "bg-orange-500/10 text-orange-500" },
  ];

  const quickActions = [
    { label: "Image Gen", icon: ImageIcon, href: "/image-generator" },
    { label: "Social", icon: MessageSquare, href: "/social-posts" },
    { label: "Audit", icon: BarChart, href: "/business-audit" },
    { label: "Reviews", icon: Reply, href: "/review-replies" },
  ];

  return (
    <Layout>
      <div className="space-y-5 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Namaste!</h1>
          <p className="text-muted-foreground mt-1 text-sm">Let's grow your dhandha today.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <a key={action.href} href={action.href} className="flex flex-col items-center gap-2 p-3 bg-card border border-border/60 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </a>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2">
          {stats.map((stat, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-3 flex flex-col items-center text-center">
                <div className={`p-1.5 rounded-lg mb-1.5 ${stat.color}`}>
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-lg font-bold leading-none">
                  {isLoading ? <Skeleton className="h-5 w-5 inline-block" /> : stat.value || 0}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1 leading-none">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </h2>
            {summary?.recentActivity?.length ? (
              <span className="text-xs text-muted-foreground">{summary.recentActivity.length} items</span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : summary?.recentActivity?.length ? (
            <div className="space-y-2">
              {summary.recentActivity.map((activity, i) => (
                <Card key={i} className="border-border/60">
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full shrink-0">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {new Date(activity.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/60">
              <CardContent className="p-6 text-center text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activity yet. Start growing!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
