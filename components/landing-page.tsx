import {
  ArrowRight,
  BarChart3,
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
          <div className="mt-20 w-full overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
            <div className="h-8 bg-[#1f1f1f] border-b flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-600"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
            </div>
            <div className="relative w-full aspect-video min-h-[300px]">
              <Image
                src={heroImage}
                alt="DStudio database management preview"
                fill
                className="object-contain object-top-left"
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
                    <Icon className="w-6 h-6 text-emerald-500" />
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
    </div>
  );
}

export { LandingPage };
