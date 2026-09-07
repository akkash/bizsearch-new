import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Shield,
  CheckCircle,
  ArrowRight,
  Award,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INDUSTRY_INSIGHTS } from "@/data/industry-data";
import { toast } from "sonner";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Take first 6 industries for the footer
  const topIndustries = INDUSTRY_INSIGHTS.slice(0, 6);

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
    <footer className="bg-[hsl(220,32%,7%)] text-slate-200">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">
                Get listing alerts
              </h3>
              <p className="text-sm text-slate-400">
                New franchises and businesses for sale, delivered when they go live
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 w-full md:w-64"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-growth-green hover:bg-growth-green/90 text-white whitespace-nowrap"
              >
                {isSubscribing ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content - Desktop */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-growth-green" />
              <span className="text-2xl font-bold text-white">BizSearch</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              India&apos;s franchise discovery marketplace — find, compare, and
              enquire about franchise opportunities. Businesses for sale available
              as a secondary marketplace.
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

          {/* Industries */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Industries
            </h3>
            <ul className="space-y-2">
              {topIndustries.map((industry) => (
                <li key={industry.id}>
                  <Link
                    to={`/industry/${industry.slug}`}
                    className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                  >
                    {industry.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/industries"
                  className="text-sm text-growth-green hover:text-growth-green/80 font-medium flex items-center gap-1"
                >
                  View All Industries <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/franchises"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Find a Franchise
                </Link>
              </li>
              <li>
                <Link
                  to="/franchise-map"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Franchise Locations
                </Link>
              </li>
              <li>
                <Link
                  to="/smart-search"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Smart Search
                </Link>
              </li>
              <li>
                <Link
                  to="/add-franchise-listing"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  List Your Franchise
                </Link>
              </li>
              <li>
                <Link
                  to="/businesses"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Businesses for Sale
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="text-sm text-slate-400 hover:text-growth-green transition-colors"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-growth-green" />
                <span>
                  123 Business Hub, MG Road
                  <br />
                  Bangalore, Karnataka 560001
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 flex-shrink-0 text-growth-green" />
                <a
                  href="mailto:support@bizsearch.in"
                  className="hover:text-growth-green transition-colors"
                >
                  support@bizsearch.in
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-4 w-4 flex-shrink-0 text-growth-green" />
                <a
                  href="tel:+911800123456"
                  className="hover:text-growth-green transition-colors"
                >
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
              <Building2 className="h-8 w-8 text-growth-green" />
              <span className="text-2xl font-bold text-white">BizSearch</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Franchise and business marketplace
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
            { id: 'industries', title: 'Industries', links: topIndustries.map(i => ({ to: `/industry/${i.slug}`, label: i.name })) },
            {
              id: 'links', title: 'Quick Links', links: [
                { to: '/businesses', label: 'Browse Businesses' },
                { to: '/franchises', label: 'Franchise Opportunities' },
                { to: '/add-business-listing', label: 'Sell Your Business' },
                { to: '/financing-options', label: 'Financing Options' },
              ]
            },
            {
              id: 'resources', title: 'Resources & Legal', links: [
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Support' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
              ]
            },
          ].map((section) => (
            <div key={section.id} className="border-b border-white/10">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full py-3 text-left"
              >
                <span className="font-semibold text-white">{section.title}</span>
                {expandedSection === section.id ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {expandedSection === section.id && (
                <ul className="space-y-2 pb-3">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        to={link.to}
                        className="text-sm text-slate-400 hover:text-growth-green transition-colors"
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
              <span className="font-semibold text-white">Contact Us</span>
              {expandedSection === 'contact' ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {expandedSection === 'contact' && (
              <ul className="space-y-3 pb-3">
                <li className="flex items-start gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-growth-green" />
                  <span>123 Business Hub, MG Road, Bangalore 560001</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="h-4 w-4 flex-shrink-0 text-growth-green" />
                  <a href="mailto:support@bizsearch.in">support@bizsearch.in</a>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone className="h-4 w-4 flex-shrink-0 text-growth-green" />
                  <a href="tel:+911800123456">+91 1800 123 456</a>
                </li>
              </ul>
            )}
          </div>
        </div>

        <Separator className="bg-white/10 mb-6" />

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-md border border-white/10">
            <Shield className="h-5 w-5 text-growth-green flex-shrink-0" />
            <span className="text-xs text-slate-300">Listing moderation</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-md border border-white/10">
            <Lock className="h-5 w-5 text-slate-300 flex-shrink-0" />
            <span className="text-xs text-slate-300">Secure platform</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-md border border-white/10">
            <CheckCircle className="h-5 w-5 text-growth-green flex-shrink-0" />
            <span className="text-xs text-slate-300">Verification levels</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-md border border-white/10">
            <Award className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <span className="text-xs text-slate-300">Transparent listings</span>
          </div>
        </div>

        <Separator className="bg-white/10 mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle className="h-4 w-4 text-growth-green" />
            <span>Listings reviewed before publication where moderation is enabled</span>
          </div>
          <p className="text-sm text-slate-400 text-center">
            © {currentYear} BizSearch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
