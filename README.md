# Rapor Tercümanı 🔬

Tıbbi raporunuzu anlayın — kolayca, hızlıca, güvenle.

## Problem
Türkiye'de hastalar ellerindeki tıbbi raporları, laboratuvar sonuçlarını ve epikriz belgelerini anlamakta ciddi güçlük çekiyor. Karmaşık tıbbi terimler ve Latince ifadeler hastaları bunaltıyor. Doktora soru sormaktan çekinen ya da raporu yanlış yorumlayan hastalar yanlış kararlara yönelebiliyor.

## Çözüm
Rapor Tercümanı, yapay zeka destekli bir tıbbi rapor açıklama aracıdır. Kullanıcı raporunu yapıştırır, yükler veya fotoğrafını çeker — AI raporu analiz ederek sade Türkçeyle açıklar, aciliyet skorunu belirler ve doktora sorulacak soruları önerir.

## Canlı Demo
- 🌐 Yayın Linki: https://rapor-tercumani.vercel.app
- 🎥 Demo Video: (yakında eklenecek)

## Özellikler
- 🩸 Kan tahlili, MR, epikriz ve ilaç reçetesi analizi
- 🚨 Aciliyet skoru (Rutin / Yakında Git / Bugün Git)
- 👴 Aile/bakıcı modu
- 📱 Fotoğraf çekme ve PDF yükleme
- 🇹🇷 e-Nabız, SGK ve özel hastane raporlarına özel analiz
- 🌍 İngilizce rapor desteği

## Kullanılan Teknolojiler
**Uygulama:**
- Next.js 16, TypeScript, Tailwind CSS
- Groq API (llama-3.3-70b-versatile)
- Vercel

**Geliştirme Sürecinde Kullanılan AI Araçları:**
- Cursor — kod geliştirme
- Claude (Anthropic) — mimari ve prompt tasarımı
- ChatGPT — kodlama ve tasarım desteği
- Gemini — logo ve görsel kimlik
- Perplexity — rakip analizi

## Nasıl Çalıştırılır?
```bash
git clone https://github.com/nidayuksell/rapor-tercumani.git
cd rapor-tercumani
npm install
```

`.env.local` dosyası oluştur:
```
GROQ_API_KEY=your_api_key
```
```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` aç.

## Geliştirici
Nida Yüksel
