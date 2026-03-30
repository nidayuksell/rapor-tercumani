# PRD — Rapor Tercümanı

## Ürün Özeti
Rapor Tercümanı, Türkiye'deki hastaların tıbbi raporlarını anlamalarına yardımcı olan yapay zeka destekli bir web uygulamasıdır.

## Problem
Türkiye'de hastalar ellerindeki tıbbi raporları, laboratuvar sonuçlarını ve epikriz belgelerini anlamakta ciddi güçlük çekiyor. Karmaşık tıbbi terimler, referans aralıkları ve Latince ifadeler hastaları bunaltıyor. Doktora soru sormaktan çekinen ya da raporu yanlış yorumlayan hastalar yanlış kararlara yönelebiliyor.

## Hedef Kullanıcı
- Elinde tıbbi rapor olan her yaştaki Türkiye'deki hasta
- Yaşlı bir yakınının raporunu anlamaya çalışan aile üyeleri
- Yurt dışında yapılmış İngilizce raporunu anlamak isteyen bireyler

## Kullanıcı Hikayeleri
- Kullanıcı olarak kan tahlilimi yapıştırıp değerlerimin ne anlama geldiğini anlamak istiyorum
- Kullanıcı olarak MR raporumdaki bulguların ciddiyetini öğrenmek istiyorum
- Kullanıcı olarak anneme gelen epikrizin ilaç takvimine kolay ulaşmak istiyorum
- Kullanıcı olarak doktora hangi soruları sormam gerektiğini bilmek istiyorum

## Özellikler

### Temel Özellikler
1. **Rapor Analizi** — Metin yapıştırma, PDF yükleme veya fotoğraf çekme
2. **Aciliyet Skoru** — Rutin / Yakında Git / Bugün Git
3. **Rapor Türüne Özel Analiz** — Kan tahlili, MR, epikriz, reçete
4. **Kaynak Özelleştirmesi** — e-Nabız, özel hastane, yurt dışı
5. **Hasta Profili** — Yaş, cinsiyet, gebelik, kronik hastalık

### Rapor Türüne Özel Çıktılar
- **Kan Tahlili** → Anormal değerler tablosu, genel yorum, açılır detaylar
- **MR/Tomografi** → Bulgular, önem derecesi, takip önerisi
- **Epikriz** → İlaç takvimi, alarm sinyalleri, kontrol randevuları
- **İlaç Reçetesi** → Günlük program, etkileşim uyarısı, eczane rehberi

### Ek Özellikler
- Aile/bakıcı modu — çok sade dil
- OCR ile görsel okuma
- Giriş doğrulama — tıbbi olmayan içeriği reddeder

## Teknik Gereksinimler
- Web tabanlı, mobil uyumlu
- Kayıt gerektirmez
- Veri saklanmaz
- Türkçe arayüz ve çıktı
- Yanıt süresi 30 saniyenin altında

## Başarı Kriterleri
- Kullanıcı raporu yapıştırıp 30 saniyede sonuç alır
- Aciliyet skoru doğru belirlenir
- Doktora sorulacak sorular spesifik ve yararlı olur
- Mobil ve masaüstünde sorunsuz çalışır
