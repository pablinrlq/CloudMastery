import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "CloudMastery — Certificações AWS com método",
    template: "%s | CloudMastery",
  },
  description:
    "Trilhas semanais em português, simulados no formato oficial com análise de tempo por questão, labs práticos e diagnóstico de prontidão para as certificações AWS.",
  keywords: [
    "certificação AWS",
    "AWS Cloud Practitioner",
    "AWS Solutions Architect",
    "CLF-C02",
    "SAA-C03",
    "simulado AWS",
    "estudar AWS em português",
  ],
  openGraph: {
    title: "CloudMastery — Certificações AWS com método",
    description:
      "Trilhas semanais, simulados no formato oficial e diagnóstico de prontidão para as certificações AWS. 100% em português.",
    type: "website",
    locale: "pt_BR",
    siteName: "CloudMastery",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudMastery — Certificações AWS com método",
    description:
      "Trilhas, simulados oficiais e diagnóstico de prontidão para as certificações AWS. 100% em português.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-flash: aplica o tema salvo antes do primeiro paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cm-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
