
import { Link } from "react-router-dom";
import { FileText, Github, Twitter, Search } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t py-6 md:py-8">
      <div className="container flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">WitchCraft</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/ProjLab42/WitchCraft"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://www.google.com/search?q=extreme+go+horse"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Google Search</span>
            </a>
          </div>
          <div className="text-xs text-muted-foreground">
            &copy; {currentYear} WitchCraft. All rights reserved.
            <br />
            Licensed under the MIT License.
          </div>
        </div>
      </div>
    </footer>
  );
}
