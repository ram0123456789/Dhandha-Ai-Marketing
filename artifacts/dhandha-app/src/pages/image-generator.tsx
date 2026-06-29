import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useGenerateImage, useGetImageStatus, getGetImageStatusQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("professional");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const generateMutation = useGenerateImage();

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
      toast({ title: "Image ready!", description: "Your AI image has been generated." });
    } else if (statusData.status === "FAILED" || statusData.status === "ERROR") {
      setIsPolling(false);
      toast({ title: "Generation failed", description: statusData.error ?? "Please try again.", variant: "destructive" });
    }
  }, [statusData?.status]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({ title: "Enter a prompt", description: "Describe the image you want to generate.", variant: "destructive" });
      return;
    }
    const fullPrompt = style !== "none" ? `${prompt}. Style: ${style}, vibrant, high quality, Indian market.` : prompt;
    generateMutation.mutate(
      { data: { prompt: fullPrompt, style } },
      {
        onSuccess: (data) => {
          setRequestId(data.requestId);
          setIsPolling(true);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to start image generation.", variant: "destructive" });
        },
      }
    );
  };

  const isGenerating = generateMutation.isPending || isPolling;
  const imageUrl = statusData?.status === "COMPLETED" ? statusData.imageUrl : null;

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Image Generator</h1>
          <p className="text-muted-foreground mt-2">Create stunning marketing images powered by GPT-Image-2 via Pixazo.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Image</CardTitle>
              <CardDescription>Describe what you want and let AI create it for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Image Description</Label>
                <textarea
                  id="prompt"
                  data-testid="input-prompt"
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="e.g. A vibrant Indian restaurant interior with warm lighting, decorative elements, and a welcoming atmosphere..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style" data-testid="select-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="festive">Festive & Vibrant</SelectItem>
                    <SelectItem value="modern">Modern & Clean</SelectItem>
                    <SelectItem value="traditional">Traditional Indian</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="none">No Style Hint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                data-testid="button-generate"
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {generateMutation.isPending ? "Starting..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>Your generated image will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              {imageUrl ? (
                <div className="space-y-4">
                  <img
                    src={imageUrl}
                    alt="Generated"
                    data-testid="img-generated"
                    className="w-full rounded-lg object-cover shadow-md"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a href={imageUrl} download="dhandha-image.webp" target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </a>
                  </Button>
                </div>
              ) : isGenerating ? (
                <div className="space-y-3">
                  <Skeleton className="w-full h-64 rounded-lg" />
                  <div className="text-center text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                    {isPolling ? `Status: ${statusData?.status ?? "QUEUED"} — checking every 3 seconds...` : "Starting generation..."}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">Your image will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
