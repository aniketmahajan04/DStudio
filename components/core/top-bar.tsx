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
        <div className="flex items-center gap-2 font-poppins font-semibold">
          <div className="w-8 h-8 shrink-0 bg-background rounded-lg flex items-center justify-center">
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
