import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  // Better Auth checks the cookies/headers automatically
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Now you have access to the user
  return NextResponse.json({
    message: `Hello ${session.user.name}`,
  });
}
