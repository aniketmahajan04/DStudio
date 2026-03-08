import {
  ArrowRight,
  BarChart3,
  Check,
  Database,
  GitBranch,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import heroImage from "@/app/public/hero.png";

function LandingPage() {
  const features = [
    {
      icon: Database,
      title: "Multi-Database Support",
      description:
        "Connect to PostgreSQL, MySQL, and SQLite databases with ease. Manage all your databases from one unified interface.",
    },
    {
      icon: Search,
      title: "Advanced Data Explorer",
      description:
        "Browse, filter, and search your data with lightning-fast queries. Navigate through millions of rows effortlessly.",
    },
    {
      icon: GitBranch,
      title: "Visual Schema Designer",
      description:
        "Visualize relationships and design schemas with an intuitive drag-and-drop interface. See your database structure at a glance.",
    },
    {
      icon: Zap,
      title: "Query Builder",
      description:
        "Build complex SQL queries visually without writing code. Perfect for both beginners and experts.",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "Monitor performance metrics, track queries, and analyze database health with comprehensive dashboards.",
    },
    {
      icon: Shield,
      title: "Secure Connections",
      description:
        "Enterprise-grade security with encrypted connections. Your credentials are always protected.",
    },
  ];

  const highlights = [
    "Three-pane layout for efficient workflow",
    "Dark mode optimized for long sessions",
    "Real-time query history tracking",
    "Export data in multiple formats",
    "Collaborative team features",
    "Cross-platform compatibility",
  ];

  return (
    <div className="min-h-screen bg-background overflow-auto font-poppins">
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full text-muted-foreground text-sm mb-8">
              <Zap className="w-4 h-4" />
              <span>Modern Database Management</span>
            </div>
            <h1 className="text-6xl font-bold mb-6">
              Database Management
              <br /> Reimagined
            </h1>
            <p className="text-xl text-muted-foreground/80 mb-12 leading-relaxed">
              A powerful, intuitive GUI for PostgreSQL that brings the elegance
              of MongoDB Compass to the world of relational databases. Manage
              your data with confidence.
            </p>
            <div className="flex items-center justify-center">
              <Button className="px-8 py-6 text-lg rounded-lg transition-all transform hover:scale-105 gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Hero image Preview */}
          <div className="mt-20 w-full overflow-hidden rounded-xl border border-border bg-background/40 shadow-2xl backdrop-blur">
            <div className="h-8 bg-[#1f1f1f] border-b border-border/60 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-600"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
            </div>
            <div
              className="relative w-full min-h-[300px] bg-background"
              style={{ aspectRatio: `${heroImage.width}/${heroImage.height}` }}
            >
              <Image
                src={heroImage}
                alt="DStudio database management preview"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section  */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to manage you database efficiently.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary/10">
                    <Icon className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Highlight section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-br from-background to-secondary border border-border rounded-2xl p-12">
            <div className="grid mg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Built for Developers
                </h2>
                <p className="text-muted-foreground mb-8">
                  DStudio combines the power of professional database tools with
                  the simplicity of modern design. Work faster, smarter, and
                  with confidence.
                </p>
              </div>
              <div className="space-y-3">
                {highlights.map((highligh, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-muted-foreground">{highligh}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who trust DStudio for their database
            management needs.
          </p>
        </div>
      </section>

      {/* Footer  */}
      <section className="border-t border border-border py-12 px-6 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                  <svg
                    viewBox="0 0 140 140"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="DStudio terminal S logo"
                    className="w-8 h-8 text-secondary-foreground"
                  >
                    <rect
                      x="10"
                      y="10"
                      width="120"
                      height="120"
                      rx="20"
                      fill="none"
                    />

                    <path
                      d="M90 32C90 18 50 18 50 34C50 48 90 48 90 62C90 76 50 76 50 90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <rect
                      x="96"
                      y="72"
                      width="6"
                      height="28"
                      rx="3"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="text-xl font-semibold">DStudio</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Modern database management for the modern developer. Powerful,
                intuitive, and built for productivity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-muted-foreground/80 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-muted-foreground/80 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-muted-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-secondary-foreground">
            <p>&copy; 2026 DStudio. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export { LandingPage };
