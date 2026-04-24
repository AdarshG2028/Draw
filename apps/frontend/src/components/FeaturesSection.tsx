"use client";

import { useRef, useEffect, useState } from "react";
import { Users, Infinity, Zap, Lock, Palette, Download } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Multiple cursors, live presence indicators, and instant sync across all participants.",
  },
  {
    icon: Infinity,
    title: "Infinite Canvas",
    description: "Zoom, pan, and expand without limits. Your ideas deserve room to breathe.",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description: "60fps rendering powered by Canvas API. No lag, even with thousands of elements.",
  },
  {
    icon: Lock,
    title: "End-to-End Encrypted",
    description: "Your sketches stay private. Full encryption by default, no exceptions.",
  },
  {
    icon: Palette,
    title: "Hand-drawn Aesthetic",
    description: "Rough.js-powered strokes give every shape that authentic whiteboard feel.",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "PNG, SVG, or clipboard. One click and your work travels with you.",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
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
    <div
      ref={ref}
      className={`group rounded-2xl border border-border bg-card p-7 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-5 blur-[4px]"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <feature.icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container">
        <div className="mx-auto mb-16 max-w-lg text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to sketch
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for teams who think visually. No bloat, just the tools that matter.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
