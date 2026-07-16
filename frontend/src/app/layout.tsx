import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "rentoX - Vehicle Rental Platform",
    template: "%s | rentoX",
  },
  description: "Rent vehicles easily with rentoX. Browse, book, and manage your vehicle rentals.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "rentoX - Vehicle Rental Platform",
    description: "Rent vehicles easily with rentoX. Browse, book, and manage your vehicle rentals.",
    type: "website",
    locale: "en_IN",
    siteName: "rentoX",
  },
  twitter: {
    card: "summary_large_image",
    title: "rentoX - Vehicle Rental Platform",
    description: "Rent vehicles easily with rentoX. Browse, book, and manage your vehicle rentals.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
