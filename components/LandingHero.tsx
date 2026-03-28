import { HeroMedicalArt } from "@/components/HeroMedicalArt";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-100/80 bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(27,58,107,0.06),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-20">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
            Tıbbi raporunuzu anlamak artık çok kolay
          </h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-600 sm:text-lg">
            Kan tahlilinden epikrize, MR raporundan reçeteye — yapay zeka destekli Rapor
            Tercümanı her belgeyi sizin için sade Türkçeye çeviriyor.
          </p>
          <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <li className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="text-base" aria-hidden>
                🔒
              </span>
              Verileriniz saklanmaz
            </li>
            <li className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="text-base" aria-hidden>
                ⚡
              </span>
              Saniyeler içinde sonuç
            </li>
            <li className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="text-base" aria-hidden>
                🇹🇷
              </span>
              Türk sağlık sistemine özel
            </li>
          </ul>
        </div>
        <HeroMedicalArt />
      </div>
    </section>
  );
}
