"use client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button, buttonVariants } from "../ui/button";
import { Github } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";

function SignIn({
  triggerLable = "Sign In",
  showTrigger = true,
}: {
  triggerLable?: string;
  showTrigger?: boolean;
}) {
  const { isSignInModalOpen, closeSignInModal, openSignInModal } =
    useAuthStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) closeSignInModal();
    else openSignInModal();
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      // Use full URL for callbackURL to ensure proper redirect
      const callbackURL =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard`
          : "/dashboard";

      await authClient.signIn.social({
        provider,
        callbackURL,
      });
    } catch (err) {
      console.error("Social sign-in failed:", err);
    }
  };

  return (
    <Dialog open={isSignInModalOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger className={cn(buttonVariants({ variant: "default" }))}>
          {triggerLable}
        </DialogTrigger>
      )}

      <DialogContent
        className={
          "font-poppins rounded-node rounded-t-xl px-0 sm:max-w-lg md:rounded-2xl"
        }
      >
        <DialogHeader className="px-6 pt-6 text-left">
          <DialogTitle className={"font-semibold tracking-tight"}>
            Sign In to Continue
          </DialogTitle>
          <DialogDescription className={"text-muted-foreground text-base"}>
            Access your account and add new connections.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 px-6">
          <div className="flex flex-col gap-4">
            <Button onClick={() => handleSocialLogin("google")}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
            <div className="text-muted-foreground flex items-center gap-3 text-xs font-semibold uppercase tracking-tight">
              <span className="bg-border h-px flex-1" />
              or
              <span className="bg-border h-px flex-1" />
            </div>
            <Button onClick={() => handleSocialLogin("github")}>
              <Github />
              Continue with Github
            </Button>
          </div>
        </div>

        <DialogFooter className="border-border/70 text-muted-foreground inline border-t px-4 py-2 text-center text-sm text-pretty">
          By continuing, you agree to our{" "}
          <Link className="cursor-pointer font-medium underline" href="/term">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            className="cursor-pointer font-medium  underline"
            href="/privacy"
          >
            Privacy Policy
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { SignIn };
