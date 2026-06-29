import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuditBusiness } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AuditResult = {
  score: number;
  breakdown: { profile: number; reviews: number; media: number; seo: number };
  recommendations: { title: string; description: string; priority: "high" | "medium" | "low" }[];
};

const priorityConfig = {
  high: { color: "text-red-500 bg-red-50 border-red-200", icon: XCircle, label: "High Priority" },
  medium: { color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: AlertTriangle, label: "Medium Priority" },
  low: { color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle, label: "Low Priority" },
};

export default function BusinessAudit() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    city: "",
    website: "",
    hasPhotos: false,
    hasHours: false,
    hasDescription: false,
    reviewCount: 0,
    averageRating: "",
  });
  const [result, setResult] = useState<AuditResult | null>(null);

  const auditMutation = useAuditBusiness();

  const handleAudit = () => {
    if (!form.businessName || !form.category || !form.city) {
      toast({ title: "Fill in required fields", variant: "destructive" });
      return;
    }
    auditMutation.mutate(
      {
        data: {
          businessName: form.businessName,
          category: form.category,
          city: form.city,
          website: form.website || null,
          hasPhotos: form.hasPhotos,
          hasHours: form.hasHours,
          hasDescription: form.hasDescription,
          reviewCount: Number(form.reviewCount),
          averageRating: form.averageRating ? Number(form.averageRating) : null,
        },
      },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Audit complete!", description: `Your score: ${data.score}/100` });
        },
        onError: () => toast({ title: "Audit failed", variant: "destructive" }),
      }
    );
  };

  const scoreColor = result
    ? result.score >= 70
      ? "text-green-600"
      : result.score >= 40
      ? "text-yellow-600"
      : "text-red-600"
    : "";

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Google Business Audit</h1>
          <p className="text-muted-foreground mt-2">Get your business profile score and actionable recommendations to rank higher on Google Maps.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Tell us about your business profile to get your score.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Business Name *</Label>
                  <Input data-testid="input-business-name" placeholder="e.g. Sharma Electronics" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Input data-testid="input-category" placeholder="e.g. Electronics Store" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input data-testid="input-city" placeholder="e.g. Mumbai" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input data-testid="input-website" placeholder="https://yourbusiness.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Review Count</Label>
                    <Input data-testid="input-reviews" type="number" min={0} placeholder="0" value={form.reviewCount} onChange={(e) => setForm({ ...form, reviewCount: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg Rating (1-5)</Label>
                    <Input data-testid="input-rating" type="number" step="0.1" min={1} max={5} placeholder="4.5" value={form.averageRating} onChange={(e) => setForm({ ...form, averageRating: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium">Profile completeness</p>
                {[
                  { field: "hasPhotos", label: "Business photos uploaded" },
                  { field: "hasHours", label: "Business hours set" },
                  { field: "hasDescription", label: "Business description added" },
                ].map(({ field, label }) => (
                  <div key={field} className="flex items-center gap-3">
                    <Checkbox
                      id={field}
                      data-testid={`checkbox-${field}`}
                      checked={form[field as keyof typeof form] as boolean}
                      onCheckedChange={(v) => setForm({ ...form, [field]: !!v })}
                    />
                    <Label htmlFor={field} className="font-normal cursor-pointer">{label}</Label>
                  </div>
                ))}
              </div>

              <Button data-testid="button-audit" className="w-full" onClick={handleAudit} disabled={auditMutation.isPending}>
                <BarChart3 className="h-4 w-4 mr-2" />
                {auditMutation.isPending ? "Auditing..." : "Run Audit"}
              </Button>
            </CardContent>
          </Card>

          {result ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Your Google Score</p>
                  <p className={`text-7xl font-bold ${scoreColor}`}>{result.score}</p>
                  <p className="text-muted-foreground text-sm mt-1">out of 100</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Score Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium">{key}</span>
                        <span className="text-muted-foreground">{value}/100</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Recommendations</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {result.recommendations.map((rec, i) => {
                    const cfg = priorityConfig[rec.priority];
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${cfg.color}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 shrink-0" />
                          <p className="font-medium text-sm">{rec.title}</p>
                        </div>
                        <p className="text-xs ml-6">{rec.description}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
              <BarChart3 className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Your audit results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
