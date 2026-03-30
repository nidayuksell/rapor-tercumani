import { NextResponse } from "next/server";

export const maxDuration = 60;

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

type GroqChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

function normalizeImageMime(file: File, buf: Buffer): "image/jpeg" | "image/png" | "image/webp" {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  if (file.type === "image/jpeg") return "image/jpeg";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return "image/webp";
  return "image/jpeg";
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY tanımlı değil. .env.local dosyasına ekleyin." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Görsel gerekli" }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const okName =
    name === "" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp");
  const okType =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp" ||
    file.type === "";

  if (!okName || !okType || (name === "" && file.type === "")) {
    return NextResponse.json({ error: "Yalnızca JPEG, PNG veya WebP" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Görsel çok büyük" }, { status: 413 });
  }

  const mime = normalizeImageMime(file, buf);
  const imageDataUrl = `data:${mime};base64,${buf.toString("base64")}`;

  const userText = `Bu görsel bir tıbbi rapor, epikriz, reçete veya laboratuvar çıktısı olabilir. Görselde görünen TÜM yazıları eksiksiz oku ve çıkar.

Kurallar:
- Yalnızca çıkarılmış ham metni döndür.
- Açıklama, özet, yorum veya giriş cümlesi ekleme.
- Markdown veya kod bloğu kullanma.
- Mümkünse satır ve paragraf düzenini koru.`;

  try {
    const res = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });

    const data = (await res.json()) as GroqChatResponse;

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? `Groq API hatası (${res.status})` },
        { status: 502 },
      );
    }

    let text = data.choices?.[0]?.message?.content?.trim() ?? "";
    text = text.replace(/^```[\w]*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    if (!text) {
      return NextResponse.json({ error: "Metin çıkarılamadı" }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
