import { Layout } from "@/components/layout";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, ImageIcon, Edit3, BarChart, Reply, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  const stats = [
    { label: "Total Posts", value: summary?.totalPosts, icon: MessageSquare, color: "text-blue-500" },
    { label: "Images Generated", value: summary?.imagesGenerated, icon: ImageIcon, color: "text-indigo-500" },
    { label: "Captions Made", value: summary?.captionsGenerated, icon: Edit3, color: "text-primary" },
    { label: "Audits Run", value: summary?.auditsRun, icon: BarChart, color: "text-green-500" },
    { label: "Replies Generated", value: summary?.repliesGenerated, icon: Reply, color: "text-orange-500" },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in zoom-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Namaste! Let's grow your business.</h1>
          <p className="text-muted-foreground mt-2 text-lg">Here is your marketing overview for today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <div className="mt-2 flex items-baseline text-3xl font-bold">
                      {isLoading ? <Skeleton className="h-8 w-16" /> : stat.value || 0}
                    </div>
                  </div>
                  <div className={`p-3 bg-muted rounded-full ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : summary?.recentActivity?.length ? (
              <div className="divide-y divide-border">
                {summary.recentActivity.map((activity, i) => (
                  <div key={i} className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-full text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.type}</p>
                      <p className="text-muted-foreground text-sm mt-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(activity.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <p>No recent activity. Start generating some content!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
