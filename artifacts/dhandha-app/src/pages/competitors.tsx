import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAnalyzeCompetitors } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CompetitorResult = {
  insights: { title: string; description: string }[];
  opportunities: string[];
  threats: string[];
};

export default function Competitors() {
  const { toast } = useToast();
  const [form, setForm] = useState({ businessName: "", category: "", city: "" });
  const [result, setResult] = useState<CompetitorResult | null>(null);

  const competitorMutation = useAnalyzeCompetitors();

  const handleAnalyze = () => {
    if (!form.businessName || !form.category || !form.city) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }
    competitorMutation.mutate(
      { data: form },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Analysis complete!" });
        },
        onError: () => toast({ title: "Analysis failed", variant: "destructive" }),
      }
    );
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitor Analysis</h1>
          <p className="text-muted-foreground mt-2">Understand your market, discover opportunities, and stay ahead of competitors.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analyze Your Market</CardTitle>
            <CardDescription>Enter your business information to get competitor insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label>Business Name</Label>
                <Input data-testid="input-business-name" placeholder="e.g. Mehta Mobile Store" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Category</Label>
                <Input data-testid="input-category" placeholder="e.g. Mobile Store, Restaurant" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="flex-1 space-y-2">
                <Label>City</Label>
                <Input data-testid="input-city" placeholder="e.g. Ahmedabad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="flex items-end">
                <Button data-testid="button-analyze" onClick={handleAnalyze} disabled={competitorMutation.isPending} className="whitespace-nowrap">
                  <Users className="h-4 w-4 mr-2" />
                  {competitorMutation.isPending ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {result ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />Market Insights
              </h2>
              {result.insights.map((insight, i) => (
                <Card key={i} data-testid={`card-insight-${i}`} className="border-primary/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{insight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />Opportunities
                </h2>
                <div className="space-y-2">
                  {result.opportunities.map((opp, i) => (
                    <div key={i} data-testid={`text-opportunity-${i}`} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                      <p className="text-sm text-green-800">{opp}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />Threats
                </h2>
                <div className="space-y-2">
                  {result.threats.map((threat, i) => (
                    <div key={i} data-testid={`text-threat-${i}`} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <p className="text-sm text-red-800">{threat}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : !competitorMutation.isPending && (
          <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
            <Users className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Competitor analysis will appear here</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
