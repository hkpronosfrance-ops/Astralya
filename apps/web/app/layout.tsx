import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astralya",
  description: "2D isometric tactical RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
