"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Menu, X, Sun, Moon } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);

  const toggleTheme = () => {
    setIsLight(!isLight);
    document.documentElement.classList.toggle("light");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Pencil className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">SketchFlow</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#preview" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Preview</a>
          <a href="#cta" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Button variant="ghost" size="sm">Sign up</Button>
          <Button variant="ghost" size="sm">Sign in</Button>
          <Button size="sm">Start Drawing</Button>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a href="#features" className="text-sm text-muted-foreground">Features</a>
            <a href="#preview" className="text-sm text-muted-foreground">Preview</a>
            <a href="#cta" className="text-sm text-muted-foreground">Pricing</a>
            <hr className="border-border/50" />
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
                {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <Button variant="ghost" size="sm" className="flex-1">Sign in</Button>
              <Button size="sm" className="flex-1">Start Drawing</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
