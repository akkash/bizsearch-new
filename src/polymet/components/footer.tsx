import React from "react";
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
  Shield,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">BizSearch</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              India's leading marketplace for buying, selling, and investing in
              verified businesses and franchise opportunities.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-blue-600 rounded-full transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-blue-400 rounded-full transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-blue-700 rounded-full transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-pink-600 rounded-full transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
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
                  to="/add-business-listing"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  List Your Business
                </Link>
              </li>
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
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
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
                  to="/cookie-policy"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Cookie Policy
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

        <Separator className="bg-slate-700 mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Shield className="h-4 w-4 text-blue-400" />
            <span>All businesses are verified and secure</span>
          </div>
          <p className="text-sm text-slate-400">
            © {currentYear} BizSearch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
