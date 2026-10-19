import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const themeBootstrap = `
(function(){try{
  var s=localStorage.getItem('rentox-theme');
  var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(d)document.documentElement.classList.add('dark');
}catch(e){}})();
`;

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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
