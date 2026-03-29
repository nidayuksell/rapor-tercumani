"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { extractTextFromPdfFile } from "@/lib/extractPdfText";
import { AnalysisOutput } from "@/components/AnalysisOutput";
import { AppFooter } from "@/components/AppFooter";
import { BrandLockup } from "@/components/BrandLogo";
import { LandingHero } from "@/components/LandingHero";
import { SelectionCard } from "@/components/SelectionCard";
import {
  EMPTY_PATIENT_PROFILE,
  type AgeRange,
  type AnalysisResult,
  type FastingStatus,
  type Gender,
  type PatientProfile,
  type PregnancyStatus,
  type ReaderMode,
  type ReportSource,
  type ReportType,
  type UserSelections,
} from "@/lib/types";

type Step = "landing" | "setup" | "input" | "result";

const SOURCE_OPTIONS: { value: ReportSource; label: string; hint: string }[] = [
  { value: "e-nabiz", label: "e-Nabız / SGK", hint: "Devlet ve bağlı kurum çıktıları" },
  { value: "ozel", label: "Özel Hastane", hint: "Özel sağlık kuruluşu raporları" },
  { value: "yurtdisi", label: "Yurt Dışı / İngilizce", hint: "Çeviri ve farklı formatlar" },
];

const TYPE_OPTIONS: { value: ReportType; label: string; emoji: string }[] = [
  { value: "kan", label: "Kan Tahlili", emoji: "🩸" },
  { value: "goruntuleme", label: "MR / Tomografi", emoji: "🧠" },
  { value: "recete", label: "İlaç Reçetesi", emoji: "💊" },
  { value: "epikriz", label: "Epikriz / Taburcu", emoji: "📋" },
];

const READER_OPTIONS: { value: ReaderMode; label: string; hint: string }[] = [
  { value: "self", label: "Kendim için okuyorum", hint: "Kendi raporunuzu anlamak" },
  {
    value: "relative",
    label: "Yakınım adına okuyorum",
    hint: "Yaşlı veya çocuk yakınınız için",
  },
];

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: "0-17", label: "0-17 (Çocuk)" },
  { value: "18-35", label: "18-35" },
  { value: "36-55", label: "36-55" },
  { value: "55+", label: "55+" },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "kadin", label: "Kadın" },
  { value: "erkek", label: "Erkek" },
];

const PREGNANCY_OPTIONS: { value: PregnancyStatus; label: string }[] = [
  { value: "gebe-degil", label: "Gebe değilim" },
  { value: "gebe", label: "Gebeyim" },
];

const FASTING_OPTIONS: { value: FastingStatus; label: string }[] = [
  { value: "ac", label: "Aç karnına yapıldı" },
  { value: "tok", label: "Tok karnına yapıldı" },
  { value: "bilinmiyor", label: "Bilmiyorum" },
];

const PDF_READ_FAIL = "PDF okunamadı, metni manuel olarak yapıştırabilirsiniz.";
const OCR_READ_FAIL = "Görsel okunamadı, metni manuel yapıştırabilirsiniz.";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [selections, setSelections] = useState<UserSelections>({
    source: null,
    type: null,
    reader: null,
    profile: { ...EMPTY_PATIENT_PROFILE },
  });
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  /** Camera: capture="environment" + image/* only */
  const cameraInputRef = useRef<HTMLInputElement>(null);
  /** Gallery / desktop: images + PDF, no capture */
  const filePickerInputRef = useRef<HTMLInputElement>(null);
  /** True ≈ phone/tablet touch — show camera + gallery buttons */
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () => setIsCoarsePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const selectionsComplete = useMemo(() => {
    const { source, type, reader, profile } = selections;
    if (!source || !type || !reader) return false;
    if (!profile.ageRange || !profile.gender) return false;
    if (profile.gender === "kadin" && !profile.pregnancy) return false;
    if (type === "kan" && !profile.fasting) return false;
    return true;
  }, [selections]);

  function profilePayload(): PatientProfile {
    const p = selections.profile;
    return {
      ageRange: p.ageRange,
      gender: p.gender,
      pregnancy: selections.profile.gender === "kadin" ? p.pregnancy : null,
      fasting: selections.type === "kan" ? p.fasting : null,
      chronicConditions: p.chronicConditions.trim(),
    };
  }

  async function analyze() {
    if (!selectionsComplete) {
      setError("Lütfen tüm zorunlu seçimleri ve hasta profilini tamamlayın.");
      return;
    }
    if (!selections.source || !selections.type || !selections.reader) {
      setError("Lütfen tüm kartları seçin.");
      return;
    }
    if (!reportText.trim()) {
      setError("Rapor metnini yapıştırın.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportText,
          source: selections.source,
          type: selections.type,
          reader: selections.reader,
          profile: profilePayload(),
        }),
      });
      const data = (await res.json()) as { result?: AnalysisResult; error?: string };
      if (!res.ok) {
        setError(data.error ?? "İstek başarısız");
        return;
      }
      if (data.result) {
        setResult(data.result);
        setStep("result");
      }
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function isPdfFile(file: File): boolean {
    const n = file.name.toLowerCase();
    const mime = file.type;
    return (
      n.endsWith(".pdf") ||
      mime === "application/pdf" ||
      mime === "application/x-pdf" ||
      (mime === "application/octet-stream" && n.endsWith(".pdf"))
    );
  }

  function isOcrImageFile(file: File): boolean {
    const ext = file.name.toLowerCase();
    if (file.type.startsWith("image/")) {
      if (file.type === "image/svg+xml") return false;
      return true;
    }
    return (
      ext.endsWith(".jpg") ||
      ext.endsWith(".jpeg") ||
      ext.endsWith(".png") ||
      ext.endsWith(".webp")
    );
  }

  async function runPdfUpload(file: File) {
    if (!isPdfFile(file)) {
      setPdfError(PDF_READ_FAIL);
      return;
    }
    setPdfError(null);
    setError(null);
    setPdfLoading(true);
    try {
      const text = await extractTextFromPdfFile(file);
      if (!text.trim()) {
        setPdfError(PDF_READ_FAIL);
        return;
      }
      setReportText(text);
    } catch {
      setPdfError(PDF_READ_FAIL);
    } finally {
      setPdfLoading(false);
    }
  }

  async function runImageOcr(file: File) {
    if (!isOcrImageFile(file)) {
      setOcrError(OCR_READ_FAIL);
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setOcrError(OCR_READ_FAIL);
      return;
    }
    setOcrError(null);
    setError(null);
    setOcrLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text?.trim()) {
        setOcrError(OCR_READ_FAIL);
        return;
      }
      setReportText(data.text.trim());
    } catch {
      setOcrError(OCR_READ_FAIL);
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleCameraInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setError(null);
    if (!file) return;
    await runImageOcr(file);
  }

  async function handleFilePickerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setError(null);
    if (!file) return;
    if (isPdfFile(file)) {
      await runPdfUpload(file);
    } else if (isOcrImageFile(file)) {
      await runImageOcr(file);
    } else {
      setPdfError(null);
      setOcrError(null);
      setError("Yalnızca görsel (JPG, PNG, WEBP) veya PDF yükleyebilirsiniz.");
    }
  }

  return (
    <div className="min-h-screen border-t-[3px] border-[#1B3A6B] bg-white">
      <header className="sticky top-0 z-30 border-b border-zinc-100/90 bg-white/95 shadow-[0_1px_0_rgba(27,58,107,0.04)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <BrandLockup size="md" />
          {step !== "landing" && (
            <button
              type="button"
              onClick={() => {
                setStep("landing");
                setResult(null);
                setReportText("");
                setSelections({
                  source: null,
                  type: null,
                  reader: null,
                  profile: { ...EMPTY_PATIENT_PROFILE },
                });
                setError(null);
                setPdfError(null);
                setOcrError(null);
              }}
              className="shrink-0 text-sm font-semibold text-[#1B3A6B] underline-offset-4 hover:underline"
            >
              Başa dön
            </button>
          )}
        </div>
      </header>

      {step === "landing" && <LandingHero />}

      {step === "landing" && (
        <div className="flex justify-center border-b border-zinc-100/80 bg-white py-3">
          <a
            href="#devam"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B3A6B] underline-offset-4 hover:underline"
          >
            Forma geç
            <span className="inline-block text-base animate-bounce" aria-hidden>
              ↓
            </span>
          </a>
        </div>
      )}

      <main
        id="devam"
        className="mx-auto max-w-3xl scroll-mt-24 px-4 pb-20 pt-10 sm:px-6 sm:pt-12"
      >
        {step === "landing" && (
          <div className="space-y-8 text-center">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setStep("setup")}
                className="w-full max-w-xs rounded-2xl px-8 py-3.5 text-base font-bold text-white shadow-clinical-card transition hover:brightness-110 sm:w-auto"
                style={{ backgroundColor: "#1B3A6B" }}
              >
                Başla
              </button>
              <button
                type="button"
                onClick={() => setHowOpen((v) => !v)}
                className="w-full max-w-xs rounded-2xl border-2 border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-[#1B3A6B] shadow-clinical-card transition hover:border-[#1B3A6B]/30 hover:bg-zinc-50/80 sm:w-auto"
              >
                Nasıl Çalışır?
              </button>
            </div>

            {howOpen && (
              <div className="mx-auto max-w-lg rounded-2xl border border-zinc-100 bg-zinc-50/90 p-5 text-left text-sm leading-relaxed text-zinc-700 shadow-clinical-card">
                <ol className="list-decimal space-y-2 pl-5">
                  <li>Kaynak, rapor türü, okuyucu modu ve sizin hakkınızda bilgileri seçin.</li>
                  <li>Rapor metnini yapıştırıp analizi başlatın.</li>
                  <li>
                    Aciliyet skoru ve sade Türkçe özet görünür. Son karar her zaman hekiminizedir.
                  </li>
                </ol>
                <p className="mt-4 text-xs text-zinc-500">
                  Bu uygulama tıbbi tavsiye vermez; yalnızca metni daha anlaşılır hale getirmeye yardımcı
                  olur.
                </p>
              </div>
            )}
          </div>
        )}

        {step === "setup" && (
          <div className="space-y-10">
            <div>
              <h2 className="border-l-[3px] border-[#1B3A6B] pl-3 text-xl font-bold tracking-tight text-zinc-900">
                Adım 1 / 2 — Seçimler
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Bu bilgiler açıklamanın tonunu ve bağlamını iyileştirir.
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#1B3A6B]">
                A) Rapor kaynağı
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {SOURCE_OPTIONS.map((opt) => {
                  const active = selections.source === opt.value;
                  return (
                    <SelectionCard
                      key={opt.value}
                      active={active}
                      onClick={() => setSelections((s) => ({ ...s, source: opt.value }))}
                    >
                      <p className="font-bold text-zinc-900">{opt.label}</p>
                      <p className="mt-1 text-xs text-zinc-500">{opt.hint}</p>
                    </SelectionCard>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#1B3A6B]">
                B) Rapor türü
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TYPE_OPTIONS.map((opt) => {
                  const active = selections.type === opt.value;
                  return (
                    <SelectionCard
                      key={opt.value}
                      active={active}
                      onClick={() =>
                        setSelections((s) => ({
                          ...s,
                          type: opt.value,
                          profile: {
                            ...s.profile,
                            fasting: opt.value === "kan" ? s.profile.fasting : null,
                          },
                        }))
                      }
                    >
                      <p className="text-2xl leading-none">{opt.emoji}</p>
                      <p className="mt-2 text-sm font-bold text-zinc-900">{opt.label}</p>
                    </SelectionCard>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#1B3A6B]">
                C) Kim için? (Aile / bakıcı modu)
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {READER_OPTIONS.map((opt) => {
                  const active = selections.reader === opt.value;
                  return (
                    <SelectionCard
                      key={opt.value}
                      active={active}
                      onClick={() => setSelections((s) => ({ ...s, reader: opt.value }))}
                    >
                      <p className="font-bold text-zinc-900">{opt.label}</p>
                      <p className="mt-1 text-xs text-zinc-500">{opt.hint}</p>
                    </SelectionCard>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#1B3A6B]">
                👤 Sizin Hakkınızda
              </h3>
              <p className="text-xs leading-relaxed text-zinc-600">
                Referans aralığı yorumunu doğrulamak için kullanılır; isteğe bağlı alanlar açıkça
                işaretlidir.
              </p>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-700">Yaş aralığı</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {AGE_OPTIONS.map((opt) => {
                    const active = selections.profile.ageRange === opt.value;
                    return (
                      <SelectionCard
                        key={opt.value}
                        active={active}
                        onClick={() =>
                          setSelections((s) => ({
                            ...s,
                            profile: { ...s.profile, ageRange: opt.value },
                          }))
                        }
                      >
                        <p className="text-sm font-bold text-zinc-900">{opt.label}</p>
                      </SelectionCard>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-700">Cinsiyet</p>
                <div className="grid grid-cols-2 gap-3">
                  {GENDER_OPTIONS.map((opt) => {
                    const active = selections.profile.gender === opt.value;
                    return (
                      <SelectionCard
                        key={opt.value}
                        active={active}
                        onClick={() =>
                          setSelections((s) => ({
                            ...s,
                            profile: {
                              ...s.profile,
                              gender: opt.value,
                              pregnancy: opt.value === "erkek" ? null : s.profile.pregnancy,
                            },
                          }))
                        }
                      >
                        <p className="font-bold text-zinc-900">{opt.label}</p>
                      </SelectionCard>
                    );
                  })}
                </div>
              </div>

              {selections.profile.gender === "kadin" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-700">Gebelik</p>
                  <div className="grid grid-cols-2 gap-3">
                    {PREGNANCY_OPTIONS.map((opt) => {
                      const active = selections.profile.pregnancy === opt.value;
                      return (
                        <SelectionCard
                          key={opt.value}
                          active={active}
                          onClick={() =>
                            setSelections((s) => ({
                              ...s,
                              profile: { ...s.profile, pregnancy: opt.value },
                            }))
                          }
                        >
                          <p className="font-bold text-zinc-900">{opt.label}</p>
                        </SelectionCard>
                      );
                    })}
                  </div>
                </div>
              )}

              {selections.type === "kan" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-700">Tahlil açlık durumu</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {FASTING_OPTIONS.map((opt) => {
                      const active = selections.profile.fasting === opt.value;
                      return (
                        <SelectionCard
                          key={opt.value}
                          active={active}
                          onClick={() =>
                            setSelections((s) => ({
                              ...s,
                              profile: { ...s.profile, fasting: opt.value },
                            }))
                          }
                        >
                          <p className="text-sm font-bold text-zinc-900">{opt.label}</p>
                        </SelectionCard>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="chronic-conditions"
                  className="text-xs font-semibold text-zinc-700"
                >
                  Bilinen kronik hastalığınız varsa yazın{" "}
                  <span className="font-normal text-zinc-500">(opsiyonel)</span>
                </label>
                <input
                  id="chronic-conditions"
                  type="text"
                  value={selections.profile.chronicConditions}
                  onChange={(e) =>
                    setSelections((s) => ({
                      ...s,
                      profile: { ...s.profile, chronicConditions: e.target.value },
                    }))
                  }
                  placeholder="Örn: Tip 2 diyabet, hipertansiyon, hipotiroidi..."
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-[#1B3A6B] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20"
                  autoComplete="off"
                />
              </div>
            </section>

            <button
              type="button"
              disabled={!selectionsComplete}
              onClick={() => setStep("input")}
              className="w-full rounded-2xl py-3.5 text-base font-bold text-white shadow-clinical-card transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: "#1B3A6B" }}
            >
              Devam et
            </button>
          </div>
        )}

        {step === "input" && (
          <div className="space-y-6">
            <div>
              <h2 className="border-l-[3px] border-[#1B3A6B] pl-3 text-xl font-bold tracking-tight text-zinc-900">
                Adım 2 / 2 — Rapor metni
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Kişisel verileri paylaşmadan önce gerekirse maskeleyebilirsiniz.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <textarea
                value={reportText}
                onChange={(e) => {
                  setPdfError(null);
                  setOcrError(null);
                  setReportText(e.target.value);
                }}
                placeholder="Rapor metnini buraya yapıştırın..."
                rows={14}
                className="min-h-[280px] w-full flex-1 resize-y rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-base leading-relaxed text-zinc-900 shadow-clinical-card placeholder:text-zinc-400 focus:border-[#1B3A6B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/25 sm:min-h-0"
              />

              <div className="flex shrink-0 flex-col gap-2 sm:w-48 sm:pt-1">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleCameraInputChange}
                />
                <input
                  ref={filePickerInputRef}
                  type="file"
                  accept="image/*,.pdf,.jpg,.jpeg,.png,.webp,application/pdf"
                  className="hidden"
                  onChange={handleFilePickerChange}
                />
                {isCoarsePointer ? (
                  <>
                    <button
                      type="button"
                      disabled={pdfLoading || ocrLoading || loading}
                      onClick={() => cameraInputRef.current?.click()}
                      className="rounded-2xl border-2 border-[#1B3A6B] bg-white px-4 py-3 text-sm font-bold text-[#1B3A6B] shadow-clinical-card transition hover:bg-[#1B3A6B]/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      📷 Fotoğraf Çek
                    </button>
                    <button
                      type="button"
                      disabled={pdfLoading || ocrLoading || loading}
                      onClick={() => filePickerInputRef.current?.click()}
                      className="rounded-2xl border-2 border-[#1B3A6B] bg-white px-4 py-3 text-sm font-bold leading-snug text-[#1B3A6B] shadow-clinical-card transition hover:bg-[#1B3A6B]/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      🖼️ Galeriden / Dosyadan Seç
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={pdfLoading || ocrLoading || loading}
                    onClick={() => filePickerInputRef.current?.click()}
                    className="rounded-2xl border-2 border-[#1B3A6B] bg-white px-4 py-3 text-sm font-bold leading-snug text-[#1B3A6B] shadow-clinical-card transition hover:bg-[#1B3A6B]/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Görsel veya PDF Yükle
                  </button>
                )}
                {(pdfLoading || ocrLoading) && (
                  <p className="text-center text-sm font-medium text-zinc-600 sm:text-left">
                    {pdfLoading ? "PDF okunuyor..." : "Rapor okunuyor..."}
                  </p>
                )}
              </div>
            </div>

            {pdfError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-clinical-card">
                {pdfError}
              </div>
            )}

            {ocrError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-clinical-card">
                {ocrError}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-clinical-card">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={loading || !reportText.trim()}
              onClick={analyze}
              className={`w-full rounded-2xl py-4 text-lg font-bold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${
                loading ? "animate-cta-loading" : "shadow-clinical-card"
              }`}
              style={{ backgroundColor: "#1B3A6B" }}
            >
              {loading ? "Analiz ediliyor…" : "Analiz Et"}
            </button>

            <button
              type="button"
              onClick={() => setStep("setup")}
              className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-[#1B3A6B] hover:underline"
            >
              ← Seçimlere dön
            </button>
          </div>
        )}

        {step === "result" &&
          result &&
          selections.reader &&
          selections.type &&
          selections.source && (
          <AnalysisOutput
            result={result}
            reportType={selections.type}
            source={selections.source}
            readerMode={selections.reader}
            onNewReport={() => {
              setResult(null);
              setReportText("");
              setStep("input");
            }}
            onChangeSelections={() => {
              setResult(null);
              setStep("setup");
            }}
          />
        )}
      </main>

      <AppFooter />
    </div>
  );
}
