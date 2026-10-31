import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { PreviousMagazines } from "@/components/public/PreviousMagazines";
import { ChurchSettings, Magazine } from "@/lib/types";

export const revalidate = 60;

export default async function ArchivePage() {
  const supabase = createClient();
  const now = new Date().toISOString();

  // 1. Fetch church settings
  const { data: settingsData } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "general")
    .single();

  const settings = settingsData as ChurchSettings | null;

  // 2. Fetch all published magazines ordered by date
  const { data: magazinesData } = await supabase
    .from("magazines")
    .select("*")
    .eq("status", "published")
    .lte("publish_at", now)
    .order("lesson_date", { ascending: false });

  const magazines = (magazinesData as Magazine[]) || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar churchName={settings?.church_name} />

      <main className="flex-1">
        {/* Archive Header */}
        <div className="bg-gradient-to-r from-church-900 to-navy-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-church-300">
              Biblioteca Digital
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 mb-2">
              Arquivo Completo de Lições da EBD
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Pesquise e consulte as lições anteriores da Escola Bíblica Dominical da Primeira Igreja Batista de Cataguases.
            </p>
          </div>
        </div>

        <PreviousMagazines magazines={magazines} showViewAllLink={false} />
      </main>

      <Footer churchName={settings?.church_name} />
    </div>
  );
}
