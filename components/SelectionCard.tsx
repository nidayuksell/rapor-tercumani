import type { ReactNode } from "react";

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 6l3 3 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
};

export function SelectionCard({ active, onClick, className = "", children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-2xl border-2 p-4 text-left shadow-clinical-card transition-all duration-200 ${
        active
          ? "border-[#1B3A6B] bg-[#1B3A6B]/[0.04] ring-2 ring-[#1B3A6B]/25"
          : "border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-[0_8px_28px_-6px_rgba(27,58,107,0.1)]"
      } ${className}`}
    >
      {active ? (
        <span
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#1B3A6B] text-white shadow-md"
          aria-hidden
        >
          <CheckIcon />
        </span>
      ) : null}
      <div className={active ? "pr-9" : ""}>{children}</div>
    </button>
  );
}
