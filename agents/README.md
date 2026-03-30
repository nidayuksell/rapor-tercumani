# Agent Sistemi — Rapor Tercümanı

## Nasıl Çalışır?
Rapor Tercümanı, kural tabanlı bir AI agent mimarisi kullanır. 
Tek bir sabit prompt yerine, kullanıcının seçimlerine göre 
dinamik olarak davranışını değiştiren akıllı bir sistem mevcuttur.

## Agent Karar Akışı

### 1. Girdi Doğrulama Agent'ı
- Gelen metnin tıbbi rapor olup olmadığını kontrol eder
- Tıbbi içerik değilse analizi reddeder
- Hata mesajı döner: "Bu metin tıbbi rapor değil"

### 2. Rapor Sınıflandırma Agent'ı
Kullanıcının seçtiği rapor türüne göre farklı analiz motoru devreye girer:
- 🩸 Kan Tahlili → referans aralığı karşılaştırması + akordion detay
- 🧠 MR/Tomografi → bulgu tespiti + takip önerisi
- 💊 İlaç Reçetesi → günlük program + etkileşim kontrolü
- 📋 Epikriz → ilaç takvimi + alarm sinyalleri + randevu takibi

### 3. Kaynak Özelleştirme Agent'ı
Raporun kaynağına göre sistem promptu değişir:
- e-Nabız/SGK → SGK terimleri, MHRS yönlendirmesi
- Özel Hastane → sigorta notu, SGK alternatifi bilgisi
- Yurt Dışı → birim dönüşümü, Türkiye karşılığı

### 4. Hasta Profili Agent'ı
Yaş, cinsiyet, gebelik ve kronik hastalık bilgisine göre:
- Referans aralıkları kişiselleştirilir
- Yorum tonu ve dil seviyesi ayarlanır
- Bakıcı modu aktifse çok sade dil kullanılır

### 5. OCR Agent'ı (Görsel/PDF)
- PDF yüklenirse → pdf-parse ile metin çıkarımı
- Görsel yüklenirse → Groq Vision (llama-4-scout) ile OCR
- Çıkarılan metin → ana analiz agent'ına iletilir

## Kullanılan Teknoloji
- Groq API (llama-3.3-70b-versatile) — ana analiz
- Groq Vision (llama-4-scout-17b) — OCR
- Next.js API Routes — agent orchestration
