import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroCanvas from "@/assets/hero-canvas.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/8 blur-[120px]" />

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground opacity-0 animate-fade-up"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Open-source collaborative whiteboard
          </div>

          {/* Heading */}
          <h1
            className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl opacity-0 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Think together.{" "}
            <span className="text-primary">Draw together.</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-pretty mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground opacity-0 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            A hand-drawn style whiteboard for your team. Sketch ideas,
            wireframes, and diagrams — real-time, infinite canvas, zero friction.
          </p>

          {/* CTAs */}
          <div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row opacity-0 animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            <Button variant="hero" size="xl">
              Open Canvas <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="hero-outline" size="xl">
              <Play className="mr-1 h-4 w-4" /> Watch Demo
            </Button>
          </div>

          {/* Social proof */}
          <p
            className="mt-8 text-sm text-muted-foreground opacity-0 animate-fade-up"
            style={{ animationDelay: "400ms" }}
          >
            Trusted by <span className="font-semibold text-foreground">2,847</span> teams worldwide
          </p>
        </div>

        {/* Hero image */}
        <div
          className="relative mx-auto mt-16 max-w-5xl opacity-0 animate-fade-up"
          style={{ animationDelay: "500ms" }}
        >
          <div className="overflow-hidden rounded-2xl border border-border shadow-2xl shadow-primary/5">
            <img
              src={heroCanvas.src}
              alt="SketchFlow collaborative whiteboard interface"
              className="w-full"
              loading="eager"
            />
          </div>
          {/* Reflection glow */}
          <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 h-32 w-3/4 bg-primary/10 blur-[60px]" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
