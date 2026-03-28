import { coerceKaynakEkleri } from "@/lib/kaynakDefaults";
import type {
  AbnormalDirection,
  AnalysisResult,
  AnalysisResultEpikriz,
  AnalysisResultGoruntuleme,
  AnalysisResultKan,
  AnalysisResultRecete,
  DegerAccordionItem,
  EpikrizDikkatItem,
  EpikrizIlacRow,
  EpikrizKontrol,
  GoruntulemeBulgu,
  GoruntulemeOnemKatman,
  NeDiyorTableRow,
  ReceteGunlukProgram,
  ReceteIlacRow,
  ReportSource,
  ReportType,
  UrgencyLevel,
} from "@/lib/types";

export function normalizeUrgency(value: unknown): UrgencyLevel {
  const s = String(value ?? "")
    .toLowerCase()
    .trim();
  if (s === "green" || s === "rutin" || s === "routine" || s === "low") return "green";
  if (s === "yellow" || s === "yakinda" || s === "soon" || s === "medium") return "yellow";
  if (s === "red" || s === "bugun" || s === "today" || s === "urgent" || s === "high") return "red";
  return "yellow";
}

function normalizeDirection(value: unknown): AbnormalDirection | null {
  const s = String(value ?? "")
    .toLowerCase()
    .trim();
  if (
    s === "high" ||
    s === "yuksek" ||
    s === "yüksek" ||
    s === "up" ||
    s === "elevated"
  )
    return "high";
  if (s === "low" || s === "dusuk" || s === "düşük" || s === "down" || s === "decreased")
    return "low";
  return null;
}

function coerceTableRow(item: unknown): NeDiyorTableRow | null {
  if (!item || typeof item !== "object") return null;
  const r = item as Record<string, unknown>;
  const deger = String(r.deger ?? r.name ?? r.param ?? r.test ?? "").trim();
  const aciklama = String(r.aciklama ?? r.description ?? r.aciklamaKisa ?? "").trim();
  const direction = normalizeDirection(r.durum ?? r.direction ?? r.yon);
  if (!deger || !direction) return null;
  return { deger, aciklama: aciklama || "—", direction };
}

function coerceNeDiyorBlock(raw: unknown): { rows: NeDiyorTableRow[]; summaryLine: string } {
  if (Array.isArray(raw)) {
    const rows = raw.map(coerceTableRow).filter((x): x is NeDiyorTableRow => x !== null);
    return {
      rows,
      summaryLine:
        rows.length > 0
          ? `${rows.length} değeriniz referans aralığı dışında.`
          : "Referans aralığı dışında değer tespit edilmedi.",
    };
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const rowsRaw = o.satirlar ?? o.rows ?? o.tablo;
    const ozet = String(o.ozet ?? o.summaryLine ?? o.ozetCumle ?? "").trim();
    const rows = Array.isArray(rowsRaw)
      ? rowsRaw.map(coerceTableRow).filter((x): x is NeDiyorTableRow => x !== null)
      : [];
    return {
      rows,
      summaryLine:
        ozet ||
        (rows.length > 0
          ? `${rows.length} değeriniz referans aralığı dışında.`
          : "Referans aralığı dışında değer tespit edilmedi."),
    };
  }
  if (typeof raw === "string" && raw.trim()) {
    return { rows: [], summaryLine: raw.trim() };
  }
  return { rows: [], summaryLine: "" };
}

function coerceNeDiyorFromRoot(o: Record<string, unknown>): { rows: NeDiyorTableRow[]; summaryLine: string } {
  const flatRows = o.neDiyorSatirlar ?? o.neDiyorRows;
  const flatOzet = String(o.neDiyorOzet ?? o.neDiyorOzeti ?? "").trim();
  if (Array.isArray(flatRows)) {
    const rows = flatRows.map(coerceTableRow).filter((x): x is NeDiyorTableRow => x !== null);
    return {
      rows,
      summaryLine:
        flatOzet ||
        (rows.length > 0
          ? `${rows.length} değeriniz referans aralığı dışında.`
          : "Referans aralığı dışında değer tespit edilmedi."),
    };
  }
  return coerceNeDiyorBlock(o.neDiyor);
}

function coerceAccordionItem(item: unknown): DegerAccordionItem | null {
  if (!item || typeof item !== "object") return null;
  const r = item as Record<string, unknown>;
  const baslik = String(r.baslik ?? r.label ?? r.adi ?? r.name ?? "").trim();
  const tekCumle = String(r.tekCumle ?? r.oneLiner ?? r.aciklama ?? r.text ?? "").trim();
  const direction = normalizeDirection(r.yon ?? r.direction ?? r.durum);
  if (!baslik || !tekCumle || !direction) return null;
  return { baslik, direction, tekCumle };
}

export function coerceDoktoraSorun(raw: unknown, fallback: string): [string, string, string] {
  const arr = Array.isArray(raw) ? raw.map((x) => String(x ?? "").trim()).filter(Boolean) : [];
  const out: string[] = [...arr];
  while (out.length < 3) out.push(fallback);
  return [out[0]!, out[1]!, out[2]!];
}

function coerceKan(o: Record<string, unknown>, source: ReportSource): AnalysisResultKan {
  const neDiyor = coerceNeDiyorFromRoot(o);
  const degerlerRaw = o.degerlerNeDemek ?? o.termExplainer ?? o.degerAciklamalari;
  const degerlerNeDemek = Array.isArray(degerlerRaw)
    ? degerlerRaw.map(coerceAccordionItem).filter((x): x is DegerAccordionItem => x !== null)
    : [];
  return {
    reportType: "kan",
    urgency: normalizeUrgency(o.urgency),
    kaynakEkleri: coerceKaynakEkleri(o.kaynakEkleri, source, "kan"),
    neDiyor: {
      rows: neDiyor.rows,
      summaryLine:
        neDiyor.summaryLine ||
        (neDiyor.rows.length > 0
          ? `${neDiyor.rows.length} değeriniz referans aralığı dışında.`
          : "Referans aralığı dışında değer tespit edilmedi."),
    },
    neAnlamaGeliyor: String(o.neAnlamaGeliyor ?? "").trim(),
    degerlerNeDemek,
    doktoraSorun: coerceDoktoraSorun(
      o.doktoraSorun,
      "Bu kan tablosunu hekiminizle birlikte nasıl yorumlayacağınızı konuşabilir misiniz?",
    ),
    yakinModu: String(o.yakinModu ?? "").trim(),
  };
}

function coerceIlacTakvimRow(item: unknown): EpikrizIlacRow | null {
  if (!item || typeof item !== "object") return null;
  const r = item as Record<string, unknown>;
  const ilacAdi = String(r.ilacAdi ?? r.ad ?? r.name ?? "").trim();
  if (!ilacAdi) return null;
  return {
    ilacAdi,
    neZaman: String(r.neZaman ?? r.zaman ?? "").trim() || "—",
    nasil: String(r.nasil ?? r.kullanim ?? r.sekil ?? "").trim() || "—",
  };
}

function coerceKontrol(item: unknown): EpikrizKontrol | null {
  if (!item || typeof item !== "object") return null;
  const r = item as Record<string, unknown>;
  const bolum = String(r.bolum ?? r.poliklinik ?? r.klinik ?? "").trim();
  const tarihGosterim = String(r.tarihGosterim ?? r.tarih ?? r.gun ?? "").trim();
  const tarihISO = String(r.tarihISO ?? r.iso ?? "").trim() || undefined;
  if (!bolum && !tarihGosterim) return null;
  return {
    bolum: bolum || "—",
    tarihGosterim: tarihGosterim || "—",
    tarihISO,
    saat: String(r.saat ?? r.saatAraligi ?? "").trim() || undefined,
  };
}

function coerceDikkatItem(item: unknown): EpikrizDikkatItem | null {
  if (!item || typeof item !== "object") return null;
  const r = item as Record<string, unknown>;
  const emoji = String(r.emoji ?? r.icon ?? "•").trim();
  const metin = String(r.metin ?? r.text ?? r.aciklama ?? "").trim();
  if (!metin) return null;
  return { emoji: emoji || "•", metin };
}

function coerceEpikriz(o: Record<string, unknown>, source: ReportSource): AnalysisResultEpikriz {
  const ilacRaw = o.ilacTakvimi ?? o.ilaclar;
  const ilacTakvimi = Array.isArray(ilacRaw)
    ? ilacRaw.map(coerceIlacTakvimRow).filter((x): x is EpikrizIlacRow => x !== null)
    : [];
  const alarmRaw = o.alarmSinyalleri ?? o.alarmlar;
  const alarmSinyalleri = Array.isArray(alarmRaw)
    ? alarmRaw.map((x) => String(x ?? "").trim()).filter(Boolean)
    : [];
  const kontrolRaw = o.kontrolRandevulari ?? o.randevular ?? o.kontroller;
  const kontrolRandevulari = Array.isArray(kontrolRaw)
    ? kontrolRaw.map(coerceKontrol).filter((x): x is EpikrizKontrol => x !== null)
    : [];
  const dikkatRaw = o.dikkatListesi ?? o.kisitlamalar ?? o.dikkat;
  const dikkatListesi = Array.isArray(dikkatRaw)
    ? dikkatRaw.map(coerceDikkatItem).filter((x): x is EpikrizDikkatItem => x !== null)
    : [];

  return {
    reportType: "epikriz",
    urgency: normalizeUrgency(o.urgency),
    kaynakEkleri: coerceKaynakEkleri(o.kaynakEkleri, source, "epikriz"),
    ilacTakvimi,
    alarmSinyalleri:
      alarmSinyalleri.length > 0
        ? alarmSinyalleri
        : [
            "Nefes darlığı, göğüs ağrısı veya bayılma hissi olursa acile başvurun.",
            "Belirtiler hızla kötüleşirse 112’yi arayın.",
          ],
    kontrolRandevulari,
    dikkatListesi,
    doktoraSorun: coerceDoktoraSorun(
      o.doktoraSorun,
      "Taburcu sonrası ilaçlarımı ve kontrol tarihlerimi netleştirebilir miyiz?",
    ),
    yakinModu: String(o.yakinModu ?? "").trim(),
  };
}

function coerceBulgu(item: unknown): GoruntulemeBulgu | null {
  if (!item || typeof item !== "object") return null;
  const r = item as Record<string, unknown>;
  const basitTurkce = String(r.basitTurkce ?? r.bulgular ?? r.metin ?? "").trim();
  const bolge = String(r.bolge ?? r.organ ?? r.lokasyon ?? "").trim();
  if (!basitTurkce) return null;
  return {
    basitTurkce,
    bolge: bolge || "—",
    gunlukHayat: String(r.gunlukHayat ?? r.gunlukEtki ?? "").trim() || "—",
  };
}

function emptyOnem(): GoruntulemeOnemKatman {
  return { maddeler: [], aciklama: "Bu kategoride ayrı madde belirtilmedi." };
}

function coerceOnemKatman(raw: unknown): GoruntulemeOnemKatman {
  if (!raw || typeof raw !== "object") return emptyOnem();
  const r = raw as Record<string, unknown>;
  const m = r.maddeler ?? r.items ?? r.liste ?? r.satirlar;
  const maddeler = Array.isArray(m) ? m.map((x) => String(x ?? "").trim()).filter(Boolean) : [];
  const aciklama = String(r.aciklama ?? r.ozet ?? "").trim();
  return {
    maddeler,
    aciklama: aciklama || (maddeler.length ? "" : "Belirtilmedi."),
  };
}

function coerceGoruntuleme(o: Record<string, unknown>, source: ReportSource): AnalysisResultGoruntuleme {
  const nb = o.neBulundu ?? o.bulgular;
  const neBulundu = Array.isArray(nb)
    ? nb.map(coerceBulgu).filter((x): x is GoruntulemeBulgu => x !== null)
    : [];
  const om = o.onemliMi ?? o.onem;
  let onemliMi: AnalysisResultGoruntuleme["onemliMi"];
  if (om && typeof om === "object" && !Array.isArray(om)) {
    const x = om as Record<string, unknown>;
    onemliMi = {
      takipGerektiren: coerceOnemKatman(x.takipGerektiren ?? x.kirmizi ?? x.red),
      gozetim: coerceOnemKatman(x.gozetim ?? x.sari ?? x.yellow),
      normal: coerceOnemKatman(x.normal ?? x.yesil ?? x.green),
    };
  } else {
    onemliMi = {
      takipGerektiren: emptyOnem(),
      gozetim: emptyOnem(),
      normal: emptyOnem(),
    };
  }
  return {
    reportType: "goruntuleme",
    urgency: normalizeUrgency(o.urgency),
    kaynakEkleri: coerceKaynakEkleri(o.kaynakEkleri, source, "goruntuleme"),
    neBulundu,
    onemliMi,
    takipOnerisi:
      String(o.takipOnerisi ?? o.takip ?? "").trim() ||
      "Raporda takip önerisi belirtilmemiş, hekiminize sorun.",
    doktoraSorun: coerceDoktoraSorun(
      o.doktoraSorun,
      "Görüntüleme bulgularım için tedavi veya takip gerekir mi?",
    ),
    yakinModu: String(o.yakinModu ?? "").trim(),
  };
}

function coerceReceteIlac(item: unknown): ReceteIlacRow | null {
  if (!item || typeof item !== "object") return null;
  const r = item as Record<string, unknown>;
  const ilacAdi = String(r.ilacAdi ?? r.ad ?? r.name ?? "").trim();
  if (!ilacAdi) return null;
  return {
    ilacAdi,
    doz: String(r.doz ?? "").trim() || "—",
    gunlukKacKez: String(r.gunlukKacKez ?? r.siklik ?? r.frekans ?? "").trim() || "—",
    neZaman: String(r.neZaman ?? r.zaman ?? "").trim() || "—",
    kacGun: String(r.kacGun ?? r.sure ?? "").trim() || "—",
    neIcin: String(r.neIcin ?? r.endikasyon ?? "").trim() || undefined,
    zamanNotu: String(r.zamanNotu ?? "").trim() || undefined,
  };
}

function coerceGunlukProgram(raw: unknown): ReceteGunlukProgram {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const arr = (k: string) =>
    Array.isArray(r[k]) ? (r[k] as unknown[]).map((x) => String(x ?? "").trim()).filter(Boolean) : [];
  return {
    sabahAc: arr("sabahAc"),
    sabahYemek: arr("sabahYemek"),
    oglen: arr("oglen"),
    aksamYemek: arr("aksamYemek"),
    gece: arr("gece"),
  };
}

function coerceRecete(o: Record<string, unknown>, source: ReportSource): AnalysisResultRecete {
  const ilaclarRaw = o.ilaclar ?? o.receteIlaclari;
  const ilaclar = Array.isArray(ilaclarRaw)
    ? ilaclarRaw.map(coerceReceteIlac).filter((x): x is ReceteIlacRow => x !== null)
    : [];
  const duRaw = o.dikkatUyari ?? o.uyarilar ?? o.etkilesimler;
  const dikkatUyari = Array.isArray(duRaw)
    ? duRaw.map((x) => String(x ?? "").trim()).filter(Boolean)
    : [];
  const ecRaw = o.eczaneChecklist ?? o.eczane ?? o.checklist;
  const defaultEczane = [
    "Jenerik alternatif var mı?",
    "SGK ödeme kapsamında mı?",
    "Buzdolabında saklanması gerekiyor mu?",
  ];
  let eczaneChecklist = Array.isArray(ecRaw)
    ? ecRaw.map((x) => String(x ?? "").trim()).filter(Boolean)
    : [];
  if (eczaneChecklist.length === 0) eczaneChecklist = defaultEczane;

  return {
    reportType: "recete",
    urgency: normalizeUrgency(o.urgency),
    kaynakEkleri: coerceKaynakEkleri(o.kaynakEkleri, source, "recete"),
    ilaclar,
    gunlukProgram: coerceGunlukProgram(o.gunlukProgram ?? o.gunlukIlacProgrami),
    dikkatUyari:
      dikkatUyari.length > 0
        ? dikkatUyari
        : [
            "Reçetede yazılan doz ve süreyi aşmayın; şikâyet olursa hekime danışın.",
            "Birden fazla ilaç kullanıyorsanız etkileşim riski için eczacınıza sorun.",
          ],
    eczaneChecklist,
    doktoraSorun: coerceDoktoraSorun(
      o.doktoraSorun,
      "Bu ilaçları neden kullanıyorum ve ne kadar süre almalıyım?",
    ),
    yakinModu: String(o.yakinModu ?? "").trim(),
  };
}

export function coerceAnalysisResult(
  raw: unknown,
  reportType: ReportType,
  source: ReportSource,
): AnalysisResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("Geçersiz yanıt");
  }
  const o = raw as Record<string, unknown>;

  switch (reportType) {
    case "epikriz":
      return coerceEpikriz(o, source);
    case "goruntuleme":
      return coerceGoruntuleme(o, source);
    case "recete":
      return coerceRecete(o, source);
    default:
      return coerceKan(o, source);
  }
}

export const URGENCY_BANNER: Record<
  UrgencyLevel,
  { emoji: string; line: string; bg: string; border: string; text: string }
> = {
  green: {
    emoji: "🟢",
    line: "Rutin — Randevunuzda söyleyin",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
  },
  yellow: {
    emoji: "🟡",
    line: "Yakında Git — 1 hafta içinde doktora gidin",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-950",
  },
  red: {
    emoji: "🔴",
    line: "Bugün Git — En kısa sürede doktora başvurun",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-950",
  },
};
