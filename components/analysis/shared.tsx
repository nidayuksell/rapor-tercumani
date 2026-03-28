import type { ReactNode } from "react";
import { URGENCY_BANNER } from "@/lib/analysis";
import type { ReaderMode, UrgencyLevel } from "@/lib/types";

const cardBase =
  "rounded-3xl border border-zinc-100/90 bg-white p-6 shadow-clinical-card transition-shadow duration-300";

export function CardShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`${cardBase} ${className}`}>{children}</section>;
}

/** Section titles in analysis views — clinical left accent */
export function SectionHeading({
  children,
  accent = "primary",
}: {
  children: ReactNode;
  accent?: "primary" | "danger";
}) {
  const border =
    accent === "danger" ? "border-l-red-800" : "border-l-[#1B3A6B]";
  const text = accent === "danger" ? "text-red-900" : "text-[#1B3A6B]";
  return (
    <h3
      className={`border-l-[3px] pl-3 text-lg font-bold tracking-tight ${border} ${text}`}
    >
      {children}
    </h3>
  );
}

export function UrgencySection({ urgency }: { urgency: UrgencyLevel }) {
  const banner = URGENCY_BANNER[urgency];
  return (
    <section
      className={`rounded-3xl border-2 px-6 py-8 shadow-clinical-card sm:px-10 sm:py-10 ${banner.bg} ${banner.border}`}
    >
      <p className="border-l-[3px] border-[#1B3A6B]/40 pl-3 text-xs font-bold uppercase tracking-wider text-zinc-600">
        Aciliyet skoru
      </p>
      <p className={`mt-4 text-2xl font-bold leading-snug sm:text-3xl ${banner.text}`}>
        <span className="mr-2 align-middle" aria-hidden>
          {banner.emoji}
        </span>
        {banner.line}
      </p>
    </section>
  );
}

export function ResultHeader() {
  return (
    <div>
      <h2 className="border-l-[3px] border-[#1B3A6B] pl-3 text-xl font-bold tracking-tight text-zinc-900">
        Sonuç
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Özet yönlendiricidir; tedavi ve teşhis için mutlaka hekiminize danışın.
      </p>
    </div>
  );
}

export function DoktoraSorunList({ items }: { items: [string, string, string] }) {
  return (
    <CardShell>
      <SectionHeading>❓ Doktora Sorun</SectionHeading>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-zinc-700 marker:font-semibold marker:text-[#1B3A6B]">
        {items.map((q, i) => (
          <li key={i} className="pl-1">
            {q}
          </li>
        ))}
      </ol>
    </CardShell>
  );
}

export function YakinCard({ text }: { text: string }) {
  return (
    <CardShell className="bg-violet-50/50">
      <SectionHeading>👨‍👩‍👧 Yakınınıza Ne Söyleyin?</SectionHeading>
      <p className="mt-4 text-base leading-relaxed text-zinc-800">{text}</p>
    </CardShell>
  );
}

export function Disclaimer() {
  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-xs leading-relaxed text-amber-950 shadow-clinical-card">
      <strong>Uyarı:</strong> Rapor Tercümanı tıbbi teşhis veya tedavi önermez. Şikâyet, ilaç
      dozu ve acil durumlar için 112 veya ilgili sağlık kuruluşuna başvurun.
    </div>
  );
}

export function FooterActions({
  onNewReport,
  onChangeSelections,
}: {
  onNewReport: () => void;
  onChangeSelections: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onNewReport}
        className="flex-1 rounded-2xl border border-zinc-200 py-3 text-sm font-semibold text-[#1B3A6B] hover:bg-zinc-50"
      >
        Yeni metin yapıştır
      </button>
      <button
        type="button"
        onClick={onChangeSelections}
        className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white hover:brightness-110"
        style={{ backgroundColor: "#1B3A6B" }}
      >
        Seçimleri değiştir
      </button>
    </div>
  );
}

export function showYakin(readerMode: ReaderMode, yakinModu: string) {
  return readerMode === "relative" && Boolean(yakinModu.trim());
}
