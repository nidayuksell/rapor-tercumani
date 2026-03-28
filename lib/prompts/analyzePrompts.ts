import type { ReaderMode, ReportSource, ReportType } from "@/lib/types";

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

export function buildAnalyzeSystemPrompt(
  reportType: ReportType,
  source: ReportSource,
  reader: ReaderMode,
): string {
  const sourceLabel = SOURCE_LABELS[source];
  const typeLabel = TYPE_LABELS[reportType];
  const ctx = `BAĞLAM: Kaynak ${sourceLabel}, rapor türü ${typeLabel}.`;
  const yk = yakinBlock(reader);
  const srcCtx = sourceSystemContext(source);
  const keGuide = kaynakEkleriFillGuide(source, reportType);

  if (reportType === "kan") {
    return `Sen tıbbi iletişim asistanısın.
${BASE}
${ctx}
${srcCtx}
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
neDiyor.ozet: Tek cümle sayı ile (örn. "5 değeriniz referans aralığı dışında.").
neAnlamaGeliyor: 2-3 cümle büyük resim; tek tek değer listeleme YOK.
degerlerNeDemek: Her anormal için; tekCumle en fazla 1 cümle (tanım).
doktoraSorun: Tablo/pattern odaklı; "MCH düşük ne demek" gibi tek parametre sorma.
urgency: Hafif sapma → green.

${yk}`;
  }

  if (reportType === "epikriz") {
    return `Sen epikriz/taburcu özet asistanısın.
${BASE}
${ctx}
${srcCtx}
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
  "takipOnerisi": "görüntüleme tekrarı önerisi veya raporda yoksa standart uyarı cümlesi",
  "doktoraSorun": ["bulguya özgü 3 soru; örn. sıvı birikimi için tedavi gerekir mi"],
  "yakinModu": "",
${KAYNAK_EKLERI_KEYS}
}

${yk}`;
  }

  return `Sen reçete açıklama asistanısın.
${BASE}
${ctx}
${srcCtx}
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
ilaclar: TÜM satırlar.

${yk}`;
}
