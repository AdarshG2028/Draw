"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="cta" className="py-24 md:py-32">
      <div className="container">
        <div
          ref={ref}
          className={`relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card p-12 text-center transition-all duration-700 md:p-16 ${
            visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-[4px]"
          }`}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-40 w-80 bg-primary/10 blur-[80px]" />

          <h2 className="relative text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to sketch your next big idea?
          </h2>
          <p className="relative mt-4 text-muted-foreground">
            Free forever for individuals. No credit card, no sign-up wall — just open and draw.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="hero" size="xl">
              Launch Canvas <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
