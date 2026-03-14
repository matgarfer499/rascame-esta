import type { Metadata, Viewport } from "next";
import { Bebas_Neue, JetBrains_Mono, Black_Ops_One } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const blackOpsOne = Black_Ops_One({
  weight: "400",
  variable: "--font-black-ops-one",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RÁSCAME ESTA",
  description: "Operación en curso. Acceso restringido.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${bebasNeue.variable} ${jetbrainsMono.variable} ${blackOpsOne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
