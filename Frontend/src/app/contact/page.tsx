'use client';

import { useState } from 'react';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock, MessageCircle, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { CONTACT_INFO, FOOTER_LINKS } from '@/lib/constants';
import { toast } from 'sonner';

export default function ContactPage() {
  const isAuthenticated = true;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Message sent successfully! We\'ll get back to you within 24-48 hours.');
    setIsSubmitting(false);

    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <Header isAuthenticated={isAuthenticated} />

      <main className="container max-w-screen-2xl px-4 py-12 mt-32">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-block">
            <h1 className="text-4xl md:text-6xl font-bold ">
              Get in Touch
            </h1>
          </div>
          <p className="text-muted-foreground text-xl text-shadow-xs max-w-3xl mx-auto leading-relaxed">
            Have questions about CineStream? Need help with your account?
            We're here to help you get the most out of your streaming experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="relative w-full rounded-xl border bg-card dark:bg-transparent p-1.5 shadow-sm backdrop-blur-xl">
              {/* Glass effect gradient */}
              <div
                aria-hidden="true"
                className="-z-10 absolute inset-x-0 top-0 h-48 rounded-[inherit]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)",
                }}
              />
              <div className="relative mb-4 rounded-xl border bg-muted/50 p-6 shadow">
                <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
                <p className="text-muted-foreground text-xs">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>
              <div className="space-y-6 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">
                        First Name *
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Last Name *
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category *
                    </label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="content">Content Feedback</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      required
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold shadow bg-gradient-to-b from-red-500 to-red-600 shadow-red-500 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    We typically respond within {CONTACT_INFO.responseTime}
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="relative w-full rounded-xl border bg-card dark:bg-transparent p-1.5 shadow-sm backdrop-blur-xl">
              <div
                aria-hidden="true"
                className="-z-10 absolute inset-x-0 top-0 h-48 rounded-[inherit]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)",
                }}
              />
              <div className="relative mb-4 rounded-xl border bg-muted/50 p-4 shadow">
                <h3 className="text-xl font-bold mb-1">Contact Information</h3>
                <p className="text-muted-foreground text-xs">
                  Reach out to us through any of these channels
                </p>
              </div>
              <div className="space-y-4 p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-red-800 " />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{CONTACT_INFO.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-red-800 " />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{CONTACT_INFO.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-red-800 " />
                  <div>
                    <p className="font-medium">Support Hours</p>
                    <p className="text-sm text-muted-foreground">{CONTACT_INFO.supportHours}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 shadow text-red-800 " />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{CONTACT_INFO.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Chat */}
            <div className="relative w-full rounded-xl border bg-card dark:bg-transparent p-1.5 shadow-sm backdrop-blur-xl">
              <div
                aria-hidden="true"
                className="-z-10 absolute inset-x-0 top-0 h-48 rounded-[inherit]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)",
                }}
              />
              <div className="relative mb-4 rounded-xl border bg-muted/50 p-4 shadow">
                <h3 className="text-xl font-bold mb-1">Need Immediate Help?</h3>
                <p className="text-muted-foreground text-xs">
                  Chat with our support team in real-time
                </p>
              </div>
              <div className="p-4">
                <Button className="w-full h-11 shadow bg-gradient-to-b from-red-500 to-red-600 shadow-red-500 text-white">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Start Live Chat
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Available 24/7 for premium subscribers
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="relative w-full rounded-xl border bg-card dark:bg-transparent p-1.5 shadow-sm backdrop-blur-xl">
              <div
                aria-hidden="true"
                className="-z-10 absolute inset-x-0 top-0 h-48 rounded-[inherit]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)",
                }}
              />
              <div className="relative mb-4 rounded-xl border bg-muted/50 p-4 shadow">
                <h3 className="text-xl font-bold mb-1">Follow Us</h3>
                <p className="text-muted-foreground text-xs">
                  Stay connected on social media
                </p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {FOOTER_LINKS.social.map((social) => {
                    const iconMap = {
                      Facebook,
                      Twitter,
                      Instagram,
                      Youtube,
                    };
                    const IconComponent = iconMap[social.icon as keyof typeof iconMap];

                    return (
                      <Button
                        key={social.name}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                        asChild
                      >
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                          {social.name}
                        </a>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="relative w-full rounded-xl border bg-card dark:bg-transparent p-1.5 shadow-sm backdrop-blur-xl">
              <div
                aria-hidden="true"
                className="-z-10 absolute inset-x-0 top-0 h-48 rounded-[inherit]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)",
                }}
              />
              <div className="relative mb-4 rounded-xl border bg-muted/50 p-4 shadow">
                <h3 className="text-xl font-bold mb-1">Frequently Asked Questions</h3>
                <p className="text-muted-foreground text-xs">
                  Find quick answers to common questions
                </p>
              </div>
              <div className="p-4">
                <Button variant="outline" className="w-full h-11 border-2 hover:bg-accent/50 bg-gradient-to-b from-red-500 to-red-600 " asChild>
                  <a href="/help">
                    Visit Help Center
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center space-y-8">
          <h2 className="text-3xl font-bold">Other Ways to Reach Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-8 bg-card/50 backdrop-blur-sm rounded-xl border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <h3 className="font-bold text-lg mb-3">Account Issues</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Problems with login, billing, or subscription management
              </p>
              <Button variant="outline" size="sm" className="border-2 hover:bg-accent/50 bg-gradient-to-b from-red-500 to-red-600" asChild>
                <a href="/account">Manage Account</a>
              </Button>
            </div>

            <div className="p-8 bg-card/50 backdrop-blur-sm rounded-xl border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <h3 className="font-bold text-lg mb-3">Technical Support</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Streaming issues, app problems, or device compatibility
              </p>
              <Button variant="outline" size="sm" className="border-2 hover:bg-accent/50 bg-gradient-to-b from-red-500 to-red-600 " asChild>
                <a href="/help/technical">Technical Help</a>
              </Button>
            </div>

            <div className="p-8 bg-card/50 backdrop-blur-sm rounded-xl border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <h3 className="font-bold text-lg mb-3">Business Inquiries</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Partnerships, content licensing, or media requests
              </p>
              <Button variant="outline" size="sm" className="border-2 hover:bg-accent/50 bg-gradient-to-b from-red-500 to-red-600 " asChild>
                <a href="mailto:business@cinestream.com">Contact Business</a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}