import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DemoProvider } from "~/infrastructure/state/demo-store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Golf Natural Guidance",
    template: "%s · Golf Natural Guidance",
  },
  description:
    "Demo de una plataforma digital de reservas, agenda, clientes, cobros y facturación desarrollada para Golf Natural Guidance.",
  keywords: [
    "producto digital",
    "software para academias",
    "reservas online",
    "caso de estudio",
    "experiencia de usuario",
  ],
  openGraph: {
    title: "Golf Natural Guidance",
    description:
      "Una plataforma digital para simplificar reservas y gestión de academias de golf.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
