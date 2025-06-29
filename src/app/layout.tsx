import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OREMA Tanger Camping | ملتقى أوريما للمخيمات",
  description: "نظام تسجيل ملتقى أوريما الصيفي - تجربة مخيم لا تُنسى في طنجة | OREMA Tanger Summer Camp Registration System",
  keywords: "OREMA, camping, Tanger, Morocco, summer camp, ملتقى, مخيم صيفي, طنجة, المغرب",
  authors: [{ name: "OREMA Team" }],
  creator: "OREMA",
  publisher: "OREMA",
  robots: "index, follow",
  openGraph: {
    title: "OREMA Tanger Camping | ملتقى أوريما للمخيمات",
    description: "انضم إلينا في مغامرة صيفية لا تُنسى! سجل الآن في ملتقى أوريما الصيفي بطنجة",
    type: "website",
    locale: "ar_MA",
    siteName: "OREMA Tanger Camping",
  },
  twitter: {
    card: "summary_large_image",
    title: "OREMA Tanger Camping | ملتقى أوريما للمخيمات",
    description: "انضم إلينا في مغامرة صيفية لا تُنسى! سجل الآن في ملتقى أوريما الصيفي بطنجة",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased main-app`}
      >
        <div className="main-app-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
