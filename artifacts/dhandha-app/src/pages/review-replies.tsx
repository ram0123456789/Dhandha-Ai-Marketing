import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGenerateReviewReply, ReviewReplyInputTone } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Copy, MessageSquare } from "lucide-react";
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

  const replyMutation = useGenerateReviewReply();

  const handleGenerate = () => {
    if (!form.businessName || !form.reviewText) {
      toast({ title: "Fill in all required fields", variant: "destructive" });
      return;
    }
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

  const handleCopy = () => {
    if (!reply) return;
    navigator.clipboard.writeText(reply);
    toast({ title: "Reply copied!" });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Review Replies</h1>
          <p className="text-muted-foreground mt-2">Generate personalized, professional replies to your Google Reviews instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Review</CardTitle>
              <CardDescription>Paste the review and we will craft the perfect reply.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input data-testid="input-business-name" placeholder="e.g. Singh's Dhaba" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Customer Review *</Label>
                <textarea
                  data-testid="textarea-review"
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Paste the customer review here..."
                  value={form.reviewText}
                  onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Star Rating</Label>
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
                <Label>Reply Tone</Label>
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Reply</CardTitle>
                  <CardDescription>Copy and paste this into your Google Business Profile.</CardDescription>
                </div>
                {reply && (
                  <Button variant="outline" size="sm" data-testid="button-copy-reply" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {reply ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p data-testid="text-reply" className="text-sm leading-relaxed whitespace-pre-wrap">{reply}</p>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">Your AI reply will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
