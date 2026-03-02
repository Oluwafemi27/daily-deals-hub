import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Daily Deals Hub</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted marketplace for daily deals, connecting buyers and sellers seamlessly.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                  Categories
                </a>
              </li>
              <li>
                <a href="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Sign Up
                </a>
              </li>
              <li>
                <a href="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Sign In
                </a>
              </li>
              <li>
                <a href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Seller & Driver */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">For Sellers & Drivers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/auth?mode=seller" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  → Become a Seller
                </a>
              </li>
              <li>
                <a href="/driver-auth" className="text-muted-foreground hover:text-primary transition-colors font-medium text-orange-600">
                  → Join as Driver
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Seller Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Driver Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:support@dailydealshub.com" className="text-muted-foreground hover:text-primary transition-colors">
                  support@dailydealshub.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+1234567890" className="text-muted-foreground hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">123 Commerce St, Trade City, TC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p>
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              {" • "}
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              {" • "}
              <a href="#" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </p>
          </div>
          <div className="text-center">
            <p>&copy; {currentYear} Daily Deals Hub. All rights reserved.</p>
          </div>
          <div className="text-right space-y-2">
            <p>
              <a href="/admin" className="hover:text-primary transition-colors">
                Admin Panel
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
