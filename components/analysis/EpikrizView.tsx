import { calendarDaysFromToday, formatGunKaldi } from "@/lib/dates";
import type { AnalysisResultEpikriz, ReaderMode, ReportSource } from "@/lib/types";
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

function kontrolHighlightClass(days: number | null): string {
  if (days === null) return "border-zinc-200 bg-white";
  if (days >= 0 && days <= 3) return "border-[#EF4444] bg-red-50/40 ring-1 ring-red-200/60";
  if (days > 3 && days <= 7) return "border-amber-400 bg-amber-50/50 ring-1 ring-amber-200/60";
  return "border-zinc-200 bg-white";
}

type Props = {
  result: AnalysisResultEpikriz;
  source: ReportSource;
  readerMode: ReaderMode;
  onNewReport: () => void;
  onChangeSelections: () => void;
};

export function EpikrizView({ result, source, readerMode, onNewReport, onChangeSelections }: Props) {
  return (
    <div className="space-y-6">
      <ResultHeader />
      <UrgencySection urgency={result.urgency} />
      <SourceExtras source={source} ekler={result.kaynakEkleri} />

      <CardShell>
        <SectionHeading>💊 İlaç Takviminiz</SectionHeading>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className="px-4 py-3 font-semibold text-zinc-800">İlaç adı</th>
                <th className="px-4 py-3 font-semibold text-zinc-800">Ne zaman</th>
                <th className="px-4 py-3 font-semibold text-zinc-800">Nasıl</th>
              </tr>
            </thead>
            <tbody>
              {result.ilacTakvimi.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                    Raporda tabloya aktarılabilecek ilaç satırı bulunamadı.
                  </td>
                </tr>
              ) : (
                result.ilacTakvimi.map((r, i) => (
                  <tr key={`${r.ilacAdi}-${i}`} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-zinc-900">{r.ilacAdi}</td>
                    <td className="px-4 py-3 text-zinc-600">{r.neZaman}</td>
                    <td className="px-4 py-3 text-zinc-600">{r.nasil}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardShell>

      <section className="rounded-3xl border-2 border-red-300 bg-red-50/30 p-6 shadow-clinical-card">
        <SectionHeading accent="danger">⚠️ Alarm sinyalleri</SectionHeading>
        <p className="mt-1 text-xs text-red-800/80">
          Aşağıdaki durumlarda gecikmeden acil servise başvurun veya 112’yi arayın.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-red-950">
          {result.alarmSinyalleri.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      <CardShell>
        <SectionHeading>📅 Kontrol randevularınız</SectionHeading>
        {result.kontrolRandevulari.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">
            Raporda net bir kontrol tarihi çıkarılamadı; tarihleri hekiminizden teyit edin.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {result.kontrolRandevulari.map((k, i) => {
              const days = calendarDaysFromToday(k.tarihISO);
              const rel = formatGunKaldi(days);
              return (
                <li
                  key={`${k.bolum}-${i}`}
                  className={`rounded-2xl border p-4 ${kontrolHighlightClass(days)}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-zinc-900">{k.tarihGosterim}</span>
                    {rel ? (
                      <span
                        className={`text-xs font-medium ${
                          days !== null && days >= 0 && days <= 3
                            ? "text-red-700"
                            : days !== null && days > 3 && days <= 7
                              ? "text-amber-800"
                              : "text-zinc-500"
                        }`}
                      >
                        {rel}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-zinc-700">
                    <span className="font-medium text-[#1B3A6B]">{k.bolum}</span>
                    {k.saat ? ` · ${k.saat}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardShell>

      <CardShell>
        <SectionHeading>🚫 Dikkat etmeniz gerekenler</SectionHeading>
        {result.dikkatListesi.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">Raporda özel kısıtlama çıkarılamadı.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {result.dikkatListesi.map((d, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-800">
                <span className="text-lg leading-none" aria-hidden>
                  {d.emoji}
                </span>
                <span>{d.metin}</span>
              </li>
            ))}
          </ul>
        )}
      </CardShell>

      <DoktoraSorunList items={result.doktoraSorun} />
      {showYakin(readerMode, result.yakinModu) && <YakinCard text={result.yakinModu} />}
      <Disclaimer />
      <FooterActions onNewReport={onNewReport} onChangeSelections={onChangeSelections} />
    </div>
  );
}
