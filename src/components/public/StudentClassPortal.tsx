"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap, UsersRound } from "lucide-react";
import { EbdClass, Magazine } from "@/lib/types";
import { FeaturedMagazine } from "./FeaturedMagazine";
import { PreviousMagazines } from "./PreviousMagazines";

export function StudentClassPortal({
  classes,
  magazines,
  archiveOnly = false,
}: {
  classes: EbdClass[];
  magazines: Magazine[];
  archiveOnly?: boolean;
}) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const selectedClass = classes.find((item) => item.id === selectedClassId);

  useEffect(() => {
    try {
      const savedClassId = localStorage.getItem("ebd-student-class");
      if (savedClassId && classes.some((item) => item.id === savedClassId)) setSelectedClassId(savedClassId);
    } catch {
      // Keep the first available class selected if browser storage is unavailable.
    }
  }, [classes]);

  const classMagazines = useMemo(
    () => magazines.filter((magazine) => magazine.class_id === selectedClassId),
    [magazines, selectedClassId]
  );
  const latestMagazine = archiveOnly ? null : classMagazines[0] || null;
  const archivedMagazines = archiveOnly
    ? classMagazines
    : classMagazines.filter((magazine) => magazine.id !== latestMagazine?.id);

  const changeClass = (classId: string) => {
    setSelectedClassId(classId);
    try {
      localStorage.setItem("ebd-student-class", classId);
    } catch {
      // The class selection still applies for the current visit.
    }
  };

  return (
    <>
      <section id="minha-classe" className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-7">
          <div className="mb-4 flex items-start gap-3 sm:mb-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-church-50 text-church-700"><GraduationCap className="h-5 w-5" /></div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-church-700">Espaço do aluno</span>
              <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{archiveOnly ? "Materiais da minha classe" : "Minha classe da EBD"}</h1>
              <p className="mt-1 text-sm text-slate-500">{selectedClass ? `Conteúdo da classe ${selectedClass.name}.` : "Escolha sua classe para encontrar as lições e revistas."} Sua escolha fica salva neste navegador.</p>
            </div>
          </div>
          {classes.length > 0 && (
            <label className="block w-full sm:max-w-sm">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Selecione sua classe</span>
              <span className="relative block">
                <UsersRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-church-600" />
                <select value={selectedClassId} onChange={(event) => changeClass(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 focus:border-church-500 focus:outline-none focus:ring-2 focus:ring-church-500/20">
                  {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </span>
            </label>
          )}
        </div>
      </section>

      {classes.length === 0 ? (
        <div className="mx-auto max-w-3xl px-4 pb-14 sm:px-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
            <BookOpen className="mx-auto mb-2 h-6 w-6" />As classes ainda não estão disponíveis. Peça à secretaria da EBD para configurar as turmas.
          </div>
        </div>
      ) : archiveOnly ? (
        <PreviousMagazines magazines={archivedMagazines} showViewAllLink={false} />
      ) : (
        <>
          <FeaturedMagazine magazine={latestMagazine} />
          {archivedMagazines.length > 0 && <PreviousMagazines magazines={archivedMagazines} showViewAllLink />}
        </>
      )}
    </>
  );
}
