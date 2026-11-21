import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import resume from "@/data/resume.json";
import SmoothScroll from "@/components/SmoothScroll";
import { VIEW_SCRIPT } from "@/lib/viewScript";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${resume.name} | ${resume.title}`,
  description: resume.tagline,
  openGraph: {
    title: `${resume.name} | ${resume.title}`,
    description: resume.tagline,
    type: "profile",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Picks the anime or plain version before first paint; see lib/view.ts and lib/viewScript.ts. */}
        <script dangerouslySetInnerHTML={{ __html: VIEW_SCRIPT }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
