import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminShell from "./AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "管理画面", template: "%s | 管理画面" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
