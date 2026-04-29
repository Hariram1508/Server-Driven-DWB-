import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Toaster } from "sonner";
import { React19WarningFilter } from "@/components/React19WarningFilter";
import { GoogleAnalyticsLoader } from "@/components/GoogleAnalyticsLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CampusSync | Server-Driven University Websites",
  description:
    "A modern server-driven platform for university websites, campus pages, and institutional publishing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="suppress-wallet-error"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const msg = String(args[0] || '');
                  if (msg.includes('WELLDONE') || msg.includes('Wallet') || msg.includes('not initialized')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const msg = String(args[0] || '');
                  if (msg.includes('WELLDONE') || msg.includes('Wallet') || msg.includes('not initialized')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <React19WarningFilter />
          <GoogleAnalyticsLoader />
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
