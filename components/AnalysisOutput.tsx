import type { ReactNode } from "react";
import { EpikrizView } from "@/components/analysis/EpikrizView";
import { GoruntulemeView } from "@/components/analysis/GoruntulemeView";
import { KanView } from "@/components/analysis/KanView";
import { ReceteView } from "@/components/analysis/ReceteView";
import type {
  AnalysisResult,
  AnalysisResultEpikriz,
  AnalysisResultGoruntuleme,
  AnalysisResultKan,
  AnalysisResultRecete,
  ReaderMode,
  ReportSource,
  ReportType,
} from "@/lib/types";

type Props = {
  result: AnalysisResult;
  reportType: ReportType;
  source: ReportSource;
  readerMode: ReaderMode;
  onNewReport: () => void;
  onChangeSelections: () => void;
};

function ResultFade({ children }: { children: ReactNode }) {
  return <div className="animate-result-enter">{children}</div>;
}

export function AnalysisOutput({
  result,
  reportType,
  source,
  readerMode,
  onNewReport,
  onChangeSelections,
}: Props) {
  const common = { readerMode, onNewReport, onChangeSelections, source };

  if (reportType === "epikriz" || result.reportType === "epikriz") {
    return (
      <ResultFade>
        <EpikrizView result={result as AnalysisResultEpikriz} {...common} />
      </ResultFade>
    );
  }
  if (reportType === "goruntuleme" || result.reportType === "goruntuleme") {
    return (
      <ResultFade>
        <GoruntulemeView result={result as AnalysisResultGoruntuleme} {...common} />
      </ResultFade>
    );
  }
  if (reportType === "recete" || result.reportType === "recete") {
    return (
      <ResultFade>
        <ReceteView result={result as AnalysisResultRecete} {...common} />
      </ResultFade>
    );
  }

  return (
    <ResultFade>
      <KanView result={result as AnalysisResultKan} {...common} />
    </ResultFade>
  );
}
