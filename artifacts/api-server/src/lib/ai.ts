export function generateCaptions(params: {
  businessName: string;
  businessType: string;
  topic: string;
  platform?: string;
  tone?: string;
}): { platform: string; caption: string; hashtags: string[] }[] {
  const { businessName, businessType, topic, platform = "both", tone = "professional" } = params;

  const toneMap: Record<string, string> = {
    professional: "We invite you to",
    casual: "Hey! Come check out",
    festive: "Celebrate with us!",
    urgent: "Don't miss out!",
  };

  const opener = toneMap[tone] ?? "Discover";

  const captions = [];

  if (platform === "instagram" || platform === "both") {
    captions.push({
      platform: "instagram",
      caption: `${opener} our ${topic} at ${businessName}! As a trusted ${businessType} in your community, we bring you the best quality and service. Visit us today and experience the difference.\n\n#${businessName.replace(/\s+/g, "")} #${topic.replace(/\s+/g, "")} #${businessType.replace(/\s+/g, "")}`,
      hashtags: [
        `#${businessName.replace(/\s+/g, "")}`,
        `#${topic.replace(/\s+/g, "")}`,
        `#${businessType.replace(/\s+/g, "")}`,
        "#LocalBusiness",
        "#IndiaKiDukan",
        "#SmallBusiness",
        "#SupportLocal",
        "#MadeForIndia",
      ],
    });
  }

  if (platform === "facebook" || platform === "both") {
    captions.push({
      platform: "facebook",
      caption: `Exciting news from ${businessName}! We are thrilled to announce our ${topic}. As your favourite ${businessType}, we are committed to serving you better every day. Like and share to spread the word with your friends and family!`,
      hashtags: [
        `#${businessName.replace(/\s+/g, "")}`,
        `#${topic.replace(/\s+/g, "")}`,
        "#LocalBusiness",
        "#Community",
        "#IndiaKiDukan",
      ],
    });
  }

  return captions;
}

export function buildFestivePrompt(params: {
  businessName: string;
  occasion: string;
  tagline?: string | null;
  primaryColor?: string | null;
}): string {
  const { businessName, occasion, tagline, primaryColor } = params;
  const colorHint = primaryColor ? `, dominant color ${primaryColor}` : "";
  const taglineHint = tagline ? `, tagline: "${tagline}"` : "";

  return `A vibrant, professional festive social media marketing banner for ${occasion} celebration. Business name "${businessName}" prominently displayed${taglineHint}. Festive Indian design with decorative elements, warm celebratory colors, confetti, diyas or relevant cultural motifs for ${occasion}${colorHint}. High quality, eye-catching, suitable for Instagram and Facebook posting. No text except business name and tagline.`;
}

export function computeBusinessAudit(params: {
  businessName: string;
  category: string;
  city: string;
  website?: string | null;
  hasPhotos?: boolean;
  hasHours?: boolean;
  hasDescription?: boolean;
  reviewCount?: number;
  averageRating?: number | null;
}) {
  const {
    hasPhotos = false,
    hasHours = false,
    hasDescription = false,
    reviewCount = 0,
    averageRating = null,
  } = params;

  const profileScore =
    (hasDescription ? 25 : 0) +
    (hasHours ? 20 : 0) +
    (params.website ? 15 : 0);

  const mediaScore = hasPhotos ? 80 : 10;

  const reviewScore =
    reviewCount >= 50
      ? 90
      : reviewCount >= 20
      ? 70
      : reviewCount >= 5
      ? 50
      : reviewCount >= 1
      ? 30
      : 0;

  const ratingBonus = averageRating != null ? Math.round((averageRating / 5) * 10) : 0;
  const adjustedReview = Math.min(100, reviewScore + ratingBonus);

  const seoScore =
    (hasDescription ? 30 : 0) +
    (hasPhotos ? 20 : 0) +
    (hasHours ? 20 : 0) +
    (params.website ? 30 : 0);

  const overall = Math.round((profileScore + mediaScore + adjustedReview + seoScore) / 4);

  const recommendations = [];

  if (!hasDescription) {
    recommendations.push({
      title: "Add a Business Description",
      description: "A compelling business description helps customers find you and understand what makes you unique. Write 150–300 words about your services, history, and unique selling points.",
      priority: "high" as const,
    });
  }

  if (!hasPhotos) {
    recommendations.push({
      title: "Upload High-Quality Photos",
      description: "Businesses with photos receive 42% more requests for directions. Upload at least 10 photos of your storefront, products, and team to boost visibility.",
      priority: "high" as const,
    });
  }

  if (!hasHours) {
    recommendations.push({
      title: "Set Your Business Hours",
      description: "Customers need to know when you are open. Accurate business hours build trust and reduce missed visits.",
      priority: "high" as const,
    });
  }

  if (reviewCount < 10) {
    recommendations.push({
      title: "Get More Customer Reviews",
      description: "Ask satisfied customers to leave a Google review. Businesses with 10+ reviews appear more credible and rank higher in local search results.",
      priority: "medium" as const,
    });
  }

  if (!params.website) {
    recommendations.push({
      title: "Add Your Website Link",
      description: "Adding a website link increases traffic and gives customers a way to learn more. Even a simple landing page helps your Google ranking.",
      priority: "medium" as const,
    });
  }

  if (seoScore < 60) {
    recommendations.push({
      title: "Improve Your Local SEO",
      description: "Optimize your listing with location-specific keywords in your description. Include your city name and primary services to rank higher in local searches.",
      priority: "low" as const,
    });
  }

  return {
    score: overall,
    breakdown: {
      profile: profileScore,
      reviews: adjustedReview,
      media: mediaScore,
      seo: seoScore,
    },
    recommendations,
  };
}

export function generateKeywords(params: { businessName: string; category: string; city: string }) {
  const { category, city } = params;

  return {
    keywords: [
      { keyword: `${category} near me`, intent: "local" as const, difficulty: "easy" as const },
      { keyword: `best ${category} in ${city}`, intent: "local" as const, difficulty: "medium" as const },
      { keyword: `${category} ${city}`, intent: "local" as const, difficulty: "medium" as const },
      { keyword: `top rated ${category} ${city}`, intent: "local" as const, difficulty: "easy" as const },
      { keyword: `affordable ${category} in ${city}`, intent: "transactional" as const, difficulty: "easy" as const },
      { keyword: `${category} services ${city}`, intent: "transactional" as const, difficulty: "medium" as const },
      { keyword: `${category} price list ${city}`, intent: "informational" as const, difficulty: "easy" as const },
      { keyword: `how to find ${category} in ${city}`, intent: "informational" as const, difficulty: "easy" as const },
      { keyword: `${category} open now ${city}`, intent: "local" as const, difficulty: "medium" as const },
      { keyword: `${category} reviews ${city}`, intent: "informational" as const, difficulty: "hard" as const },
    ],
  };
}

export function generateCompetitorAnalysis(params: { businessName: string; category: string; city: string }) {
  const { category, city } = params;

  return {
    insights: [
      {
        title: "Strong Online Presence Gap",
        description: `Most ${category} businesses in ${city} have fewer than 15 Google reviews and incomplete profiles. This is a significant opportunity to stand out by optimizing your Google Business Profile.`,
      },
      {
        title: "Social Media Engagement",
        description: `Competitors in your category post 3–5 times per week on Instagram and Facebook. Consistent festive and offer posts drive the most engagement during Indian festivals.`,
      },
      {
        title: "Keyword Opportunities",
        description: `High-intent search terms like "best ${category} in ${city}" are underutilized by competitors. Ranking for these terms could drive significant organic traffic.`,
      },
      {
        title: "Response Rate to Reviews",
        description: `Only 20% of ${category} businesses in ${city} respond to customer reviews. Replying to every review — positive or negative — builds trust and improves your ranking.`,
      },
    ],
    opportunities: [
      `Dominate local search for "${category} in ${city}" with consistent keyword-rich content`,
      "Launch weekly festive post campaigns during Indian holidays to boost engagement",
      "Offer loyalty schemes and promote them on social media to retain customers",
      "Respond to all Google reviews within 24 hours to improve ranking",
      "Use AI-generated images to create professional marketing content at low cost",
    ],
    threats: [
      "Larger chains with dedicated marketing budgets are entering the local market",
      "Negative reviews without responses can significantly damage trust",
      "Competitors who post daily have 3x higher engagement than those who post weekly",
      "Low website presence means missing customers who research online before visiting",
    ],
  };
}

export function generateReviewReply(params: {
  reviewText: string;
  rating: number;
  businessName: string;
  tone?: string;
}): string {
  const { reviewText, rating, businessName, tone = "professional" } = params;

  const isPositive = rating >= 4;
  const isNegative = rating <= 2;

  if (isPositive) {
    const openers: Record<string, string> = {
      professional: `Thank you so much for your kind review of ${businessName}!`,
      warm: `We are absolutely delighted to read your wonderful feedback!`,
      thankful: `Your kind words mean the world to us at ${businessName}!`,
      apologetic: `Thank you so much for sharing your experience with us!`,
    };
    const opener = openers[tone] ?? openers.professional;

    return `${opener} We are thrilled that you had such a positive experience with us. Customer satisfaction is our highest priority, and reviews like yours inspire our entire team to keep delivering excellence. We look forward to welcoming you back soon! 🙏`;
  } else if (isNegative) {
    const openers: Record<string, string> = {
      professional: `We sincerely apologize for the experience you had at ${businessName}.`,
      warm: `We are truly sorry to hear that your visit did not meet your expectations.`,
      apologetic: `Please accept our heartfelt apology for the inconvenience caused.`,
      thankful: `Thank you for bringing this to our attention — we take all feedback seriously.`,
    };
    const opener = openers[tone] ?? openers.professional;

    return `${opener} This is not the standard of service we strive to provide, and we take your feedback very seriously. We would love the opportunity to make this right. Please contact us directly so we can address your concerns personally and ensure your next visit exceeds your expectations. Your satisfaction is our priority.`;
  } else {
    return `Thank you for taking the time to share your feedback about ${businessName}. We appreciate you highlighting both the positives and the areas where we can improve. Your feedback helps us get better every day. We hope to have the opportunity to serve you again and provide you with an even better experience next time. Thank you for choosing us!`;
  }
}
