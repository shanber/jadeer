import type { Metadata } from "next";
import { Tajawal, Inter } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  weight: ["300", "400", "500", "700", "800", "900"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "جدير | JADEER - أداة تقييم السير الذاتية بالذكاء الاصطناعي",
  description:
    "قيّم سيرتك الذاتية فوراً مجاناً وتأكد من مطابقتها لأنظمة الفرز (ATS) والمعايير السعودية المحترفة مع استوديو جدير للهوية المهنية.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
