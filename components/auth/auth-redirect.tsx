"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

export function AuthRedirect({ redirectTo }: { redirectTo: string }) {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    // Redirect immediately when session is detected
    if (session?.user) {
      // Use window.location as a more forceful redirect
      window.location.href = redirectTo;
    }
  }, [session, redirectTo]);

  return null;
}
