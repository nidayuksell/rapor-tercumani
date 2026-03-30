import { NextResponse } from "next/server";
import { coerceAnalysisResult } from "@/lib/analysis";
import { buildAnalyzeSystemPrompt } from "@/lib/prompts/analyzePrompts";
import { parsePatientProfile, profileForPrompt } from "@/lib/validatePatientProfile";
import type { ReaderMode, ReportSource, ReportType } from "@/lib/types";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

type GroqChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

const NON_MEDICAL_ERROR =
  "⚠️ Bu metin tıbbi bir rapor gibi görünmüyor. Lütfen kan tahlili, MR/tomografi raporu, ilaç reçetesi veya epikriz belgesi yükleyin.";

async function askGroq(
  apiKey: string,
  messages: Array<{ role: "system" | "user"; content: string }>,
  maxTokens = 128,
): Promise<{ ok: boolean; content?: string; error?: string; status?: number }> {
  const res = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0,
      max_tokens: maxTokens,
    }),
  });
  const data = (await res.json()) as GroqChatResponse;
  if (!res.ok) {
    return { ok: false, error: data.error?.message ?? `Groq API hatası (${res.status})`, status: res.status };
  }
  return { ok: true, content: data.choices?.[0]?.message?.content?.trim() ?? "" };
}

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
    profile?: unknown;
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

  const profile = parsePatientProfile(body.profile, type);
  if (!profile) {
    return NextResponse.json(
      { error: "Geçerli hasta profili gerekli (yaş, cinsiyet; kadında gebelik; kan tahlilinde açlık)." },
      { status: 400 },
    );
  }

  const profileNorm = profileForPrompt(profile);
  const system = buildAnalyzeSystemPrompt(type, source, reader, profileNorm);

  const userMessage = `Seçilen kaynak: ${source}. Rapor türü: ${type}. Hasta profili API ile iletildi. Şemaya uygun tek JSON döndür.\n\n${reportText.trim()}`;

  try {
    const check = await askGroq(
      apiKey,
      [
        {
          role: "system",
          content:
            "Is the following text a medical document (lab report, MRI/radiology report, prescription, or discharge summary)? Answer with only YES or NO.",
        },
        { role: "user", content: reportText.trim() },
      ],
      8,
    );
    if (!check.ok) {
      return NextResponse.json({ error: check.error ?? "Doğrulama başarısız" }, { status: 502 });
    }
    const medical = (check.content ?? "").toUpperCase().includes("YES");
    if (!medical) {
      return NextResponse.json({ error: NON_MEDICAL_ERROR }, { status: 400 });
    }

    const analysis = await askGroq(
      apiKey,
      [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
      12288,
    );
    if (!analysis.ok) {
      return NextResponse.json({ error: analysis.error ?? "Analiz başarısız" }, { status: 502 });
    }

    const rawText = analysis.content ?? "";
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
