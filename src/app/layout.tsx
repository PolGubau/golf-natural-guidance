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
  description: "Reservas y gestión de Golf Natural Guidance.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
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
