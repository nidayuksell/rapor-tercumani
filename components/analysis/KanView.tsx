import type { AbnormalDirection, AnalysisResultKan, ReaderMode, ReportSource } from "@/lib/types";
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

function DurumCell({ direction }: { direction: AbnormalDirection }) {
  if (direction === "high") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-[#EF4444]">
        <span aria-hidden>↑</span> Yüksek
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-[#EF4444]">
      <span aria-hidden>↓</span> Düşük
    </span>
  );
}

function AccordionArrow({ direction }: { direction: AbnormalDirection }) {
  return (
    <span className="shrink-0 text-sm font-bold text-[#EF4444]" aria-hidden>
      {direction === "high" ? "↑" : "↓"}
    </span>
  );
}

type Props = {
  result: AnalysisResultKan;
  source: ReportSource;
  readerMode: ReaderMode;
  onNewReport: () => void;
  onChangeSelections: () => void;
};

export function KanView({ result, source, readerMode, onNewReport, onChangeSelections }: Props) {
  const { rows, summaryLine } = result.neDiyor;

  return (
    <div className="space-y-6">
      <ResultHeader />
      <UrgencySection urgency={result.urgency} />
      <SourceExtras source={source} ekler={result.kaynakEkleri} />

      <CardShell>
        <SectionHeading>📄 Ne Diyor?</SectionHeading>
        <p className="mt-1 text-xs text-zinc-500">Yalnızca referans dışı değerler listelenir.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className="px-4 py-3 font-semibold text-zinc-800">Değer</th>
                <th className="px-4 py-3 font-semibold text-zinc-800">Açıklama</th>
                <th className="w-36 px-4 py-3 font-semibold text-zinc-800">Durum</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                    Bu raporda referans dışı değer tabloda gösterilecek şekilde iletilmedi veya tüm
                    değerler referans aralığında olabilir.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={`${row.deger}-${i}`} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 align-top font-medium text-zinc-900">{row.deger}</td>
                    <td className="px-4 py-3 align-top leading-relaxed text-zinc-600">
                      {row.aciklama}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <DurumCell direction={row.direction} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {summaryLine ? <p className="mt-4 text-sm font-medium text-zinc-700">{summaryLine}</p> : null}
      </CardShell>

      <CardShell>
        <SectionHeading>🔍 Ne Anlama Geliyor?</SectionHeading>
        <p className="mt-4 text-base leading-relaxed text-zinc-700">{result.neAnlamaGeliyor}</p>
      </CardShell>

      {result.degerlerNeDemek.length > 0 && (
        <CardShell className="bg-zinc-50/40">
          <SectionHeading>🔬 Değerler Ne Demek?</SectionHeading>
          <p className="mt-1 text-xs text-zinc-500">
            İsterseniz açarak her terimin ne ölçtüğünü okuyabilirsiniz — zorunlu değil.
          </p>
          <div className="mt-4 divide-y divide-zinc-200/80 rounded-xl border border-zinc-200/80 bg-white">
            {result.degerlerNeDemek.map((item, i) => (
              <details
                key={`${item.baslik}-${i}`}
                className="group px-4 py-1 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium text-zinc-900 hover:text-[#1B3A6B]">
                  <span className="min-w-0 truncate">{item.baslik}</span>
                  <AccordionArrow direction={item.direction} />
                </summary>
                <p className="pb-3 pl-0.5 text-sm leading-relaxed text-zinc-600">{item.tekCumle}</p>
              </details>
            ))}
          </div>
        </CardShell>
      )}

      <DoktoraSorunList items={result.doktoraSorun} />
      {showYakin(readerMode, result.yakinModu) && <YakinCard text={result.yakinModu} />}
      <Disclaimer />
      <FooterActions onNewReport={onNewReport} onChangeSelections={onChangeSelections} />
    </div>
  );
}
