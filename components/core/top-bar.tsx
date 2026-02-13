"use client";
import { ChartColumnIncreasing } from "lucide-react";
import { Button } from "../ui/button";
import Container from "./Container";
import ThemeToggle from "./theme-toggle";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";

export default function TopBar() {
  const { user } = useAuthStore();
  const { data: session, isPending } = authClient.useSession();
  const openSignInModal = useAuthStore((state) => state.openSignInModal);

  const isAdmin = user?.role === "ADMIN";

  return (
    <Container className="py-4 px-20 border-b">
      <div className="flex items-center justify-between">
        <div className="text-center font-poppins font-semibold">
          <span className="text-primary">DStudio</span>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <>
              <Button>Dashboard Manager</Button>
              <Button>
                <ChartColumnIncreasing />
                Admin Dashboard
              </Button>
            </>
          )}
          <Button
            onClick={() => {
              if (session) {
                authClient.signOut();
              } else {
                openSignInModal();
              }
            }}
            disabled={isPending}
          >
            {session ? "Sign-Out" : "Sign-In"}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </Container>
  );
}
