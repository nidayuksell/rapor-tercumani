export type ReportSource = "e-nabiz" | "ozel" | "yurtdisi";
export type ReportType = "kan" | "goruntuleme" | "recete" | "epikriz";
export type ReaderMode = "self" | "relative";

/** Hasta profili — referans yorumu için */
export type AgeRange = "0-17" | "18-35" | "36-55" | "55+";
export type Gender = "kadin" | "erkek";
export type PregnancyStatus = "gebe-degil" | "gebe";
/** Kan tahlili için; yalnızca rapor türü kan iken anlamlı */
export type FastingStatus = "ac" | "tok" | "bilinmiyor";

export type PatientProfile = {
  ageRange: AgeRange | null;
  gender: Gender | null;
  pregnancy: PregnancyStatus | null;
  fasting: FastingStatus | null;
  chronicConditions: string;
};

export const EMPTY_PATIENT_PROFILE: PatientProfile = {
  ageRange: null,
  gender: null,
  pregnancy: null,
  fasting: null,
  chronicConditions: "",
};

export type UrgencyLevel = "green" | "yellow" | "red";

export type AbnormalDirection = "high" | "low";

export type NeDiyorTableRow = {
  deger: string;
  aciklama: string;
  direction: AbnormalDirection;
};

export type DegerAccordionItem = {
  baslik: string;
  direction: AbnormalDirection;
  tekCumle: string;
};

export type UserSelections = {
  source: ReportSource | null;
  type: ReportType | null;
  reader: ReaderMode | null;
  profile: PatientProfile;
};

export type BirimDonusumSatir = {
  orijinal: string;
  turkiyeKarsiligi: string;
  referansAraligi: string;
};

/** Kaynak (e-Nabız / özel / yurt dışı) için model + UI ekleri */
export type KaynakEkleri = {
  sgkBilgileri: string[];
  enabizIpuclari: string[];
  bilginize: string[];
  ozelSigortaNotu: string;
  birimDonusumleri: BirimDonusumSatir[];
  turkiyedeTakip: {
    taniAdlandirma: string;
    bolum: string;
    doktoraDikkat: string;
  };
};

/** Kan tahlili */
export type AnalysisResultKan = {
  reportType: "kan";
  urgency: UrgencyLevel;
  kaynakEkleri: KaynakEkleri;
  neDiyor: {
    rows: NeDiyorTableRow[];
    summaryLine: string;
  };
  neAnlamaGeliyor: string;
  degerlerNeDemek: DegerAccordionItem[];
  doktoraSorun: [string, string, string];
  yakinModu: string;
};

export type EpikrizIlacRow = {
  ilacAdi: string;
  neZaman: string;
  nasil: string;
};

export type EpikrizKontrol = {
  tarihGosterim: string;
  tarihISO?: string;
  bolum: string;
  saat?: string;
};

export type EpikrizDikkatItem = {
  emoji: string;
  metin: string;
};

export type AnalysisResultEpikriz = {
  reportType: "epikriz";
  urgency: UrgencyLevel;
  kaynakEkleri: KaynakEkleri;
  ilacTakvimi: EpikrizIlacRow[];
  alarmSinyalleri: string[];
  kontrolRandevulari: EpikrizKontrol[];
  dikkatListesi: EpikrizDikkatItem[];
  doktoraSorun: [string, string, string];
  yakinModu: string;
};

export type GoruntulemeBulgu = {
  basitTurkce: string;
  bolge: string;
  gunlukHayat: string;
};

export type GoruntulemeOnemKatman = {
  maddeler: string[];
  aciklama: string;
};

export type AnalysisResultGoruntuleme = {
  reportType: "goruntuleme";
  urgency: UrgencyLevel;
  kaynakEkleri: KaynakEkleri;
  neBulundu: GoruntulemeBulgu[];
  onemliMi: {
    takipGerektiren: GoruntulemeOnemKatman;
    gozetim: GoruntulemeOnemKatman;
    normal: GoruntulemeOnemKatman;
  };
  takipOnerisi: string;
  doktoraSorun: [string, string, string];
  yakinModu: string;
};

export type ReceteIlacRow = {
  ilacAdi: string;
  doz: string;
  gunlukKacKez: string;
  neZaman: string;
  kacGun: string;
  neIcin?: string;
  zamanNotu?: string;
};

export type ReceteGunlukProgram = {
  sabahAc?: string[];
  sabahYemek?: string[];
  oglen?: string[];
  aksamYemek?: string[];
  gece?: string[];
};

export type AnalysisResultRecete = {
  reportType: "recete";
  urgency: UrgencyLevel;
  kaynakEkleri: KaynakEkleri;
  ilaclar: ReceteIlacRow[];
  gunlukProgram: ReceteGunlukProgram;
  dikkatUyari: string[];
  eczaneChecklist: string[];
  doktoraSorun: [string, string, string];
  yakinModu: string;
};

export type AnalysisResult =
  | AnalysisResultKan
  | AnalysisResultEpikriz
  | AnalysisResultGoruntuleme
  | AnalysisResultRecete;
