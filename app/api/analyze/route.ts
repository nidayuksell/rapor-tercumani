import { NextResponse } from "next/server";
import { coerceAnalysisResult } from "@/lib/analysis";
import { buildAnalyzeSystemPrompt } from "@/lib/prompts/analyzePrompts";
import type { ReaderMode, ReportSource, ReportType } from "@/lib/types";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

type GroqChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY tanımlı değil. .env.local dosyasına ekleyin." },
      { status: 500 },
    );
  }

  let body: {
    reportText?: string;
    source?: ReportSource;
    type?: ReportType;
    reader?: ReaderMode;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  const { reportText, source, type, reader } = body;
  if (!reportText?.trim()) {
    return NextResponse.json({ error: "Rapor metni gerekli" }, { status: 400 });
  }
  if (!source || !type || !reader) {
    return NextResponse.json({ error: "Tüm seçimler gerekli" }, { status: 400 });
  }

  const system = buildAnalyzeSystemPrompt(type, source, reader);

  const userMessage = `Seçilen kaynak: ${source}. Rapor türü: ${type}. Şemaya uygun tek JSON döndür.\n\n${reportText.trim()}`;

  try {
    const res = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMessage },
        ],
        temperature: 0.35,
        max_tokens: 12288,
      }),
    });

    const data = (await res.json()) as GroqChatResponse;

    if (!res.ok) {
      const msg = data.error?.message ?? `Groq API hatası (${res.status})`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const rawText = data.choices?.[0]?.message?.content?.trim() ?? "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Model yanıtı çözümlenemedi" }, { status: 502 });
    }
    const parsed = JSON.parse(jsonMatch[0]) as unknown;
    const result = coerceAnalysisResult(parsed, type, source);
    if (reader === "self") {
      result.yakinModu = "";
    }
    return NextResponse.json({ result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
