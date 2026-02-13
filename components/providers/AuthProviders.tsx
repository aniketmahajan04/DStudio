"use client";

import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role === "ADMIN" ? "ADMIN" : "USER",
      });
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  return <>{children}</>;
}

export { AuthSyncProvider };
