import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import TopBar from "@/components/core/top-bar";
import { SignIn } from "@/components/auth/sign-in";
import { AuthSyncProvider } from "@/components/providers/AuthProviders";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "DStudio",
  description: "Web based database studio for postgres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased flex flex-col min-h-screen overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSyncProvider>
            <TopBar />
            <SignIn showTrigger={false} />
            {children}
          </AuthSyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
