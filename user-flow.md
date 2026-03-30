# Kullanıcı Akışı — Rapor Tercümanı

## Adım 1: Siteye Giriş
Kullanıcı https://rapor-tercumani.vercel.app adresine girer.
Hero section'da uygulamanın ne yaptığını görür.
"Raporu Analiz Et" butonuna tıklar, analiz bölümüne kayar.

## Adım 2: Rapor Kaynağı Seçimi
Kullanıcı raporunun kaynağını seçer:
- e-Nabız / SGK
- Özel Hastane
- Yurt Dışı / İngilizce

## Adım 3: Rapor Türü Seçimi
Kullanıcı rapor türünü seçer:
- 🩸 Kan Tahlili
- 🧠 MR / Tomografi
- 💊 İlaç Reçetesi
- 📋 Epikriz / Taburcu

## Adım 4: Hasta Profili
Kullanıcı kişisel bilgilerini seçer:
- Yaş aralığı (0-17 / 18-35 / 36-55 / 55+)
- Cinsiyet (Kadın / Erkek)
- Gebelik durumu (yalnızca kadınlar için)
- Açlık durumu (yalnızca kan tahlili için)
- Kronik hastalık (opsiyonel, metin girişi)

## Adım 5: Okuyucu Modu Seçimi
- Kendim için okuyorum
- Yakınım adına okuyorum (yaşlı/çocuk)

## Adım 6: Raporu Yükleme
Kullanıcı üç yöntemden biriyle raporu sisteme girer:
- Metni doğrudan metin kutusuna yapıştırır
- PDF dosyası yükler (otomatik metin çıkarımı)
- Fotoğraf çeker veya galeriden görsel yükler (OCR ile metin çıkarımı)

## Adım 7: Analiz
"Analiz Et" butonuna basar.
"Analiz ediliyor..." görünür.
Groq API (llama-3.3-70b-versatile) raporu analiz eder.

## Adım 8: Sonuçları Görüntüleme
Kullanıcı rapor türüne özel sonuçları görür:

**Kan Tahlili:**
- 🚨 Aciliyet Skoru (Rutin / Yakında Git / Bugün Git)
- 📄 Ne Diyor? (anormal değerler tablosu)
- 🔍 Ne Anlama Geliyor? (genel tablo yorumu)
- 🔬 Değerler Ne Demek? (açılır detay listesi)
- ❓ Doktora Sorun (3 spesifik soru)

**Epikriz:**
- 🚨 Aciliyet Skoru
- 💊 İlaç Takvimi
- ⚠️ Alarm Sinyalleri
- 📅 Kontrol Randevuları
- 🚫 Dikkat Edilmesi Gerekenler

**MR / Tomografi:**
- 🚨 Aciliyet Skoru
- 🔍 Ne Bulundu?
- 📊 Önemli mi?
- 🔄 Takip Gerekiyor mu?

**İlaç Reçetesi:**
- 💊 İlaçlarınız
- 🕐 Günlük İlaç Programı
- ⚡ Dikkat Edilmesi Gerekenler
- 🛒 Eczanede Ne Soracaksınız?
