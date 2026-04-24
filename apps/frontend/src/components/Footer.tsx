import { Pencil } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="container flex flex-col items-center justify-between gap-6 sm:flex-row">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Pencil className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold">SketchFlow</span>
      </div>
      <p className="text-xs text-muted-foreground">
        © 2026 SketchFlow. Open-source under MIT License.
      </p>
      <div className="flex gap-6 text-xs text-muted-foreground">
        <a href="#" className="transition-colors hover:text-foreground">GitHub</a>
        <a href="#" className="transition-colors hover:text-foreground">Docs</a>
        <a href="#" className="transition-colors hover:text-foreground">Twitter</a>
      </div>
    </div>
  </footer>
);

export default Footer;
