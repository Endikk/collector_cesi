import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "@/components/layout/Provider";
import NavBar from "@/components/layout/Navbar";
import { Footer } from "@/app/_components/Footer";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SkipToContent } from "@/components/common/SkipToContent";
import { AccessibilityProvider } from "@/components/common/AccessibilityProvider";
import { RouteAnnouncer } from "@/components/common/RouteAnnouncer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collector",
  description: "La marketplace de référence pour les collectionneurs.",
  icons: {
    icon: '/collector.svg',
    apple: '/collector.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <LocaleProvider locale={locale} messages={messages}>
          <AccessibilityProvider>
            <SkipToContent />
            <RouteAnnouncer />
            <Provider>
              <NavBar />
              <main id="main-content">{children}</main>
              <Footer />
            </Provider>
          </AccessibilityProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
