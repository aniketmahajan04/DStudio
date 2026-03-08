import Container from "@/components/core/Container";
import { LandingPage } from "@/components/landing-page";
import { auth } from "@/lib/auth";
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
    <Container className="min-h-0">
      <LandingPage />
    </Container>
  );
}
