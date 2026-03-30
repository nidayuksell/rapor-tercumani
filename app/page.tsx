"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppFooter } from "@/components/AppFooter";
import { AnalysisOutput } from "@/components/AnalysisOutput";
import { LogoMark } from "@/components/BrandLogo";
import { HeroMedicalArt } from "@/components/HeroMedicalArt";
import { SelectionCard } from "@/components/SelectionCard";
import { extractTextFromPdfFile } from "@/lib/extractPdfText";
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
  const [navScrolled, setNavScrolled] = useState(false);
  const uploadRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () => setIsCoarsePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-fade]"));
    if (nodes.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  function scrollToUpload() {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToHow() {
    howRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
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
    <div className="min-h-screen bg-white">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          navScrolled
            ? "border-b border-zinc-200 bg-white/96 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <LogoMark size="sm" />
            <span className={`text-sm font-semibold ${navScrolled ? "text-zinc-900" : "text-white drop-shadow-sm"}`}>
              Rapor Tercümanı
            </span>
          </div>
          <nav className="flex items-center gap-5">
            <button
              type="button"
              onClick={scrollToHow}
              className={`text-sm font-medium transition-colors ${
                navScrolled ? "text-zinc-700 hover:text-[#F97316]" : "text-white hover:text-orange-200"
              }`}
            >
              Nasıl Çalışır
            </button>
            <button
              type="button"
              onClick={scrollToUpload}
              className="rounded-xl bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#F97316]"
            >
              Raporu Yükle
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-20">
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div data-fade className="fade-on-scroll">
              <h1 className="text-[38px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 sm:text-[52px]">
                Tıbbi raporunuzu anlamak artık çok kolay
              </h1>
              <p className="mt-6 text-[18px] font-normal leading-relaxed text-zinc-500">
                Kan tahlilinden epikrize, MR raporundan reçeteye — yapay zeka destekli Rapor
                Tercümanı her belgeyi sizin için sade Türkçeye çeviriyor.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "🔒 Verileriniz saklanmaz",
                  "⚡ Saniyeler içinde sonuç",
                  "🇹🇷 Türk sağlık sistemine özel",
                ].map((x) => (
                  <span
                    key={x}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-sm text-zinc-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  >
                    {x}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={scrollToUpload}
                  className="rounded-xl bg-[#1B3A6B] px-6 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#F97316]"
                >
                  Raporu Yükle →
                </button>
              </div>
            </div>
            <div data-fade className="fade-on-scroll">
              <HeroMedicalArt />
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div data-fade className="fade-on-scroll">
              <h2 className="mb-12 text-[32px] font-bold tracking-tight text-zinc-900">
                Tıbbi raporlar neden bu kadar zor?
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  ["Karmaşık terimler", "Doktor raporlarında teknik dil ve kısaltmalar günlük dilde anlaşılmayabilir."],
                  ["Zaman baskısı", "Muayene sırasında tüm detayları sormak ve not etmek çoğu zaman mümkün olmuyor."],
                  ["Belirsizlik", "Hangi değer normal, hangi bulgu önemli; hasta için ayrımı yapmak zorlaşıyor."],
                ].map(([t, d]) => (
                  <article
                    key={t}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-7 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  >
                    <h3 className="text-[20px] font-semibold text-[#1B3A6B]">{t}</h3>
                    <p className="mt-4 text-[16px] leading-relaxed text-zinc-600">{d}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" ref={howRef} className="bg-white py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div data-fade className="fade-on-scroll">
              <h2 className="mb-12 text-[32px] font-bold tracking-tight text-zinc-900">Nasıl Çalışır?</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  ["1", "Raporunu yükle veya yapıştır"],
                  ["2", "Rapor türünü seç"],
                  ["3", "Sade Türkçe analiz al"],
                ].map(([n, t]) => (
                  <div
                    key={n}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-7 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  >
                    <p className="text-3xl font-bold text-[#1B3A6B]">{n}</p>
                    <p className="mt-4 text-[18px] font-normal text-zinc-700">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="upload" ref={uploadRef} className="bg-[#F8FAFC] py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div data-fade className="fade-on-scroll rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-7 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-8">
              <h2 className="mb-12 text-[32px] font-bold tracking-tight text-zinc-900">Raporunu Analiz Et</h2>
              <div className="space-y-8">
                <section className="space-y-4">
                  <h3 className="text-[20px] font-semibold text-[#1B3A6B]">Rapor kaynağı</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {SOURCE_OPTIONS.map((opt) => {
                      const active = selections.source === opt.value;
                      return (
                        <SelectionCard
                          key={opt.value}
                          active={active}
                          onClick={() => setSelections((s) => ({ ...s, source: opt.value }))}
                        >
                          <p className="font-bold text-zinc-900">{opt.label}</p>
                          <p className="mt-1 text-sm text-zinc-500">{opt.hint}</p>
                        </SelectionCard>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[20px] font-semibold text-[#1B3A6B]">Rapor türü</h3>
                  <div className="grid gap-4 sm:grid-cols-4">
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
                              profile: { ...s.profile, fasting: opt.value === "kan" ? s.profile.fasting : null },
                            }))
                          }
                        >
                          <p className="text-2xl">{opt.emoji}</p>
                          <p className="mt-2 text-sm font-bold text-zinc-900">{opt.label}</p>
                        </SelectionCard>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[20px] font-semibold text-[#1B3A6B]">Kim için?</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {READER_OPTIONS.map((opt) => {
                      const active = selections.reader === opt.value;
                      return (
                        <SelectionCard
                          key={opt.value}
                          active={active}
                          onClick={() => setSelections((s) => ({ ...s, reader: opt.value }))}
                        >
                          <p className="font-bold text-zinc-900">{opt.label}</p>
                          <p className="mt-1 text-sm text-zinc-500">{opt.hint}</p>
                        </SelectionCard>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[20px] font-semibold text-[#1B3A6B]">👤 Sizin Hakkınızda</h3>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-zinc-700">Yaş aralığı</p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {AGE_OPTIONS.map((opt) => (
                        <SelectionCard
                          key={opt.value}
                          active={selections.profile.ageRange === opt.value}
                          onClick={() =>
                            setSelections((s) => ({
                              ...s,
                              profile: { ...s.profile, ageRange: opt.value },
                            }))
                          }
                        >
                          <p className="text-sm font-bold text-zinc-900">{opt.label}</p>
                        </SelectionCard>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-zinc-700">Cinsiyet</p>
                    <div className="grid grid-cols-2 gap-4">
                      {GENDER_OPTIONS.map((opt) => (
                        <SelectionCard
                          key={opt.value}
                          active={selections.profile.gender === opt.value}
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
                      ))}
                    </div>
                  </div>

                  {selections.profile.gender === "kadin" && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-zinc-700">Gebelik</p>
                      <div className="grid grid-cols-2 gap-4">
                        {PREGNANCY_OPTIONS.map((opt) => (
                          <SelectionCard
                            key={opt.value}
                            active={selections.profile.pregnancy === opt.value}
                            onClick={() =>
                              setSelections((s) => ({
                                ...s,
                                profile: { ...s.profile, pregnancy: opt.value },
                              }))
                            }
                          >
                            <p className="font-bold text-zinc-900">{opt.label}</p>
                          </SelectionCard>
                        ))}
                      </div>
                    </div>
                  )}

                  {selections.type === "kan" && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-zinc-700">Açlık durumu</p>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {FASTING_OPTIONS.map((opt) => (
                          <SelectionCard
                            key={opt.value}
                            active={selections.profile.fasting === opt.value}
                            onClick={() =>
                              setSelections((s) => ({
                                ...s,
                                profile: { ...s.profile, fasting: opt.value },
                              }))
                            }
                          >
                            <p className="text-sm font-bold text-zinc-900">{opt.label}</p>
                          </SelectionCard>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="chronic-conditions" className="text-sm font-semibold text-zinc-700">
                      Bilinen kronik hastalığınız varsa yazın (opsiyonel)
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
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B3A6B] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20"
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[20px] font-semibold text-[#1B3A6B]">Rapor metni / dosya</h3>
                  <div className="flex flex-col gap-4 lg:flex-row">
                    <textarea
                      value={reportText}
                      onChange={(e) => {
                        setPdfError(null);
                        setOcrError(null);
                        setReportText(e.target.value);
                      }}
                      placeholder={
                        "Rapor metnini buraya yapıştırın...\n\n💡 İpucu: Raporun tamamını yapıştırmak daha doğru ve kapsamlı sonuç almanızı sağlar."
                      }
                      rows={14}
                      className="min-h-[280px] w-full resize-y rounded-2xl border border-[#E5E7EB] bg-white p-5 text-[16px] leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B3A6B] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20"
                    />

                    <div className="flex shrink-0 flex-col gap-3 lg:w-60">
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
                            className="rounded-xl bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#F97316] disabled:opacity-50"
                          >
                            📷 Fotoğraf Çek
                          </button>
                          <button
                            type="button"
                            disabled={pdfLoading || ocrLoading || loading}
                            onClick={() => filePickerInputRef.current?.click()}
                            className="rounded-xl bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#F97316] disabled:opacity-50"
                          >
                            🖼️ Galeriden / Dosyadan Seç
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={pdfLoading || ocrLoading || loading}
                          onClick={() => filePickerInputRef.current?.click()}
                          className="rounded-xl bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#F97316] disabled:opacity-50"
                        >
                          Görsel veya PDF Yükle
                        </button>
                      )}
                      {(pdfLoading || ocrLoading) && (
                        <p className="text-sm text-zinc-600">{pdfLoading ? "PDF okunuyor..." : "Rapor okunuyor..."}</p>
                      )}
                    </div>
                  </div>

                  {pdfError && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      {pdfError}
                    </div>
                  )}
                  {ocrError && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      {ocrError}
                    </div>
                  )}
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
                  )}

                  <p className="text-sm text-zinc-500">
                    💡 İpucu: Raporun tamamını yapıştırmak daha doğru ve kapsamlı sonuç almanızı sağlar.
                  </p>
                  <button
                    type="button"
                    disabled={loading || !reportText.trim() || !selectionsComplete}
                    onClick={analyze}
                    className={`rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-colors duration-200 ${
                      loading ? "animate-cta-loading bg-[#1B3A6B]" : "bg-[#1B3A6B] hover:bg-[#F97316]"
                    } disabled:cursor-not-allowed disabled:opacity-45`}
                  >
                    {loading ? "Analiz ediliyor…" : "Analiz Et"}
                  </button>
                </section>
              </div>
            </div>
          </div>
        </section>

        <section id="results" ref={resultsRef} className="bg-white py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div data-fade className={`fade-on-scroll ${result ? "is-visible animate-result-enter" : ""}`}>
              <h2 className="mb-12 text-[32px] font-bold tracking-tight text-zinc-900">Sonuçlar</h2>
              {result && selections.reader && selections.type && selections.source ? (
                <AnalysisOutput
                  result={result}
                  reportType={selections.type}
                  source={selections.source}
                  readerMode={selections.reader}
                  onNewReport={() => {
                    setResult(null);
                    setReportText("");
                    scrollToUpload();
                  }}
                  onChangeSelections={() => {
                    setResult(null);
                    scrollToUpload();
                  }}
                />
              ) : (
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-7 py-10 text-[16px] text-zinc-600 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  Analiz sonuçları burada görünecek. Önce raporunuzu yükleyip <strong>Analiz Et</strong> butonuna basın.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
