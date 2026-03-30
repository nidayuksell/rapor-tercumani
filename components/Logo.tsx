type LogoProps = {
  className?: string;
  iconOnly?: boolean;
};

export function Logo({ className = "", iconOnly = false }: LogoProps) {
  if (iconOnly) {
    return (
      <svg
        viewBox="40 20 100 120"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        <rect x="40" y="20" width="100" height="120" rx="18" fill="#1B3A6B" />
        <rect x="58" y="42" width="64" height="7" rx="3.5" fill="white" opacity="0.9" />
        <rect x="58" y="57" width="64" height="7" rx="3.5" fill="white" opacity="0.9" />
        <rect x="58" y="72" width="44" height="7" rx="3.5" fill="white" opacity="0.9" />
        <circle cx="93" cy="108" r="13" fill="none" stroke="white" strokeWidth="4" />
        <line
          x1="102"
          y1="117"
          x2="114"
          y2="129"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="100%"
      viewBox="0 0 680 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Rapor Tercümanı logo"
    >
      <rect x="40" y="20" width="100" height="120" rx="18" fill="#1B3A6B" />
      <rect x="58" y="42" width="64" height="7" rx="3.5" fill="white" opacity="0.9" />
      <rect x="58" y="57" width="64" height="7" rx="3.5" fill="white" opacity="0.9" />
      <rect x="58" y="72" width="44" height="7" rx="3.5" fill="white" opacity="0.9" />
      <circle cx="93" cy="108" r="13" fill="none" stroke="white" strokeWidth="4" />
      <line
        x1="102"
        y1="117"
        x2="114"
        y2="129"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <text
        fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        fontSize="36"
        fontWeight="700"
        fill="#1B3A6B"
        x="162"
        y="76"
      >
        Rapor Tercümanı
      </text>
      <text
        fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        fontSize="15"
        fill="#6B7280"
        x="164"
        y="104"
      >
        Tıbbi raporunuzu anlayın — kolayca, hızlıca, güvenle.
      </text>
    </svg>
  );
}
