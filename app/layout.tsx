import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rapor Tercümanı | Tıbbi raporunuzu anlayın",
  description:
    "Tıbbi raporunuzu anlayın — kolayca, hızlıca, güvenle. Yapay zekâ destekli Türkçe açıklama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
