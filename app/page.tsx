import Container from "@/components/core/Container";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { ArrowRight, Zap } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Redirect if session exists - redirect() throws a special error that Next.js catches
    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <Container>
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
                                A powerful, intuitive GUI for PostgreSQL that
                                brings the elegance of MongoDB Compass to the
                                world of relational databases. Manage your data
                                with confidence.
                            </p>
                            <div className="flex items-center justify-center">
                                <Button className="px-8 py-6 text-lg rounded-lg transition-all transform hover:scale-105 gap-2">
                                    Get Started{" "}
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Hero image Preview */}
                        <div className="mt-20 relative">
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                                              <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                                                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                                                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                                                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                                              </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Container>
    );
}
