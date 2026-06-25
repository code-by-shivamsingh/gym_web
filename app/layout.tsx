import type { Metadata } from "next";
import "./globals.css";
import GlobalToastProvider from "@/src/components/atoms/GlobalToastProvider";

const geistSans = {
  variable: "--font-geist-sans",
};

const geistMono = {
  variable: "--font-geist-mono",
};

export const metadata: Metadata = {
  title: "FORGE GYM",
  description:
    "FORGE GYM - Where Strength Meets Style. Unleash Your Potential with Us!",
  icons: {
    icon: "/gym-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <GlobalToastProvider />
      </body>
    </html>
  );
}
