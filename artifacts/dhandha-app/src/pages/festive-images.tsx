import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useGenerateFestiveImage, useGetImageStatus, getGetImageStatusQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PartyPopper, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OCCASIONS = [
  "Diwali", "Holi", "Republic Day", "Independence Day", "Navratri",
  "Eid", "Christmas", "New Year", "Dussehra", "Ganesh Chaturthi",
  "Raksha Bandhan", "Weekend Sale", "Grand Opening", "Anniversary Sale",
];

export default function FestiveImages() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    businessName: "",
    occasion: "Diwali",
    tagline: "",
    primaryColor: "",
  });
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const festiveMutation = useGenerateFestiveImage();

  const { data: statusData } = useGetImageStatus(requestId ?? "", {
    query: {
      enabled: !!requestId && isPolling,
      queryKey: getGetImageStatusQueryKey(requestId ?? ""),
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === "COMPLETED" || status === "FAILED" || status === "ERROR") return false;
        return 3000;
      },
    },
  });

  useEffect(() => {
    if (!statusData) return;
    if (statusData.status === "COMPLETED") {
      setIsPolling(false);
      toast({ title: "Festive image ready!", description: `Your ${form.occasion} image is done.` });
    } else if (statusData.status === "FAILED" || statusData.status === "ERROR") {
      setIsPolling(false);
      toast({ title: "Generation failed", variant: "destructive" });
    }
  }, [statusData?.status]);

  const handleGenerate = () => {
    if (!form.businessName || !form.occasion) {
      toast({ title: "Fill in all required fields", variant: "destructive" });
      return;
    }
    festiveMutation.mutate(
      {
        data: {
          businessName: form.businessName,
          occasion: form.occasion,
          tagline: form.tagline || null,
          primaryColor: form.primaryColor || null,
        },
      },
      {
        onSuccess: (data) => {
          setRequestId(data.requestId);
          setIsPolling(true);
        },
        onError: () => toast({ title: "Failed to start generation", variant: "destructive" }),
      }
    );
  };

  const isGenerating = festiveMutation.isPending || isPolling;
  const imageUrl = statusData?.status === "COMPLETED" ? statusData.imageUrl : null;

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Festive & Offer Images</h1>
          <p className="text-muted-foreground mt-2">Generate beautiful festive banners for Indian holidays and special offers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Festive Image</CardTitle>
              <CardDescription>Choose an occasion and we will create a stunning banner for your business.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input
                  data-testid="input-business-name"
                  placeholder="e.g. Patel Jewellers"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Occasion *</Label>
                <Select value={form.occasion} onValueChange={(v) => setForm({ ...form, occasion: v })}>
                  <SelectTrigger data-testid="select-occasion"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OCCASIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tagline (optional)</Label>
                <Input
                  data-testid="input-tagline"
                  placeholder="e.g. Celebrate with us! 20% off"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Brand Color (optional)</Label>
                <Input
                  data-testid="input-color"
                  placeholder="e.g. gold, royal blue, saffron"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                />
              </div>
              <Button
                data-testid="button-generate-festive"
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />{isPolling ? "Generating..." : "Starting..."}</>
                ) : (
                  <><PartyPopper className="h-4 w-4 mr-2" />Generate Festive Image</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Festive Banner</CardTitle>
              <CardDescription>Ready to post on social media.</CardDescription>
            </CardHeader>
            <CardContent>
              {imageUrl ? (
                <div className="space-y-4">
                  <img src={imageUrl} alt="Festive banner" data-testid="img-festive" className="w-full rounded-lg object-cover shadow-md" />
                  <Button variant="outline" className="w-full" asChild>
                    <a href={imageUrl} download="festive-banner.webp" target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />Download Banner
                    </a>
                  </Button>
                </div>
              ) : isGenerating ? (
                <div className="space-y-3">
                  <Skeleton className="w-full h-64 rounded-lg" />
                  <p className="text-center text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                    {statusData?.status ?? "QUEUED"} — checking every 3 seconds...
                  </p>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
                  <PartyPopper className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">Your festive banner will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
