import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/public/Navbar";
import { HeroBanner } from "@/components/public/HeroBanner";
import { FeaturedMagazine } from "@/components/public/FeaturedMagazine";
import { PreviousMagazines } from "@/components/public/PreviousMagazines";
import { ChurchInfoSection } from "@/components/public/ChurchInfoSection";
import { Footer } from "@/components/public/Footer";
import { ChurchSettings, Magazine } from "@/lib/types";

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

  // 2. Fetch the featured (current/latest) published magazine
  const { data: featuredData } = await supabase
    .from("magazines")
    .select("*")
    .eq("status", "published")
    .lte("publish_at", now)
    .order("lesson_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1);

  const featuredMagazine = featuredData && featuredData.length > 0 ? (featuredData[0] as Magazine) : null;

  // 3. Fetch previous published magazines (excluding the featured one if exists)
  let previousMagazines: Magazine[] = [];
  if (featuredMagazine) {
    const { data: prevData } = await supabase
      .from("magazines")
      .select("*")
      .eq("status", "published")
      .lte("publish_at", now)
      .neq("id", featuredMagazine.id)
      .order("lesson_date", { ascending: false })
      .limit(6);

    previousMagazines = (prevData as Magazine[]) || [];
  }

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
          sundayDate={featuredMagazine?.lesson_date}
        />

        <FeaturedMagazine magazine={featuredMagazine} />

        {previousMagazines.length > 0 && (
          <PreviousMagazines magazines={previousMagazines} showViewAllLink={true} />
        )}

        <ChurchInfoSection settings={settings} />
      </main>

      <Footer churchName={settings?.church_name} />
    </div>
  );
}
