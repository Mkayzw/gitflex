import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitFlex - GitHub Profile Analyzer",
  description: "Analyze GitHub profiles and spot commit farmers with beautiful visualizations",
  keywords: ["GitHub", "developer", "metrics", "analysis", "commit farming", "code quality"],
  authors: [{ name: "GitFlex Team" }],
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#0ea5e9" }, { media: "(prefers-color-scheme: dark)", color: "#0284c7" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
