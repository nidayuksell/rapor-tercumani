import type { PatientProfile, ReaderMode, ReportSource, ReportType } from "@/lib/types";

const SOURCE_LABELS: Record<ReportSource, string> = {
  "e-nabiz": "e-Nabız / SGK",
  ozel: "Özel Hastane",
  yurtdisi: "Yurt Dışı / İngilizce",
};

const TYPE_LABELS: Record<ReportType, string> = {
  kan: "Kan Tahlili",
  goruntuleme: "MR / Tomografi / Radyoloji",
  recete: "İlaç Reçetesi",
  epikriz: "Epikriz / Taburcu",
};

const KAYNAK_EKLERI_KEYS = `
  "kaynakEkleri": {
    "sgkBilgileri": [],
    "enabizIpuclari": [],
    "bilginize": [],
    "ozelSigortaNotu": "",
    "birimDonusumleri": [{"orijinal":"","turkiyeKarsiligi":"","referansAraligi":""}],
    "turkiyedeTakip": {"taniAdlandirma":"","bolum":"","doktoraDikkat":""}
  }`;

function yakinBlock(reader: ReaderMode): string {
  return reader === "relative"
    ? `yakinModu: Yakın modu — çok basit Türkçe, kısaltma yok.`
    : `yakinModu: Kendi okuma → ""`;
}

function sourceSystemContext(source: ReportSource): string {
  switch (source) {
    case "e-nabiz":
      return `KAYNAK BAĞLAMI (zorunlu): Bu rapor Türkiye kamu sağlık sistemi (SGK / e-Nabız) bağlamındadır. SGK'ye özgü terimleri kullan ve açıkla (SUT kodu, sevk, reçete türü vb.).
(EN) This report is from the Turkish public health system (SGK/e-Nabız). Use SGK-specific terminology. Be aware of Turkish public health system context.`;
    case "ozel":
      return `KAYNAK BAĞLAMI (zorunlu): Bu rapor Türkiye'deki bir özel hastaneden. Rapor daha ayrıntılı ve çok sayıda tetkik içerebilir; tüm bulguları anlaşılır şekilde açıkla.
(EN) This report is from a private hospital in Turkey. Reports may be more detailed with more tests. Explain all findings thoroughly.`;
    case "yurtdisi":
      return `KAYNAK BAĞLAMI (zorunlu): Bu rapor yurt dışından veya İngilizce olabilir. ÖNEMLİ: Bazı ülkeler laboratuvar değerleri için farklı birim kullanır; gerektiğinde Türkiye/Avrupa'da yaygın birimlere çevir ve referans aralıklarını ona göre yorumla. Tüm tıbbi terimleri Türkçeleştir. Tüm JSON metin alanları Türkçe olmalı (giriş dili ne olursa olsun).
(EN) This report is from abroad or in English. IMPORTANT: Some countries use different units for lab values. Always convert and compare to Turkish/European reference ranges. Translate all medical terms to Turkish. Keep the entire OUTPUT in Turkish regardless of input language.`;
  }
}

function kaynakEkleriFillGuide(source: ReportSource, reportType: ReportType): string {
  if (source === "e-nabiz") {
    const tips =
      reportType === "kan"
        ? "enabizIpuclari: örn. tahlil sonuçlarını e-Nabız uygulamasından takip."
        : reportType === "epikriz"
          ? "enabizIpuclari: taburcu belgesine e-Nabız'dan erişim; kontrol için MHRS (mhrs.gov.tr)."
          : reportType === "recete"
            ? "enabizIpuclari: reçeteyi e-Nabız'dan görme, eczanede QR ile iletme."
            : "enabizIpuclari: rapor özetini e-Nabız'da kontrol; MHRS ile randevu (mhrs.gov.tr).";
    return `kaynakEkleri (e-Nabız): sgkBilgileri — raporda geçen SUT kodları, sevk bilgisi veya SGK terimleri; her madde sade Türkçe (örnek üslup: "Sevk kodu: başka bir hastaneye yönlendirildiğiniz anlamına gelebilir"). Reçete raporunda ilaçların SGK kapsamı/eczane teyidi için kısa not ekle. ${tips} 2–4 madde. Diğer kaynakEkleri alanlarını boş bırak.`;
  }
  if (source === "ozel") {
    return `kaynakEkleri (özel hastane): bilginize — tetkik yapıldıysa devlet hastanesinde SGK ile ücretsiz seçenek; ilaç varsa SGK'lı eczane; kontrol/randevu varsa MHRS (mhrs.gov.tr). ozelSigortaNotu — özel sağlık sigortası için raporu saklama/masraf iadesi konusunda tek kısa cümle. sgkBilgileri ve enabizIpuclari boş dizi; birim/türkiyedeTakip boş.`;
  }
  return `kaynakEkleri (yurt dışı): birimDonusumleri — farklı birim varsa satırlar: orijinal değer + birim | Türkiye'de karşılığı + birim | referans/yorum (örn. glikoz mmol/L ↔ mg/dL). turkiyedeTakip — tanının Türkiye'deki adlandırılması, hangi bölüme gidileceği, Türk hekime gösterirken dikkat edilecekler. Diğer kaynakEkleri alanları boş.`;
}

const BASE = `YANIT: Tek JSON nesnesi. Markdown yok.
KESİNLİKLE YASAK: Kesin teşhis, ilaç/doz emri. Olasılık dili kullan.`;

function formatPatientProfileForPrompt(profile: PatientProfile, reportType: ReportType): string {
  const ageLabels: Record<NonNullable<PatientProfile["ageRange"]>, string> = {
    "0-17": "0-17 (Çocuk)",
    "18-35": "18-35",
    "36-55": "36-55",
    "55+": "55+",
  };
  const age = profile.ageRange ? ageLabels[profile.ageRange] : "—";
  const genderTr =
    profile.gender === "kadin" ? "Kadın" : profile.gender === "erkek" ? "Erkek" : "—";
  let pregnancyTr = "Uygulanmaz (cinsiyet erkek veya seçilmedi)";
  if (profile.gender === "kadin") {
    pregnancyTr =
      profile.pregnancy === "gebe"
        ? "Gebeyim"
        : profile.pregnancy === "gebe-degil"
          ? "Gebe değilim"
          : "—";
  }
  let fastingTr = "Uygulanmaz (kan tahlili seçilmedi)";
  if (reportType === "kan") {
    fastingTr =
      profile.fasting === "ac"
        ? "Aç karnına yapıldı"
        : profile.fasting === "tok"
          ? "Tok karnına yapıldı"
          : profile.fasting === "bilinmiyor"
            ? "Bilmiyorum"
            : "—";
  }
  const chronic = profile.chronicConditions.trim() || "Yok belirtildi";

  return `HASTA PROFİLİ (zorunlu bağlam — tüm yorumu buna göre ayarla):
Yaş aralığı: ${age}. Cinsiyet: ${genderTr}. Gebelik: ${pregnancyTr}. Açlık durumu (kan tahlili için): ${fastingTr}. Kronik hastalık / ilaç notu: ${chronic}.

Patient profile (machine-readable): Age range: ${profile.ageRange ?? "—"}, Gender: ${genderTr}, Pregnancy: ${pregnancyTr}, Fasting status: ${fastingTr}, Chronic conditions: ${chronic}`;
}

function patientProfileRulesKan(): string {
  return `KAN TAHLİLİ — HASTA PROFİLİ İLE YORUM:
1) Referans aralığı raporda yazıyorsa ÖNCELİK o aralıktır; rapordaki min-max ile karşılaştır.
2) Referans aralığı raporda YOK veya belirsizse: yaş aralığı, cinsiyet, gebelik (kadınlarda), açlık durumu ve kronik hastalıklara göre genel tıbbi standartları kullan.
3) Genel standart kullandığın her durumda neAnlamaGeliyor metnine veya ona bitişik şekilde ŞU CÜMLEYİ ekle (tam metin): "⚠️ Bu değer için raporunuzda referans aralığı belirtilmemiş — genel tıbbi standartlara ve yaş/cinsiyet bilginize göre değerlendirildi." (Birden fazla değer etkileniyorsa cümleyi bir kez kullanmak yeterli.)
4) Kronik hastalık belirtilmişse: ilgili parametreleri ona göre yorumla (ör. diyabet → HbA1c/glikoz; böbrek hastalığı → kreatinin/üre; tiroid → TSH vb.).
5) Gebelik: kadın ve gebe ise gebelikte değişen referansları dikkate al.
6) Açlık: aç karnına lipid/glikoz gibi tetkiklerde bağlamı belirt; tok karnına ise buna göre yorumla.`;
}

function patientProfileRulesGeneral(): string {
  return `HASTA PROFİLİ: Yaş, cinsiyet, gebelik ve kronik hastalıkları özet ve risk bağlamında dikkate al (uygunsa).`;
}

function kanAbnormalRules(): string {
  return `KAN TAHLİLİ — ANORMAL DEĞERLER (KRİTİK, MUTLAKA UYGULA):
- Rapordaki referans dışı TÜM değerleri analiz et: hem YÜKSEK (↑, üst sınır üstü, "yüksek", "pozitif", vb.) hem DÜŞÜK (↓, alt sınır altı, "düşük", vb.).
- Sadece düşük değerlere odaklanma; yüksek ve düşük eşit önceliklidir. Bir yönü ihmal etme.
- neDiyor.satirlar: her anormal satırda durum "yuksek" veya "dusuk" rapora göre DOĞRU atanmalı (her iki yön).
- degerlerNeDemek: hem yuksek hem dusuk için anormal olan her parametre için madde üret.
- Özet ve aciliyet: hem yüksek hem düşük anormallikleri skorlamada dikkate al.`;
}

function goruntulemeSpecificRules(): string {
  return `MR / RADYOLOJİ / GÖRÜNTÜLEME — DERİNLEMESİNE ANALİZ (GENEL "DOKTORA GİDİN" YETMEZ):
- neBulundu: Her bulgu için Türkçe, somut ve anlaşılır ifade kullan (ör. "boyun fıtığına işaret eden disk protrüzyonu", "disk yüksekliği kaybı", "sinir kökü baskısı" gibi raporda ne varsa onu adlandır). Latince/İngilizce kısaltma bırakma; sade Türkçe açıkla.
- Raporda spesifik tanı veya bulgu adı geçiyorsa: o tanının günlük hayatta ne anlama geldiğini 1-2 cümleyle açıkla (kesin teşhis koymadan, olasılık diliyle).
- gunlukHayat: O bulgunun tipik olarak neden olabileceği günlük belirtileri yaz (ör. ağrı, uyuşma, karıncalanma, hareket kısıtlılığı, baş dönmesi — rapora uygun).
- takipOnerisi ve onemliMi: "Hekime başvurun" demek yetmez; hangi uzmanlık dalının değerlendirmesi gerektiğini somut yaz (ör. beyin-beyin cerrahisi/nöroloji, ortopedi, fizik tedavi ve rehabilitasyon, göğüs hastalıkları, üroloji — bulguya göre).
- doktoraSorun: Üç soru da bulguya ÖZEL olmalı; "değerlerim normal mi?" gibi genel sorular YASAK. Örnek üslup: "Boyun fıtığı mı var, ameliyat mı gerekir yoksa fizik tedavi yeterli olur mu?" / "Bu disk kaybı ilerleyici mi, takip aralığı ne olmalı?" — rapordaki bulguya göre uyarla.
- Aciliyet: genel uyarı yerine bulguya dayalı gerekçe kullan.`;
}

export function buildAnalyzeSystemPrompt(
  reportType: ReportType,
  source: ReportSource,
  reader: ReaderMode,
  profile: PatientProfile,
): string {
  const sourceLabel = SOURCE_LABELS[source];
  const typeLabel = TYPE_LABELS[reportType];
  const ctx = `BAĞLAM: Kaynak ${sourceLabel}, rapor türü ${typeLabel}.`;
  const yk = yakinBlock(reader);
  const srcCtx = sourceSystemContext(source);
  const keGuide = kaynakEkleriFillGuide(source, reportType);
  const patientBlock = formatPatientProfileForPrompt(profile, reportType);
  const profileRulesKan = patientProfileRulesKan();
  const profileRulesGen = patientProfileRulesGeneral();

  if (reportType === "kan") {
    return `Sen tıbbi iletişim asistanısın.
${BASE}
${ctx}
${srcCtx}
${patientBlock}

${profileRulesKan}
${kanAbnormalRules()}
${keGuide}

ŞEMA (tam anahtarlar):
{
  "raporTuru": "kan",
  "urgency": "green"|"yellow"|"red",
  "neDiyor": { "satirlar": [{"deger":"","aciklama":"","durum":"yuksek"|"dusuk"}], "ozet": "" },
  "neAnlamaGeliyor": "",
  "degerlerNeDemek": [{"baslik":"","yon":"yuksek"|"dusuk","tekCumle":""}],
  "doktoraSorun": ["","",""],
  "yakinModu": "",
${KAYNAK_EKLERI_KEYS}
}

neDiyor.satirlar: Sadece referans dışı / anormal. Normal satır ekleme. deger: kısaltma + parantezli Türkçe.
YÜKSEK ve DÜŞÜK anormalliklerin TAMAMINI dahil et (yukarı ok ve aşağı ok).
neDiyor.ozet: Tek cümle sayı ile (örn. "5 değeriniz referans aralığı dışında.").
neAnlamaGeliyor: 2-4 cümle büyük resim; tek tek değer listeleme YOK; gerekirse referans uyarı cümlesini buraya veya sonuna ekle.
degerlerNeDemek: Her anormal için (hem yuksek hem dusuk); tekCumle en fazla 1 cümle (tanım).
doktoraSorun: Profil ve tabloya özgü somut sorular; genel "normal mi" sorma.
urgency: Hem yüksek hem düşük ciddi anormallikleri dikkate al.

${yk}`;
  }

  if (reportType === "epikriz") {
    return `Sen epikriz/taburcu özet asistanısın.
${BASE}
${ctx}
${srcCtx}
${patientBlock}
${profileRulesGen}
${keGuide}

ŞEMA:
{
  "raporTuru": "epikriz",
  "urgency": "green"|"yellow"|"red",
  "ilacTakvimi": [{"ilacAdi":"ör. Furosemid 40mg","neZaman":"sabah-akşam","nasil":"yemekten sonra"}],
  "alarmSinyalleri": ["acil başvuru uyarıları — raporda yoksa tanıya uygun örnekler üret"],
  "kontrolRandevulari": [{"tarihISO":"YYYY-MM-DD mümkünse","tarihGosterim":"okunaklı tarih","bolum":"","saat":""}],
  "dikkatListesi": [{"emoji":"🧂","metin":"Tuz kısıtlaması"}],
  "doktoraSorun": ["tanı/iyileşme","ilaçlar","kontrol — epikrize özel; örn. tanı kalıcı mı?"],
  "yakinModu": "",
${KAYNAK_EKLERI_KEYS}
}

ilacTakvimi: Rapordaki TÜM ilaçlar; isim doz olduğu gibi, ekstra açıklama yok.
alarmSinyalleri: Örn. hızlı kilo alımı → acil.
kontrolRandevulari: tarihISO metinden çıkarılabiliyorsa zorunlu; yoksa boş bırak veya tahmin etme.
dikkatListesi: tuz, sıvı, sigara, aktivite vb.

${yk}`;
  }

  if (reportType === "goruntuleme") {
    return `Sen radyoloji/MR/tomografi özet asistanısın.
${BASE}
${ctx}
${srcCtx}
${patientBlock}
${profileRulesGen}
${goruntulemeSpecificRules()}
${keGuide}

ŞEMA:
{
  "raporTuru": "goruntuleme",
  "urgency": "green"|"yellow"|"red",
  "neBulundu": [{"basitTurkce":"Latince yok","bolge":"","gunlukHayat":""}],
  "onemliMi": {
    "takipGerektiren": {"maddeler":[],"aciklama":"tek satır"},
    "gozetim": {"maddeler":[],"aciklama":"tek satır"},
    "normal": {"maddeler":[],"aciklama":"tek satır"}
  },
  "takipOnerisi": "hangi uzmanlık / ne sıklıkla kontrol — rapora özgü",
  "doktoraSorun": ["bulguya özgü 3 soru; genel soru yok"],
  "yakinModu": "",
${KAYNAK_EKLERI_KEYS}
}

${yk}`;
  }

  return `Sen reçete açıklama asistanısın.
${BASE}
${ctx}
${srcCtx}
${patientBlock}
${profileRulesGen}
${keGuide}

ŞEMA:
{
  "raporTuru": "recete",
  "urgency": "green"|"yellow"|"red",
  "ilaclar": [{
    "ilacAdi":"","doz":"","gunlukKacKez":"","neZaman":"sabah/akşam/yemekle/aç karna",
    "kacGun":"","neIcin":"reçetede yazıyorsa kısa endikasyon",
    "zamanNotu":"zaman net değilse: Hekiminize sorun"
  }],
  "gunlukProgram": { "sabahAc":[], "sabahYemek":[], "oglen":[], "aksamYemek":[], "gece":[] },
  "dikkatUyari": ["sınıf uyarıları, etkileşim riskleri"],
  "eczaneChecklist": ["jenerik","SGK","saklama sıcaklığı vb."],
  "doktoraSorun": ["neden","süre","yan etki — ilaca özel"],
  "yakinModu": "",
${KAYNAK_EKLERI_KEYS}
}

gunlukProgram: Yalnızca ilaç olan dilimleri doldur.
ilaclar: TÜM satırlar. Kronik hastalık varsa etkileşim/uyarıda dikkate al.

${yk}`;
}
