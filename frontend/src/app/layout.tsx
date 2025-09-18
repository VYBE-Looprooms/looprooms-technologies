import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import LayoutWrapper from "@/components/layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vybe - Feel better, together",
  description:
    "Mood-guided rooms and creator content that help you grow. Join Vybe for positive-only interactions, verified creators, and guided personal development.",
  keywords:
    "mental health, wellness, community, creators, mood, personal growth",
  authors: [{ name: "Vybe Team" }],
  openGraph: {
    title: "Vybe - Feel better, together",
    description: "Mood-guided rooms and creator content that help you grow.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="colorful"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "colorful", "system"]}
        >
          <LayoutWrapper>{children}</LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
