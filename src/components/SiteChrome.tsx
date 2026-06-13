"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Category } from "@/types/database";

type Props = {
  categories?: Category[];
  children: React.ReactNode;
};

// /admin 配下はAdminShellが独自レイアウトを持つため、公開サイトのHeader/Footerを表示しない
export default function SiteChrome({ categories = [], children }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header categories={categories} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
