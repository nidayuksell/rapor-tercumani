import type { AnalysisResultRecete, ReaderMode, ReceteGunlukProgram, ReportSource } from "@/lib/types";
import {
  CardShell,
  Disclaimer,
  DoktoraSorunList,
  FooterActions,
  ResultHeader,
  SectionHeading,
  UrgencySection,
  YakinCard,
  showYakin,
} from "./shared";
import { SourceExtras } from "./SourceExtras";

const SLOT_LABELS: { key: keyof ReceteGunlukProgram; label: string; emoji: string }[] =
  [
    { key: "sabahAc", label: "Sabah aç karna", emoji: "🌅" },
    { key: "sabahYemek", label: "Sabah yemekle", emoji: "🍳" },
    { key: "oglen", label: "Öğlen", emoji: "☀️" },
    { key: "aksamYemek", label: "Akşam yemekle", emoji: "🌙" },
    { key: "gece", label: "Gece yatarken", emoji: "🌃" },
  ];

type Props = {
  result: AnalysisResultRecete;
  source: ReportSource;
  readerMode: ReaderMode;
  onNewReport: () => void;
  onChangeSelections: () => void;
};

export function ReceteView({ result, source, readerMode, onNewReport, onChangeSelections }: Props) {
  const program = result.gunlukProgram;
  const activeSlots = SLOT_LABELS.filter((s) => (program[s.key] ?? []).length > 0);

  return (
    <div className="space-y-6">
      <ResultHeader />
      <UrgencySection urgency={result.urgency} />
      <SourceExtras source={source} ekler={result.kaynakEkleri} />

      <CardShell>
        <SectionHeading>💊 İlaçlarınız</SectionHeading>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className="px-3 py-3 font-semibold text-zinc-800">İlaç adı</th>
                <th className="px-3 py-3 font-semibold text-zinc-800">Doz</th>
                <th className="px-3 py-3 font-semibold text-zinc-800">Günde kaç kez</th>
                <th className="px-3 py-3 font-semibold text-zinc-800">Ne zaman</th>
                <th className="px-3 py-3 font-semibold text-zinc-800">Kaç gün</th>
                <th className="px-3 py-3 font-semibold text-zinc-800">Ne için</th>
              </tr>
            </thead>
            <tbody>
              {result.ilaclar.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                    Rapordan ilaç satırı çıkarılamadı.
                  </td>
                </tr>
              ) : (
                result.ilaclar.map((r, i) => (
                  <tr key={`${r.ilacAdi}-${i}`} className="border-b border-zinc-100 last:border-0">
                    <td className="px-3 py-3 font-medium text-zinc-900">{r.ilacAdi}</td>
                    <td className="px-3 py-3 text-zinc-600">{r.doz}</td>
                    <td className="px-3 py-3 text-zinc-600">{r.gunlukKacKez}</td>
                    <td className="px-3 py-3 text-zinc-600">
                      {r.neZaman}
                      {r.zamanNotu ? (
                        <span className="mt-1 block text-xs text-amber-800">{r.zamanNotu}</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-zinc-600">{r.kacGun}</td>
                    <td className="px-3 py-3 text-zinc-600">{r.neIcin ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardShell>

      <CardShell>
        <SectionHeading>🕐 Günlük ilaç programı</SectionHeading>
        {activeSlots.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">
            Zaman dilimlerine ayrılmış program oluşturulamadı; tablodaki &quot;Ne zaman&quot; sütununu
            kullanın.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {activeSlots.map((slot) => (
              <li
                key={slot.key}
                className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-zinc-900">
                  {slot.emoji} {slot.label}
                </span>
                <span className="mt-1 block text-zinc-700">
                  {(program[slot.key] ?? []).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardShell>

      <CardShell>
        <SectionHeading>⚡ Dikkat edilmesi gerekenler</SectionHeading>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700">
          {result.dikkatUyari.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </CardShell>

      <CardShell className="bg-zinc-50/40">
        <SectionHeading>🛒 Eczanede ne soracaksınız?</SectionHeading>
        <ul className="mt-4 space-y-2">
          {result.eczaneChecklist.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-800">
              <span className="text-[#22C55E]" aria-hidden>
                □
              </span>
              {item}
            </li>
          ))}
        </ul>
      </CardShell>

      <DoktoraSorunList items={result.doktoraSorun} />
      {showYakin(readerMode, result.yakinModu) && <YakinCard text={result.yakinModu} />}
      <Disclaimer />
      <FooterActions onNewReport={onNewReport} onChangeSelections={onChangeSelections} />
    </div>
  );
}
