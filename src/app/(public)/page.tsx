import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/public/Navbar";
import { HeroBanner } from "@/components/public/HeroBanner";
import { StudentClassPortal } from "@/components/public/StudentClassPortal";
import { ChurchInfoSection } from "@/components/public/ChurchInfoSection";
import { Footer } from "@/components/public/Footer";
import { ChurchSettings, EbdClass, Magazine } from "@/lib/types";

export const revalidate = 60; // Revalidate public cache every 60 seconds

export default async function HomePage() {
  const supabase = createClient();
  const now = new Date().toISOString();

  // 1. Fetch church settings
  const { data: settingsData } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "general")
    .single();

  const settings = settingsData as ChurchSettings | null;

  // Each student sees material grouped by the class selected in their browser.
  const [{ data: classesData }, { data: magazinesData }] = await Promise.all([
    supabase.from("classes").select("*").eq("is_active", true).order("sort_order").order("name"),
    supabase.from("magazines").select("*").eq("status", "published").lte("publish_at", now)
      .order("lesson_date", { ascending: false }).order("created_at", { ascending: false }),
  ]);
  const classes = (classesData as EbdClass[]) || [];
  const magazines = (magazinesData as Magazine[]) || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar churchName={settings?.church_name} />

      <main className="flex-1">
        <HeroBanner
          title={settings?.banner_title}
          subtitle={settings?.banner_subtitle}
          bannerImageUrl={settings?.banner_image_url}
          serviceTimes={settings?.service_times}
          churchAddress={settings?.church_address}
          sundayDate={magazines[0]?.lesson_date}
        />

        <StudentClassPortal classes={classes} magazines={magazines} />

        <ChurchInfoSection settings={settings} />
      </main>

      <Footer churchName={settings?.church_name} />
    </div>
  );
}
