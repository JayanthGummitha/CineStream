import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { FOOTER_LINKS, CONTACT_INFO } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container max-w-screen-2xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5  lg:justify-items-center  gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl">CineStream</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Stream thousands of movies and TV shows instantly. Premium entertainment
              at your fingertips, anywhere, anytime.
            </p>
            <div className="flex space-x-4">
              {FOOTER_LINKS.social.map((social) => {
                const iconMap = {
                  Facebook,
                  Twitter,
                  Instagram,
                  Youtube,
                };
                const IconComponent = iconMap[social.icon as keyof typeof iconMap];

                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4 grid justify-items-start">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 grid justify-items-start">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4 grid justify-items-start">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 grid justify-items-start">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

          {/* Legal Links */}
          <div className="space-y-4 grid justify-items-start">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 grid justify-items-start">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 grid justify-items-start">
            <div className="pt-2 space-y-2 ">
              <h3 className="font-semibold">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <p 
                    className=" text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Email: {CONTACT_INFO.email}
                  </p>
                </li>
                <li>

                  <p 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Support: {CONTACT_INFO.supportHours}
                  </p>
                </li>
              </ul>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CineStream. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Available on all devices</span>
              <span>•</span>
              <span>4K Ultra HD</span>
              <span>•</span>
              <span>Dolby Atmos</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}