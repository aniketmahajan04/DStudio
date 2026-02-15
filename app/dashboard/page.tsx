import Container from "@/components/core/Container";
import SideBar from "@/components/core/side-bar";

import { StatusLine } from "@/components/core/statusLine";
import { MainContentBar } from "@/components/maincontent/main-content-bar";

import { WorkspaceBar } from "@/components/workspace/workspace-bar";

import { auth } from "@/lib/auth";

import { headers } from "next/headers";

import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, boot them to the sign-in page

  if (!session?.user) {
    redirect("/");
  }

  return (
    <Container>
      {/* <SideBar /> */}

      {/* Main content area: workspace-bar | main content (ml-16 for fixed sidebar) */}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (fixed) */}

        <SideBar />

        {/* Workspace Bar - beside side-bar */}

        <WorkspaceBar />

        {/* Main Content Area - beside workspace-bar */}

        <div className="flex-1 overflow-auto">
          {/* Editor, results, etc. */}

          <div className="h-full bg-muted/20 flex flex-col">
            <MainContentBar />
            <p className="text-muted-foreground">Main Content Area</p>
          </div>
        </div>
      </div>

      {/* Status Line - pinned at bottom */}

      <div className="mt-auto shrink-0">
        <StatusLine />
      </div>
    </Container>
  );
}
