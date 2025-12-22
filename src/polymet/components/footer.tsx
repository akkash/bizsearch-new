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
  CreditCard,
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
    toast.success("Successfully subscribed to newsletter!");
    setEmail("");
    setIsSubscribing(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200">
      {/* Newsletter Section */}
      <div className="border-b border-slate-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">
                Stay Updated with Business Opportunities
              </h3>
              <p className="text-sm text-slate-400">
                Get weekly insights on franchises, market trends, and investment opportunities
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 w-full md:w-64"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
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
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">BizSearch</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              India's leading marketplace for buying, selling, and investing in
              verified businesses and franchise opportunities.
            </p>
            <div className="flex gap-2">
              <a
                href="https://facebook.com/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-blue-600 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-blue-400 rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-blue-700 rounded-full transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-pink-600 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@bizsearch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-red-600 rounded-full transition-colors"
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
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {industry.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/industries"
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
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
                  to="/businesses"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Browse Businesses
                </Link>
              </li>
              <li>
                <Link
                  to="/franchises"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Franchise Opportunities
                </Link>
              </li>
              <li>
                <Link
                  to="/franchise-map"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Franchise Map
                </Link>
              </li>
              <li>
                <Link
                  to="/add-business-listing"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Sell Your Business
                </Link>
              </li>
              <li>
                <Link
                  to="/financing-options"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Financing Options
                </Link>
              </li>
              <li>
                <Link
                  to="/advisors"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Find Advisors
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
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
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
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-400" />
                <span>
                  123 Business Hub, MG Road
                  <br />
                  Bangalore, Karnataka 560001
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 flex-shrink-0 text-blue-400" />
                <a
                  href="mailto:support@bizsearch.in"
                  className="hover:text-blue-400 transition-colors"
                >
                  support@bizsearch.in
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-4 w-4 flex-shrink-0 text-blue-400" />
                <a
                  href="tel:+911800123456"
                  className="hover:text-blue-400 transition-colors"
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
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">BizSearch</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              India's leading business & franchise marketplace
            </p>
            <div className="flex justify-center gap-2">
              <a href="https://facebook.com/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-blue-600 rounded-full"><Facebook className="h-4 w-4" /></a>
              <a href="https://twitter.com/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-blue-400 rounded-full"><Twitter className="h-4 w-4" /></a>
              <a href="https://linkedin.com/company/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-blue-700 rounded-full"><Linkedin className="h-4 w-4" /></a>
              <a href="https://instagram.com/bizsearch" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-pink-600 rounded-full"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>

          <Separator className="bg-slate-700" />

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
            <div key={section.id} className="border-b border-slate-700">
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
                        className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
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
          <div className="border-b border-slate-700">
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
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-400" />
                  <span>123 Business Hub, MG Road, Bangalore 560001</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="h-4 w-4 flex-shrink-0 text-blue-400" />
                  <a href="mailto:support@bizsearch.in">support@bizsearch.in</a>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone className="h-4 w-4 flex-shrink-0 text-blue-400" />
                  <a href="tel:+911800123456">+91 1800 123 456</a>
                </li>
              </ul>
            )}
          </div>
        </div>

        <Separator className="bg-slate-700 mb-6" />

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
            <Shield className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span className="text-xs text-slate-300">Verified Listings</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
            <Lock className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <span className="text-xs text-slate-300">Secure Transactions</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
            <CreditCard className="h-5 w-5 text-purple-400 flex-shrink-0" />
            <span className="text-xs text-slate-300">Safe Payments</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
            <Award className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <span className="text-xs text-slate-300">Trusted Platform</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-white">15,000+</div>
            <div className="text-xs text-slate-400">Franchise Brands</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">50,000+</div>
            <div className="text-xs text-slate-400">Business Listings</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">1,00,000+</div>
            <div className="text-xs text-slate-400">Active Investors</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">500+</div>
            <div className="text-xs text-slate-400">Cities Covered</div>
          </div>
        </div>

        <Separator className="bg-slate-700 mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>All businesses are verified and secure</span>
          </div>
          <p className="text-sm text-slate-400 text-center">
            © {currentYear} BizSearch. All rights reserved. Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}
