import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { StudentClassPortal } from "@/components/public/StudentClassPortal";
import { ChurchSettings, EbdClass, Magazine } from "@/lib/types";

export const revalidate = 60;

export default async function MinhaClassePage() {
  const supabase = createClient();
  const now = new Date().toISOString();
  const [{ data: settingsData }, { data: classesData }, { data: magazinesData }] = await Promise.all([
    supabase.from("settings").select("*").eq("id", "general").single(),
    supabase.from("classes").select("*").eq("is_active", true).order("sort_order").order("name"),
    supabase.from("magazines").select("*").eq("status", "published").lte("publish_at", now)
      .order("lesson_date", { ascending: false }).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar churchName={(settingsData as ChurchSettings | null)?.church_name} />
      <main className="flex-1 py-8">
        <StudentClassPortal classes={(classesData as EbdClass[]) || []} magazines={(magazinesData as Magazine[]) || []} />
      </main>
      <Footer churchName={(settingsData as ChurchSettings | null)?.church_name} />
    </div>
  );
}
