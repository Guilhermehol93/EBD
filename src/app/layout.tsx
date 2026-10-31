import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EBD Revista Manager | PIB Cataguases",
  description: "Portal de Revistas e Lições da Escola Bíblica Dominical da Primeira Igreja Batista de Cataguases",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readencoded<"children", React.ReactNode>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-church-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

type Readencoded<K extends string, V> = {
  [P in K]: V;
};
