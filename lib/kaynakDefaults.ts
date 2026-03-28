import type { KaynakEkleri, ReportSource, ReportType } from "./types";

export const DEFAULT_OZEL_SIGORTA_NOTU =
  "Özel sağlık sigortanız varsa bu raporu saklayın; masraflarınız için sigortanıza iletebilirsiniz.";

export const DEFAULT_RECETE_SGK_ECZANE =
  "Bu ilaçlar SGK tarafından karşılanıyor olabilir; eczanede teyit edin.";

export const DEFAULT_ENABIZ_IPUCLARI: Record<ReportType, string[]> = {
  kan: [
    "Sonuçlarınızı e-Nabız uygulaması veya e-Nabız web üzerinden takip edebilirsiniz.",
  ],
  epikriz: [
    "Taburcu belgenize e-Nabız üzerinden her zaman ulaşabilirsiniz.",
    "Kontrol için MHRS üzerinden randevu alabilirsiniz: mhrs.gov.tr",
  ],
  recete: [
    "Reçetenizi e-Nabız'dan görebilir, eczaneye QR kod ile iletebilirsiniz.",
  ],
  goruntuleme: [
    "Rapor özetinizi e-Nabız kayıtlarınızda kontrol edebilirsiniz.",
    "Kontrol için MHRS: mhrs.gov.tr",
  ],
};

export const DEFAULT_OZEL_BILGINIZE: Record<ReportType, string[]> = {
  kan: [
    "Bu tetkiklerin bir kısmını ileride devlet hastanesinde SGK ile ücretsiz yaptırma seçeneğinizi hekiminize sorabilirsiniz.",
  ],
  epikriz: [
    "Bu tetkiklerin bir kısmını devlet hastanesinde SGK ile ücretsiz yaptırabilirsiniz.",
    "Kontrol randevunuz için MHRS'yi de kullanabilirsiniz: mhrs.gov.tr",
    "Reçetenizi SGK'lı eczanelerde kullanabilirsiniz.",
  ],
  recete: ["Reçetenizi SGK'lı eczanelerde kullanabilirsiniz."],
  goruntuleme: [
    "Benzer görüntülemeyi ileride devlet hastanesinde SGK kapsamında değerlendirebilirsiniz.",
    "Kontrol randevunuz için MHRS'yi de kullanabilirsiniz: mhrs.gov.tr",
  ],
};

export function emptyKaynakEkleri(): KaynakEkleri {
  return {
    sgkBilgileri: [],
    enabizIpuclari: [],
    bilginize: [],
    ozelSigortaNotu: "",
    birimDonusumleri: [],
    turkiyedeTakip: {
      taniAdlandirma: "",
      bolum: "",
      doktoraDikkat: "",
    },
  };
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asBirimRows(v: unknown): KaynakEkleri["birimDonusumleri"] {
  if (!Array.isArray(v)) return [];
  const out: KaynakEkleri["birimDonusumleri"] = [];
  for (const row of v) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const orijinal = typeof r.orijinal === "string" ? r.orijinal.trim() : "";
    const turkiyeKarsiligi =
      typeof r.turkiyeKarsiligi === "string" ? r.turkiyeKarsiligi.trim() : "";
    const referansAraligi =
      typeof r.referansAraligi === "string" ? r.referansAraligi.trim() : "";
    if (orijinal || turkiyeKarsiligi || referansAraligi) {
      out.push({ orijinal, turkiyeKarsiligi, referansAraligi });
    }
  }
  return out;
}

function asTurkiyedeTakip(
  v: unknown
): KaynakEkleri["turkiyedeTakip"] {
  const empty = emptyKaynakEkleri().turkiyedeTakip;
  if (!v || typeof v !== "object") return empty;
  const o = v as Record<string, unknown>;
  return {
    taniAdlandirma:
      typeof o.taniAdlandirma === "string" ? o.taniAdlandirma.trim() : "",
    bolum: typeof o.bolum === "string" ? o.bolum.trim() : "",
    doktoraDikkat:
      typeof o.doktoraDikkat === "string" ? o.doktoraDikkat.trim() : "",
  };
}

export function coerceKaynakEkleri(
  raw: unknown,
  source: ReportSource,
  reportType: ReportType
): KaynakEkleri {
  const base = emptyKaynakEkleri();
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    base.sgkBilgileri = asStringArray(o.sgkBilgileri);
    base.enabizIpuclari = asStringArray(o.enabizIpuclari);
    base.bilginize = asStringArray(o.bilginize);
    base.ozelSigortaNotu =
      typeof o.ozelSigortaNotu === "string" ? o.ozelSigortaNotu.trim() : "";
    base.birimDonusumleri = asBirimRows(o.birimDonusumleri);
    base.turkiyedeTakip = asTurkiyedeTakip(o.turkiyedeTakip);
  }

  if (source === "e-nabiz") {
    if (base.enabizIpuclari.length === 0) {
      base.enabizIpuclari = [...DEFAULT_ENABIZ_IPUCLARI[reportType]];
    }
    if (
      reportType === "recete" &&
      base.sgkBilgileri.every(
        (s) => !/SGK|eczane|karşılan/i.test(s)
      )
    ) {
      base.sgkBilgileri = [...base.sgkBilgileri, DEFAULT_RECETE_SGK_ECZANE];
    }
  }

  if (source === "ozel") {
    if (base.bilginize.length === 0) {
      base.bilginize = [...DEFAULT_OZEL_BILGINIZE[reportType]];
    }
    if (!base.ozelSigortaNotu) {
      base.ozelSigortaNotu = DEFAULT_OZEL_SIGORTA_NOTU;
    }
  }

  return base;
}
