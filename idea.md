# Rapor Tercümanı — Fikir Belgesi

## Problem
Türkiye'de hastalar ellerindeki tıbbi raporları, laboratuvar sonuçlarını ve epikriz belgelerini anlamakta ciddi güçlük çekiyor. Karmaşık tıbbi terimler, referans aralıkları ve Latince ifadeler hastaları bunaltıyor. Doktora soru sormaktan çekinen ya da raporu yanlış yorumlayan hastalar yanlış kararlara yönelebiliyor.

## Kullanıcı
- Elinde tıbbi rapor olan ve bunu anlamak isteyen her yaştaki Türkiye'deki hasta
- Yaşlı bir yakınının raporunu anlamaya çalışan aile üyeleri ve bakıcılar
- Yurt dışında yapılmış İngilizce raporunu Türkçe anlamak isteyen bireyler

## AI'ın Rolü
Yapay zeka kullanıcının yüklediği tıbbi raporu okuyarak:
- Raporun ne söylediğini sade Türkçeyle özetliyor
- Anormal değerlerin ne anlama geldiğini açıklıyor
- Durumun aciliyetini (rutin / yakında git / bugün git) belirliyor
- Doktora sorulması gereken 3 spesifik soru öneriyor
- Bakıcı modunda çok sade dille yakın için özet üretiyor
- Rapor türüne (kan tahlili, MR, epikriz, reçete) ve kaynağına (e-Nabız, özel hastane, yurt dışı) göre özelleştirilmiş analiz yapıyor

## Rakip Durum
Global'de benzer araçlar mevcut (Patiently AI, August, Vulgaroo) ancak hiçbiri Türkçe değil ve Türk sağlık sistemine (e-Nabız, SGK, MHRS, epikriz) özel değil. Türkiye'de Play Store'da birkaç uygulama bulunuyor ancak bunlar indirme gerektiriyor, reklamlı ve abonelik bazlı. Rapor Tercümanı web tabanlı, ücretsiz, kayıt gerektirmeyen ve Türkiye'ye özel tek çözüm.

## Başarı Kriteri
Kullanıcı raporunu yapıştırıp 30 saniye içinde:
- Raporun ne anlama geldiğini anlıyor
- Ne kadar acil olduğunu biliyor
- Doktora ne soracağını öğreniyor
