import type {
  AnalysisResultGoruntuleme,
  GoruntulemeOnemKatman,
  ReaderMode,
  ReportSource,
} from "@/lib/types";
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

function OnemBlock({
  title,
  emoji,
  tier,
  data,
}: {
  title: string;
  emoji: string;
  tier: "red" | "amber" | "green";
  data: GoruntulemeOnemKatman;
}) {
  const border =
    tier === "red"
      ? "border-red-200 bg-red-50/20"
      : tier === "amber"
        ? "border-amber-200 bg-amber-50/20"
        : "border-emerald-200 bg-emerald-50/20";
  return (
    <div className={`rounded-2xl border p-4 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] ${border}`}>
      <h4 className="text-sm font-bold text-zinc-900">
        <span className="mr-1.5" aria-hidden>
          {emoji}
        </span>
        {title}
      </h4>
      {data.aciklama ? (
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">{data.aciklama}</p>
      ) : null}
      {data.maddeler.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
          {data.maddeler.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type Props = {
  result: AnalysisResultGoruntuleme;
  source: ReportSource;
  readerMode: ReaderMode;
  onNewReport: () => void;
  onChangeSelections: () => void;
};

export function GoruntulemeView({
  result,
  source,
  readerMode,
  onNewReport,
  onChangeSelections,
}: Props) {
  return (
    <div className="space-y-6">
      <ResultHeader />
      <UrgencySection urgency={result.urgency} />
      <SourceExtras source={source} ekler={result.kaynakEkleri} />

      <CardShell>
        <SectionHeading>🔍 Ne bulundu?</SectionHeading>
        {result.neBulundu.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">Yapılandırılmış bulgu çıkarılamadı.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {result.neBulundu.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-4 text-sm leading-relaxed"
              >
                <p className="font-medium text-zinc-900">{b.basitTurkce}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#1B3A6B]/80">
                  Bölge: {b.bolge}
                </p>
                <p className="mt-2 text-zinc-600">{b.gunlukHayat}</p>
              </div>
            ))}
          </div>
        )}
      </CardShell>

      <CardShell>
        <SectionHeading>📊 Önemli mi?</SectionHeading>
        <div className="mt-4 space-y-4">
          <OnemBlock
            title="Takip gerektiren bulgular"
            emoji="🔴"
            tier="red"
            data={result.onemliMi.takipGerektiren}
          />
          <OnemBlock
            title="Gözetim altında tutulacak bulgular"
            emoji="🟡"
            tier="amber"
            data={result.onemliMi.gozetim}
          />
          <OnemBlock
            title="Normal / önemsiz bulgular"
            emoji="🟢"
            tier="green"
            data={result.onemliMi.normal}
          />
        </div>
      </CardShell>

      <CardShell>
        <SectionHeading>🔄 Takip gerekiyor mu?</SectionHeading>
        <p className="mt-4 text-base leading-relaxed text-zinc-700">{result.takipOnerisi}</p>
      </CardShell>

      <DoktoraSorunList items={result.doktoraSorun} />
      {showYakin(readerMode, result.yakinModu) && <YakinCard text={result.yakinModu} />}
      <Disclaimer />
      <FooterActions onNewReport={onNewReport} onChangeSelections={onChangeSelections} />
    </div>
  );
}
