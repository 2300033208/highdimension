import { Card, Input, Button } from "@/components/ui/primitives";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { useState } from "react";

export function ContactUsPanel() {
  const [sent, setSent] = useState(false);

  return (
    <div className="h-full flex flex-col p-6 sm:p-10">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink mb-4">Get in Touch</h2>
        <p className="text-ink-dim text-lg max-w-2xl mx-auto leading-relaxed">
          Have questions about our platform, need help configuring a benchmark, or want to explore an institutional partnership? We're here to help.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 grid md:grid-cols-2 gap-10">

        {/* Contact Form */}
        <Card className="bg-[var(--color-glass-bg)] border-[var(--color-glass-border)] p-8">
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                <Send className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-ink">Message Sent!</h3>
              <p className="text-ink-dim">We'll get back to you within 24 hours.</p>
              <Button variant="outline" className="mt-4 border-[var(--color-glass-border)] text-ink" onClick={() => setSent(false)}>
                Send Another
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Name</label>
                <Input required placeholder="Dr. Alan Turing" className="bg-[var(--color-glass-input)] border-[var(--color-glass-input-border)] text-ink placeholder:text-ink-faint" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Email</label>
                <Input required type="email" placeholder="alan@institute.edu" className="bg-[var(--color-glass-input)] border-[var(--color-glass-input-border)] text-ink placeholder:text-ink-faint" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-xl bg-[var(--color-glass-input)] border-[var(--color-glass-input-border)] px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent/60 transition-colors"
                  placeholder="How can we help you..."
                />
              </div>
              <Button type="submit" className="w-full bg-[var(--color-accent)] text-white hover:opacity-90">
                Send Message
              </Button>
            </form>
          )}
        </Card>

        {/* Contact Details */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[var(--color-glass-hover)] transition-colors">
            <div className="h-12 w-12 rounded-full bg-[var(--color-accent)/20] flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-ink mb-1">Email Us</h4>
              <p className="text-ink-dim text-sm">For general inquiries and support.</p>
              <a href="mailto:contact@hyperbench.ai" className="text-[var(--color-accent)] hover:underline text-sm mt-1 inline-block">contact@hyperbench.ai</a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[var(--color-glass-hover)] transition-colors">
            <div className="h-12 w-12 rounded-full bg-[var(--color-success)/20] flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5 text-[var(--color-success)]" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-ink mb-1">Community Discord</h4>
              <p className="text-ink-dim text-sm">Join the discussion with other researchers.</p>
              <a href="#" className="text-[var(--color-success)] hover:underline text-sm mt-1 inline-block">discord.gg/hyperbench</a>
            </div>
          </div>


        </div>

      </div>
    </div>
  );
}
