import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGenerateReviewReply, ReviewReplyInputTone } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Star, MessageSquare, ExternalLink, ClipboardCopy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReviewReplies() {
  const { toast } = useToast();
  const [form, setForm] = useState<{
    businessName: string;
    reviewText: string;
    rating: number;
    tone: typeof ReviewReplyInputTone[keyof typeof ReviewReplyInputTone];
  }>({
    businessName: "",
    reviewText: "",
    rating: 5,
    tone: ReviewReplyInputTone.professional,
  });
  const [reply, setReply] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const replyMutation = useGenerateReviewReply();

  const handleGenerate = () => {
    if (!form.businessName || !form.reviewText) {
      toast({ title: "Fill in all required fields", variant: "destructive" });
      return;
    }
    setCopied(false);
    replyMutation.mutate(
      { data: { ...form, rating: Number(form.rating) } },
      {
        onSuccess: (data) => {
          setReply(data.reply);
          toast({ title: "Reply generated!" });
        },
        onError: () => toast({ title: "Failed to generate reply", variant: "destructive" }),
      }
    );
  };

  const handlePostToGoogle = async () => {
    if (!reply) return;

    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
      toast({ title: "Reply copied!" });

      // Open Google Business Profile reviews page in new tab
      const googleBusinessUrl = `https://business.google.com/reviews`;
      window.open(googleBusinessUrl, "_blank");
    } catch {
      toast({ title: "Could not copy. Please copy manually.", variant: "destructive" });
    }
  };

  const handleCopyOnly = async () => {
    if (!reply) return;
    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
      toast({ title: "Reply copied!" });
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-5 animate-in fade-in duration-300">
        <div className="pb-2">
          <h1 className="text-2xl font-bold tracking-tight">Review Replies</h1>
          <p className="text-muted-foreground mt-1 text-sm">Generate AI replies and post them to Google.</p>
        </div>

        {!reply ? (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer Review</CardTitle>
              <CardDescription className="text-xs">Paste the review to get an AI-crafted reply.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Business Name</Label>
                <Input
                  data-testid="input-business-name"
                  placeholder="e.g. Singh's Dhaba"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Customer Review</Label>
                <textarea
                  data-testid="textarea-review"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Paste the customer review here..."
                  value={form.reviewText}
                  onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Star Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      data-testid={`button-star-${star}`}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${form.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted stroke-muted-foreground"}`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground self-center">{form.rating}/5</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Reply Tone</Label>
                <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v as typeof ReviewReplyInputTone[keyof typeof ReviewReplyInputTone] })}>
                  <SelectTrigger data-testid="select-tone"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="warm">Warm & Friendly</SelectItem>
                    <SelectItem value="apologetic">Apologetic</SelectItem>
                    <SelectItem value="thankful">Thankful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button data-testid="button-generate-reply" className="w-full" onClick={handleGenerate} disabled={replyMutation.isPending}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {replyMutation.isPending ? "Generating..." : "Generate Reply"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Generated Reply</CardTitle>
                <CardDescription className="text-xs">Your AI reply is ready to post on Google.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                  <p data-testid="text-reply" className="text-sm leading-relaxed whitespace-pre-wrap">{reply}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" onClick={handlePostToGoogle} data-testid="button-post-google">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy & Post to Google
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleCopyOnly} data-testid="button-copy-reply">
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" className="w-full text-sm" onClick={() => { setReply(null); setCopied(false); }}>
                    Generate another reply
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Review Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Business</p>
                  <p className="text-sm font-medium">{form.businessName}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${form.rating >= s ? "text-yellow-400 fill-yellow-400" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Original Review</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">{form.reviewText}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
