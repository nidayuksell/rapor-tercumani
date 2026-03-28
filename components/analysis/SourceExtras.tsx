import type { KaynakEkleri, ReportSource } from "@/lib/types";
import { CardShell, SectionHeading } from "./shared";

type Props = {
  source: ReportSource;
  ekler: KaynakEkleri;
};

export function SourceExtras({ source, ekler }: Props) {
  if (source === "e-nabiz") {
    const showSgk = ekler.sgkBilgileri.length > 0;
    const tips = ekler.enabizIpuclari;
    return (
      <div className="space-y-6">
        {showSgk ? (
          <CardShell className="border-sky-100 bg-sky-50/40">
            <SectionHeading>🏥 SGK Bilgileri</SectionHeading>
            <p className="mt-1 text-xs text-zinc-600">
              Raporda geçen kamu sağlık sistemi terimlerinin sade açıklaması.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-800">
              {ekler.sgkBilgileri.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </CardShell>
        ) : null}
        {tips.length > 0 ? (
          <CardShell className="border-emerald-100 bg-emerald-50/30">
            <SectionHeading>📱 e-Nabız&apos;da Ne Yapabilirsiniz?</SectionHeading>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-800">
              {tips.map((line, i) => (
                <li key={i}>
                  {line.includes("mhrs.gov.tr") ? (
                    <>
                      {line.split("mhrs.gov.tr")[0]}
                      <a
                        href="https://mhrs.gov.tr"
                        className="font-medium text-[#1B3A6B] underline-offset-2 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        mhrs.gov.tr
                      </a>
                      {line.split("mhrs.gov.tr")[1] ?? ""}
                    </>
                  ) : (
                    line
                  )}
                </li>
              ))}
            </ul>
          </CardShell>
        ) : null}
      </div>
    );
  }

  if (source === "ozel") {
    return (
      <div className="space-y-6">
        {ekler.bilginize.length > 0 ? (
          <CardShell className="border-amber-100 bg-amber-50/35">
            <SectionHeading>💡 Bilginize</SectionHeading>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-800">
              {ekler.bilginize.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </CardShell>
        ) : null}
        {ekler.ozelSigortaNotu ? (
          <CardShell className="border-violet-100 bg-violet-50/40">
            <SectionHeading>📋 Özel Sigorta</SectionHeading>
            <p className="mt-3 text-sm leading-relaxed text-zinc-800">{ekler.ozelSigortaNotu}</p>
          </CardShell>
        ) : null}
      </div>
    );
  }

  /* yurtdisi */
  const tt = ekler.turkiyedeTakip;
  const hasTakip = Boolean(tt.taniAdlandirma || tt.bolum || tt.doktoraDikkat);
  return (
    <div className="space-y-6">
      {ekler.birimDonusumleri.length > 0 ? (
        <CardShell>
          <SectionHeading>🔄 Birim Dönüşümleri</SectionHeading>
          <p className="mt-1 text-xs text-zinc-600">
            Yurt dışı raporlarda farklı birimler; Türkiye&apos;de yaygın karşılık ve yorum.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90">
                  <th className="px-4 py-3 font-semibold text-zinc-800">Orijinal</th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">Türkiye karşılığı</th>
                  <th className="px-4 py-3 font-semibold text-zinc-800">Referans / yorum</th>
                </tr>
              </thead>
              <tbody>
                {ekler.birimDonusumleri.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 align-top text-zinc-800">{row.orijinal || "—"}</td>
                    <td className="px-4 py-3 align-top text-zinc-800">{row.turkiyeKarsiligi || "—"}</td>
                    <td className="px-4 py-3 align-top text-zinc-700">{row.referansAraligi || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardShell>
      ) : (
        <CardShell className="bg-zinc-50/50">
          <SectionHeading>🔄 Birim Dönüşümleri</SectionHeading>
          <p className="mt-3 text-sm text-zinc-600">
            Bu raporda dönüşüm gerektiren farklı birim (ör. mg/dL / mmol/L) belirgin şekilde
            çıkarılamadı. Şüphede hekiminize veya laboratuvara danışın.
          </p>
        </CardShell>
      )}
      {hasTakip ? (
        <CardShell className="border-red-100 bg-red-50/25">
          <SectionHeading>🇹🇷 Türkiye&apos;de Takip</SectionHeading>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-800">
            {tt.taniAdlandirma ? (
              <p>
                <span className="font-semibold text-zinc-900">Tanı adlandırması: </span>
                {tt.taniAdlandirma}
              </p>
            ) : null}
            {tt.bolum ? (
              <p>
                <span className="font-semibold text-zinc-900">Hangi bölüm: </span>
                {tt.bolum}
              </p>
            ) : null}
            {tt.doktoraDikkat ? (
              <p>
                <span className="font-semibold text-zinc-900">Türk hekiminize gösterirken: </span>
                {tt.doktoraDikkat}
              </p>
            ) : null}
          </div>
        </CardShell>
      ) : null}
    </div>
  );
}
