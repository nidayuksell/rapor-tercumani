/** Abstract clinical illustration: clipboard, checks, ECG, subtle cross — pure SVG */
export function HeroMedicalArt() {
  return (
    <div
      className="relative mx-auto w-full max-w-md select-none"
      aria-hidden
    >
      <svg
        viewBox="0 0 400 320"
        className="h-auto w-full drop-shadow-[0_12px_40px_rgba(27,58,107,0.12)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hero-clip" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="hero-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1B3A6B" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#1B3A6B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1B3A6B" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Soft ECG baseline */}
        <path
          d="M40 220 L80 220 L88 200 L96 232 L108 188 L120 240 L132 200 L148 220 L360 220"
          fill="none"
          stroke="url(#hero-line)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Subtle medical cross */}
        <g opacity="0.12" transform="translate(300,48)">
          <rect x="-16" y="-4" width="32" height="8" rx="2" fill="#1B3A6B" />
          <rect x="-4" y="-16" width="8" height="32" rx="2" fill="#1B3A6B" />
        </g>

        {/* Clipboard */}
        <g transform="translate(88, 56)">
          <rect
            x="0"
            y="16"
            width="224"
            height="200"
            rx="14"
            fill="url(#hero-clip)"
            stroke="#1B3A6B"
            strokeWidth="1.5"
            strokeOpacity="0.35"
          />
          <rect
            x="72"
            y="0"
            width="80"
            height="36"
            rx="8"
            fill="#1B3A6B"
            fillOpacity="0.08"
            stroke="#1B3A6B"
            strokeWidth="1.2"
            strokeOpacity="0.25"
          />
          <circle cx="112" cy="18" r="4" fill="#1B3A6B" fillOpacity="0.2" />

          {/* Lines + checkmarks */}
          {[0, 1, 2, 3].map((i) => {
            const y = 52 + i * 36;
            return (
              <g key={i}>
                <rect
                  x="24"
                  y={y - 6}
                  width={i < 3 ? 120 : 90}
                  height="6"
                  rx="3"
                  fill="#1B3A6B"
                  fillOpacity={0.06 + i * 0.02}
                />
                {i < 3 ? (
                  <g transform={`translate(168, ${y - 2})`}>
                    <circle cx="0" cy="0" r="12" fill="#1B3A6B" fillOpacity="0.1" />
                    <path
                      d="M-5 0 L-2 4 L5 -4"
                      fill="none"
                      stroke="#1B3A6B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
