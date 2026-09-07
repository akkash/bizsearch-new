import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Scale,
  Shield,
  BarChart3,
  Building2,
  Users,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/page-hero";

export function AboutPage({ className }: { className?: string }) {
  const howSteps = [
    {
      icon: Search,
      title: "Search",
      description:
        "Browse businesses for sale and franchise opportunities by industry, location, and investment range.",
    },
    {
      icon: Scale,
      title: "Compare",
      description:
        "Put listings side by side on price, fees, revenue, and requirements.",
    },
    {
      icon: Shield,
      title: "Verify",
      description:
        "Review verification status and listing details before you inquire.",
    },
    {
      icon: BarChart3,
      title: "Analyze",
      description:
        "Use financials, investment ranges, and break-even figures where sellers provide them.",
    },
  ];

  const teamMembers = [
    {
      name: "Ajay Kumar",
      role: "Business Acquisition Specialist",
      focus: "Valuation, due diligence, and buyer–seller coordination",
    },
    {
      name: "Vijay Sharma",
      role: "Franchise Development",
      focus: "Franchise models, territory planning, and fee structures",
    },
    {
      name: "Priya Patel",
      role: "Product & Platform",
      focus: "Search, listings, and analysis tools on BizSearch",
    },
    {
      name: "Rahul Singh",
      role: "Market Research",
      focus: "Industry context and listing quality review",
    },
  ];

  return (
    <div className={`min-h-screen bg-background ${className ?? ""}`}>
      <PageHero
        eyebrow="About BizSearch"
        title="A marketplace for businesses and franchises"
        description="BizSearch helps buyers and sellers find, compare, and evaluate private business and franchise opportunities in one place."
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link to="/businesses">
              Browse businesses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/franchises">Browse franchises</Link>
          </Button>
        </div>
      </PageHero>

      {/* What / Who / Why */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-growth-green mb-2">
                What
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A marketplace for businesses for sale and franchise opportunities,
                with listing details, comparison, and inquiry tools.
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-growth-green mb-2">
                Who
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Buyers looking for an existing business or franchise, sellers
                listing their company, and franchisors expanding territories.
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-growth-green mb-2">
                Why
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Private business information is fragmented across brokers,
                classifieds, and word of mouth. BizSearch brings listings and
                key numbers into a single searchable product.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
            How it works
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
            Search listings, compare economics, check verification, and dig into
            the numbers sellers share.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howSteps.map((step) => (
              <Card key={step.title} className="border-border">
                <CardHeader className="pb-2">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                    <step.icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6">
            What you can do on BizSearch
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 max-w-3xl">
            {[
              "List a business for sale or publish a franchise opportunity",
              "Filter by industry, city, and investment range",
              "Compare up to three opportunities side by side",
              "Contact sellers and franchisors through the platform",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-growth-green mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              Team
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              People working on listings, franchise coverage, and the product.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.name} className="border-border">
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.focus}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 max-w-4xl">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1">
                Looking for a business or franchise?
              </h2>
              <p className="text-sm text-muted-foreground">
                Start with search, or list what you have for sale.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link to="/businesses">
                  <Building2 className="mr-2 h-4 w-4" />
                  Start searching
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-foreground">
              <Phone className="h-4 w-4" />
              +91 98765 43210
            </a>
            <a href="mailto:contact@bizsearch.in" className="flex items-center gap-2 hover:text-foreground">
              <Mail className="h-4 w-4" />
              contact@bizsearch.in
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Mumbai, Maharashtra, India
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
