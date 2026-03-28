type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, { box: string; svg: string }> = {
  sm: { box: "h-9 w-9", svg: "h-5 w-5" },
  md: { box: "h-11 w-11", svg: "h-6 w-6" },
  lg: { box: "h-14 w-14", svg: "h-8 w-8" },
};

/** Minimal mark: ⇄ in a soft rounded rectangle, clinical deep blue */
export function LogoMark({ size = "md" }: { size?: LogoSize }) {
  const { box, svg } = sizeMap[size];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-[#1B3A6B]/15 bg-gradient-to-b from-white to-slate-50/90 shadow-[0_2px_8px_rgba(27,58,107,0.08)] ${box}`}
      aria-hidden
    >
      <svg
        className={svg}
        viewBox="0 0 32 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="3"
          width="28"
          height="22"
          rx="6"
          stroke="#1B3A6B"
          strokeWidth="1.25"
          fill="white"
          fillOpacity="0.9"
        />
        <path
          d="M20 14h6M23 11l3 3-3 3"
          stroke="#1B3A6B"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 14H6M9 11L6 14l3 3"
          stroke="#1B3A6B"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

type BrandLockupProps = {
  size?: LogoSize;
  showTagline?: boolean;
  compact?: boolean;
};

export function BrandLockup({ size = "md", showTagline = true, compact = false }: BrandLockupProps) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "sm:gap-4"}`}>
      <LogoMark size={size} />
      <div className="min-w-0 text-left">
        <p
          className={`font-bold tracking-tight text-[#1B3A6B] ${
            size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg sm:text-xl"
          }`}
        >
          Rapor Tercümanı
        </p>
        {showTagline ? (
          <p
            className={`mt-0.5 text-zinc-500 ${
              size === "sm" ? "text-[10px] leading-snug" : "text-xs sm:text-sm"
            }`}
          >
            Tıbbi raporunuzu anlayın — kolayca, hızlıca, güvenle.
          </p>
        ) : null}
      </div>
    </div>
  );
}
