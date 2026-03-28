import { LogoMark } from "@/components/BrandLogo";

export function AppFooter() {
  return (
    <footer className="border-t border-zinc-200/90 bg-zinc-50/50">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-center sm:px-6 sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <div className="flex items-center gap-2">
            <LogoMark size="sm" />
            <span className="text-sm font-bold text-[#1B3A6B]">Rapor Tercümanı</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600">
          Rapor Tercümanı, tıbbi bilgiye erişimi demokratikleştirmek için yapıldı.
        </p>
        <p className="text-sm text-zinc-500">
          Geliştirici:{" "}
          <span className="font-medium text-zinc-700">Nida Yüksel</span>
        </p>
        <p className="rounded-xl border border-amber-100/80 bg-amber-50/60 px-4 py-3 text-xs leading-relaxed text-amber-950">
          ⚠️ Bu uygulama tıbbi tavsiye vermez. Tanı ve tedavi için mutlaka bir hekime
          başvurun.
        </p>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm font-semibold text-[#1B3A6B] underline-offset-4 hover:underline"
            title="Depo bağlantısı yakında eklenecek"
          >
            GitHub
          </a>
          <p className="text-xs text-zinc-400">© 2026</p>
        </div>
      </div>
    </footer>
  );
}
