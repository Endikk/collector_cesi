import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "@/components/layout/Provider";
import NavBar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collector",
  description: "La marketplace de référence pour les collectionneurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <Provider>
          <NavBar />
          <main className={inter.className}>{children}</main>
        </Provider>
      </body>
    </html>
  );
}
