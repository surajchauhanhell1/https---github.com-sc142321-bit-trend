import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Trendora</h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your ultimate destination for fashion and beauty. Quality products, 
              exceptional service, and trendsetting styles for everyone.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-primary-foreground/20 transition-[var(--transition-smooth)]"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-primary-foreground/20 transition-[var(--transition-smooth)]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-primary-foreground/10 rounded-full hover:bg-primary-foreground/20 transition-[var(--transition-smooth)]"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              {[
                { name: 'Men', href: '/men' },
                { name: 'Women', href: '/women' },
                { name: 'Cosmetics', href: '/cosmetics' },
                { name: 'About Us', href: '/about' },
                { name: 'Contact', href: '/contact' }
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block text-primary-foreground/80 hover:text-primary-foreground transition-[var(--transition-smooth)] text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Customer Service</h4>
            <div className="space-y-2">
              {[
                'Size Guide',
                'Return Policy',
                'Shipping Info',
                'FAQ',
                'Support'
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-primary-foreground/80 hover:text-primary-foreground transition-[var(--transition-smooth)] text-sm"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-foreground/60" />
                <span className="text-primary-foreground/80 text-sm">
                  123 Fashion Street, Mumbai, Maharashtra 400001
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-foreground/60" />
                <span className="text-primary-foreground/80 text-sm">
                  +91 98765 43210
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-foreground/60" />
                <span className="text-primary-foreground/80 text-sm">
                  hello@trendora.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/60 text-sm">
              © 2024 Trendora. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a 
                href="#" 
                className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-[var(--transition-smooth)]"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-[var(--transition-smooth)]"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;