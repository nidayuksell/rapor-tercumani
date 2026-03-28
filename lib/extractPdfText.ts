/**
 * Client-side PDF text extraction (pdfjs-dist). Call only from browser code.
 */
export async function extractTextFromPdfFile(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;

  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? String((item as { str?: string }).str ?? "") : ""))
      .join(" ")
      .trim();
    if (line) parts.push(line);
  }

  return parts.join("\n\n").trim();
}
