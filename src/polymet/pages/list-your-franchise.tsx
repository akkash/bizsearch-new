import { Link } from "react-router-dom";
import { Building2, FileText, Lightbulb, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/seo-head";

const benefits = [
  {
    icon: Users,
    title: "Qualified franchisees",
    body: "Reach people who are already looking for a franchise and have told BizSearch what they can invest.",
  },
  {
    icon: Shield,
    title: "A protected conversation",
    body: "Enquiries stay on BizSearch. You review who wants to talk before you share more.",
  },
  {
    icon: Lightbulb,
    title: "Matching",
    body: "BizSearch scores franchisee profiles and investment capacity so you see suitable candidates.",
  },
];

const steps = [
  {
    title: "Tell us about the brand",
    body: "Add the investment, royalty, outlets, and the cities you want to grow in.",
  },
  {
    title: "We review the listing",
    body: "Most franchise listings are reviewed within 24–48 hours. Complex listings can take up to 5 business days.",
  },
  {
    title: "Franchisees enquire",
    body: "Qualified franchisees enquire on BizSearch. You review them in your pipeline.",
  },
  {
    title: "You decide who to talk to",
    body: "Connect with the people who fit, and grow the network on your terms.",
  },
];

export function ListYourFranchisePage() {
  return (
    <div className="bg-background">
      <SEOHead
        title="List your franchise"
        description="Basic franchise listings on BizSearch are free. See what franchisors get before you sign in."
        canonicalUrl="/list-your-franchise"
      />
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-4xl">
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          List your franchise
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
          Put your brand in front of people who want to invest. Basic listings are free. Featured placement is not billed yet.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button asChild className="min-h-11">
            <Link to="/add-franchise-listing">Continue to list</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/login?redirect=/add-franchise-listing">Sign in</Link>
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          The listing form asks you to sign in with a franchisor account.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="h-8 w-8 text-growth-green mb-2" />
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold">What happens next</h2>
        <ol className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold">
                {index + 1}
              </span>
              <div className="min-w-0 pt-1">
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <Card className="mt-14">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-growth-green" />
              What it costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Basic listings are free. Featured placement is not billed yet.</p>
            <p>
              You will be asked for your franchise disclosure document, financial statements, brand assets, and legal registration documents.
            </p>
          </CardContent>
        </Card>

        <div className="mt-10 flex items-start gap-3 rounded-lg border border-border p-4">
          <Building2 className="h-5 w-5 shrink-0 text-growth-green mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Already have a franchisor account? Continue straight to the form.
          </p>
        </div>
        <Button asChild className="mt-4 min-h-11">
          <Link to="/add-franchise-listing">Continue to list</Link>
        </Button>
      </div>
    </div>
  );
}
