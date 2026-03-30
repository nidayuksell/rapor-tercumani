import { Logo } from "@/components/Logo";

export function AppFooter() {
  return (
    <footer className="bg-[#1B3A6B] text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-16 sm:px-6">
        <div className="max-w-[460px] rounded-xl bg-white px-3 py-2">
          <Logo />
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-white/85">
          Rapor Tercümanı, tıbbi bilgiye erişimi demokratikleştirmek için yapıldı.
          Bu uygulama tıbbi tavsiye vermez. Tanı ve tedavi için mutlaka bir hekime
          başvurun.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/80">
          <span>Geliştirici: Nida Yüksel</span>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="underline underline-offset-4 hover:text-orange-200"
          >
            GitHub
          </a>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}
