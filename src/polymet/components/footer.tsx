import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);
    // Simulate API call - in production, connect to email service
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Successfully subscribed to listing alerts!");
    setEmail("");
    setIsSubscribing(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-5 md:py-6">
          <div className="flex flex-col items-center text-center gap-4 max-w-xl mx-auto">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-background mb-0.5">
                Get listing alerts
              </h3>
              <p className="text-sm text-background/70">
                New franchises and franchise territories, delivered when they go live
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
              <Input
                type="email"
                placeholder="Enter email for new franchise alerts"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border border-background/20 text-background placeholder:text-background/50 w-full shadow-none rounded-lg"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-growth-green text-white hover:bg-growth-green-dark whitespace-nowrap"
              >
                {isSubscribing ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Main Footer Content - Desktop */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo-dark.png"
                alt="BizSearch"
                className="h-10 w-auto object-contain dark:hidden"
              />
              <img
                src="/logo.png"
                alt="BizSearch"
                className="h-10 w-auto object-contain hidden dark:block"
              />
            </div>
            <p className="text-sm text-background/70 mb-4">
              Find the right franchise. Evaluate investment, territory and fit —
              then connect with brands. Businesses for sale also available.
            </p>
            <div className="flex gap-2">
              <a
                href="https://facebook.com/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-background/60 mb-3">Franchises</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/franchises" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Franchise Opportunities
                </Link>
              </li>
              <li>
                <Link to="/franchises" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Browse Franchises
                </Link>
              </li>
              <li>
                <Link to="/match" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Franchise Match
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-background/60 mb-3">For Franchisors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/add-franchise-listing" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  List Your Franchise
                </Link>
              </li>
              <li>
                <Link to="/franchisor/applications" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Franchisee Applications
                </Link>
              </li>
            </ul>
            <h3 className="text-sm font-semibold text-background mb-3 mt-6">Businesses</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/businesses" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Businesses for Sale
                </Link>
              </li>
              <li>
                <Link to="/add-business-listing" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Sell a Business
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-background/60 mb-3">Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/smart-search" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Franchise Matching
                </Link>
              </li>
              <li>
                <Link to="/franchises" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Browse by city
                </Link>
              </li>
              <li>
                <Link to="/business-valuation" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Investment / ROI
                </Link>
              </li>
              <li>
                <a
                  href="https://vabgo.com/commercial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-background/60 hover:text-white transition-colors duration-150"
                >
                  Commercial property (VABGO)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-background/60 mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-background/60 hover:text-white transition-colors duration-150">
                  Privacy
                </Link>
              </li>
            </ul>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-2 text-sm text-background/60">
                <Mail className="h-4 w-4 flex-shrink-0 text-background" />
                <a href="mailto:support@bizsearch.in" className="hover:text-white transition-colors duration-150">
                  support@bizsearch.in
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-background/60">
                <Phone className="h-4 w-4 flex-shrink-0 text-background" />
                <a href="tel:+911800123456" className="hover:text-white transition-colors duration-150">
                  +91 1800 123 456
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Footer Content - Mobile Accordion */}
        <div className="md:hidden space-y-4 mb-8">
          {/* Company Info - Always visible on mobile */}
          <div className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <img
                src="/logo-dark.png"
                alt="BizSearch"
                className="h-10 w-auto object-contain dark:hidden"
              />
              <img
                src="/logo.png"
                alt="BizSearch"
                className="h-10 w-auto object-contain hidden dark:block"
              />
            </div>
            <p className="text-sm text-background/70 mb-4">
              Find the right franchise. Evaluate investment, territory and fit —
              then connect with brands. Businesses for sale also available.
            </p>
            <div className="flex justify-center gap-2">
              <a href="https://facebook.com/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-md"><Facebook className="h-4 w-4" /></a>
              <a href="https://twitter.com/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-md"><Twitter className="h-4 w-4" /></a>
              <a href="https://linkedin.com/company/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-md"><Linkedin className="h-4 w-4" /></a>
              <a href="https://instagram.com/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-md"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Accordion Sections */}
          {[
            {
              id: 'franchises', title: 'Franchises', links: [
                { to: '/franchises', label: 'Franchise Opportunities' },
                { to: '/franchises', label: 'Browse Franchises' },
                { to: '/match', label: 'Franchise Match' },
              ]
            },
            {
              id: 'franchisors', title: 'For Franchisors', links: [
                { to: '/add-franchise-listing', label: 'List Your Franchise' },
                { to: '/franchisor/applications', label: 'Franchisee Applications' },
              ]
            },
            {
              id: 'businesses', title: 'Businesses', links: [
                { to: '/businesses', label: 'Businesses for Sale' },
                { to: '/add-business-listing', label: 'Sell a Business' },
              ]
            },
            {
              id: 'tools', title: 'Tools', links: [
                { to: '/smart-search', label: 'Franchise Matching' },
                { to: '/franchises', label: 'Browse by city' },
                { to: '/business-valuation', label: 'Investment / ROI' },
              ]
            },
            {
              id: 'company', title: 'Company', links: [
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
                { to: '/terms', label: 'Terms' },
                { to: '/privacy', label: 'Privacy' },
              ]
            },
          ].map((section) => (
            <div key={section.id} className="border-b border-white/10">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full py-3 text-left"
              >
                <span className="font-semibold text-background">{section.title}</span>
                {expandedSection === section.id ? (
                  <ChevronUp className="h-4 w-4 text-background/60" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-background/60" />
                )}
              </button>
              {expandedSection === section.id && (
                <ul className="space-y-2 pb-3">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        to={link.to}
                        className="text-sm text-background/60 hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Contact - Accordion */}
          <div className="border-b border-white/10">
            <button
              onClick={() => toggleSection('contact')}
              className="flex items-center justify-between w-full py-3 text-left"
            >
              <span className="font-semibold text-background">Contact Us</span>
              {expandedSection === 'contact' ? (
                <ChevronUp className="h-4 w-4 text-background/60" />
              ) : (
                <ChevronDown className="h-4 w-4 text-background/60" />
              )}
            </button>
            {expandedSection === 'contact' && (
              <ul className="space-y-3 pb-3">
                <li className="flex items-start gap-2 text-sm text-background/60">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-background" />
                  <span>123 Business Hub, MG Road, Bangalore 560001</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-background/60">
                  <Mail className="h-4 w-4 flex-shrink-0 text-background" />
                  <a href="mailto:support@bizsearch.in">support@bizsearch.in</a>
                </li>
                <li className="flex items-center gap-2 text-sm text-background/60">
                  <Phone className="h-4 w-4 flex-shrink-0 text-background" />
                  <a href="tel:+911800123456">+91 1800 123 456</a>
                </li>
              </ul>
            )}
          </div>
        </div>

        <Separator className="bg-white/10 mb-6" />

        {/* Trust */}
        <p className="text-xs uppercase tracking-widest text-background/50 mb-6">
          Listing moderation · Secure platform · Verification levels · Transparent listings
        </p>

        <Separator className="bg-white/10 mb-6" />

        <p className="text-xs text-background/70 mb-4 max-w-3xl">
          Investment figures and returns are estimates provided by respective franchisors. Independent due diligence is advised.
        </p>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-background/60">
            <CheckCircle className="h-4 w-4 text-background" />
            <span>Listings reviewed before publication where moderation is enabled</span>
          </div>
          <p className="text-sm text-background/60 text-center">
            © {currentYear} BizSearch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
