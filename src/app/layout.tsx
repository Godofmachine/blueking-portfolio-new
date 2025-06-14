import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BackToTop } from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "Blueking",
  description: "Graphic Designer & Front end Dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <link rel="stylesheet" href="/css/face-style.css" /> */}
      </head>
      <body className="w-screen overflow-x-hidden">
        <Providers>
          {children}
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
