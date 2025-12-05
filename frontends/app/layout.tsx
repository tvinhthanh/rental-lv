import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/layouts/header";
import Footer from "@/components/layouts/footer";

import { ThemeProvider } from "@/providers/theme-provider";
import { ReduxProvider } from "@/providers/redux-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/hooks/auth/use-auth";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Toaster } from "@/components/ui/toaster";
import GlobalLoading from "@/components/common/global-loading";

export const metadata: Metadata = {
  title: "Rental System",
  description: "Car Rental Platform using Next.js 16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-background text-foreground">

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ReduxProvider>
            <QueryProvider>
              <SettingsProvider>
                <AuthProvider>
                  <Header />
                  <GlobalLoading />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <Footer />
                  <Toaster />
                </AuthProvider>
              </SettingsProvider>
            </QueryProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
