import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olympion Lab",
  description: "Olimpiyat öğrencileri için video, rota, PDF, AI koç ve premium öğrenme platformu.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://olympionlab.com")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
