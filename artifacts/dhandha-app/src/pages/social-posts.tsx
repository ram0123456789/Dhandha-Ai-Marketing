import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useGenerateCaption,
  useGetPosts,
  useCreatePost,
  useDeletePost,
  getGetPostsQueryKey,
  CaptionInputPlatform,
  CaptionInputTone,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Trash2, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SocialPosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<{
    businessName: string;
    businessType: string;
    topic: string;
    platform: typeof CaptionInputPlatform[keyof typeof CaptionInputPlatform];
    tone: typeof CaptionInputTone[keyof typeof CaptionInputTone];
  }>({
    businessName: "",
    businessType: "",
    topic: "",
    platform: CaptionInputPlatform.both,
    tone: CaptionInputTone.professional,
  });

  const captionMutation = useGenerateCaption();
  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeletePost();
  const { data: posts, isLoading: postsLoading } = useGetPosts();

  const [captions, setCaptions] = useState<{ platform: string; caption: string; hashtags: string[] }[]>([]);

  const handleGenerate = () => {
    if (!form.businessName || !form.businessType || !form.topic) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }
    captionMutation.mutate(
      { data: form },
      {
        onSuccess: (data) => {
          setCaptions(data.captions);
          toast({ title: "Captions generated!", description: `${data.captions.length} caption(s) ready.` });
        },
        onError: () => toast({ title: "Error generating captions", variant: "destructive" }),
      }
    );
  };

  const handleSave = (caption: { platform: string; caption: string; hashtags: string[] }) => {
    createPostMutation.mutate(
      {
        data: {
          caption: caption.caption,
          platform: caption.platform,
          hashtags: caption.hashtags.join(" "),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
          toast({ title: "Post saved!" });
        },
        onError: () => toast({ title: "Failed to save post", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    deletePostMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
          toast({ title: "Post deleted" });
        },
      }
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Posts</h1>
          <p className="text-muted-foreground mt-2">Generate AI captions for Facebook and Instagram. Save your favourites.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Caption Generator</CardTitle>
              <CardDescription>Fill in your business details to get AI-crafted captions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  data-testid="input-business-name"
                  placeholder="e.g. Sharma Sweets"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Input
                  data-testid="input-business-type"
                  placeholder="e.g. Sweet Shop, Restaurant, Salon"
                  value={form.businessType}
                  onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Topic / Occasion</Label>
                <Input
                  data-testid="input-topic"
                  placeholder="e.g. Diwali offer, Weekend sale, New product"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as typeof CaptionInputPlatform[keyof typeof CaptionInputPlatform] })}>
                    <SelectTrigger data-testid="select-platform"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v as typeof CaptionInputTone[keyof typeof CaptionInputTone] })}>
                    <SelectTrigger data-testid="select-tone"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="festive">Festive</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                data-testid="button-generate-caption"
                className="w-full"
                onClick={handleGenerate}
                disabled={captionMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {captionMutation.isPending ? "Generating..." : "Generate Captions"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {captions.length > 0 ? (
              captions.map((c, i) => (
                <Card key={i} className="border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={c.platform === "instagram" ? "default" : "secondary"} className="capitalize">
                        {c.platform}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          data-testid={`button-copy-${i}`}
                          onClick={() => handleCopy(c.caption + "\n\n" + c.hashtags.join(" "))}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-save-${i}`}
                          onClick={() => handleSave(c)}
                          disabled={createPostMutation.isPending}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{c.caption}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {c.hashtags.map((h, j) => (
                        <span key={j} className="text-xs text-primary font-medium">{h}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Generated captions will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Saved Posts</h2>
          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : posts?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Card key={post.id} data-testid={`card-post-${post.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Badge className="mb-2 capitalize">{post.platform}</Badge>
                        <p className="text-sm line-clamp-3">{post.caption}</p>
                        {post.hashtags && (
                          <p className="text-xs text-primary mt-2 line-clamp-1">{post.hashtags}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(post.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`button-delete-${post.id}`}
                        onClick={() => handleDelete(post.id)}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
              <p className="text-sm">No saved posts yet. Generate and save your first post!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
