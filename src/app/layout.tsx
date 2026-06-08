import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "ポイントナビJapan | 日本のポイ活を徹底ナビゲート",
  description:
    "楽天ポイント・dポイント・Pontaポイントなど日本主要ポイントプログラムを比較。ポイ活の基礎から上級テクニックまでわかりやすく解説します。",
  keywords: "ポイ活, ポイントプログラム, 楽天ポイント, dポイント, Pontaポイント, ポイント比較",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} bg-gray-50 text-gray-900 antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
