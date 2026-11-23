import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: ".: Portal - Facta Empréstimos :.",
  description: "Clone do portal interno da Facta Empréstimos (dados fictícios).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f5f7f6] text-[13px] text-[#67757c]">
        {children}
      </body>
    </html>
  );
}
