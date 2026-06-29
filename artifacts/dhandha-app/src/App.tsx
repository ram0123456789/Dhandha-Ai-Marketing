import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ImageGenerator from "@/pages/image-generator";
import SocialPosts from "@/pages/social-posts";
import FestiveImages from "@/pages/festive-images";
import BusinessAudit from "@/pages/business-audit";
import SeoKeywords from "@/pages/seo-keywords";
import Competitors from "@/pages/competitors";
import ReviewReplies from "@/pages/review-replies";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/image-generator" component={ImageGenerator} />
      <Route path="/social-posts" component={SocialPosts} />
      <Route path="/festive-images" component={FestiveImages} />
      <Route path="/business-audit" component={BusinessAudit} />
      <Route path="/seo-keywords" component={SeoKeywords} />
      <Route path="/competitors" component={Competitors} />
      <Route path="/review-replies" component={ReviewReplies} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
