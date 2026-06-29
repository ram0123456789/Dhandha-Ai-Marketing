import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGetSeoKeywords } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type KeywordResult = {
  keywords: { keyword: string; intent: string; difficulty: string }[];
};

const intentColor: Record<string, string> = {
  local: "bg-blue-100 text-blue-700 border-blue-200",
  informational: "bg-purple-100 text-purple-700 border-purple-200",
  transactional: "bg-green-100 text-green-700 border-green-200",
};

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hard: "bg-red-100 text-red-700 border-red-200",
};

export default function SeoKeywords() {
  const { toast } = useToast();
  const [form, setForm] = useState({ businessName: "", category: "", city: "" });
  const [result, setResult] = useState<KeywordResult | null>(null);

  const keywordMutation = useGetSeoKeywords();

  const handleGenerate = () => {
    if (!form.businessName || !form.category || !form.city) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }
    keywordMutation.mutate(
      { data: form },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: `${data.keywords.length} keywords found!` });
        },
        onError: () => toast({ title: "Failed to get keywords", variant: "destructive" }),
      }
    );
  };

  const copyAll = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.keywords.map((k) => k.keyword).join("\n"));
    toast({ title: "All keywords copied!" });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Keywords</h1>
          <p className="text-muted-foreground mt-2">Discover targeted keywords to rank higher on Google and attract more local customers.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find Your Keywords</CardTitle>
            <CardDescription>Enter your business details to get targeted SEO keywords.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label>Business Name</Label>
                <Input data-testid="input-business-name" placeholder="e.g. Gupta Pharmacy" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Category</Label>
                <Input data-testid="input-category" placeholder="e.g. Pharmacy, Bakery, Gym" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="flex-1 space-y-2">
                <Label>City</Label>
                <Input data-testid="input-city" placeholder="e.g. Pune" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="flex items-end">
                <Button data-testid="button-search" onClick={handleGenerate} disabled={keywordMutation.isPending} className="whitespace-nowrap">
                  <Search className="h-4 w-4 mr-2" />
                  {keywordMutation.isPending ? "Searching..." : "Find Keywords"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Keyword Results</CardTitle>
                <Button variant="outline" size="sm" onClick={copyAll}>
                  <Copy className="h-4 w-4 mr-2" />Copy All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Keyword</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Intent</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Difficulty</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.keywords.map((kw, i) => (
                      <tr key={i} data-testid={`row-keyword-${i}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 font-medium">{kw.keyword}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${intentColor[kw.intent]}`}>
                            {kw.intent}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${difficultyColor[kw.difficulty]}`}>
                            {kw.difficulty}
                          </span>
                        </td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            data-testid={`button-copy-kw-${i}`}
                            onClick={() => { navigator.clipboard.writeText(kw.keyword); toast({ title: "Copied!" }); }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
