import Container from "@/components/core/Container";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthRedirect } from "@/components/auth/auth-redirect";

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
      <AuthRedirect redirectTo="/user/dashboard" />
      <div>Home Page</div>
    </Container>
  );
}
