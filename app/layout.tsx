import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomMenu from "./components/BottomMenu"; // <--- Importe aqui

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ótica Móvel",
  description: "Sistema Administrativo",
  manifest: "/manifest.json", // <--- ADICIONE ISSO
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ótica",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-surface-background pb-20`}> 
        {/* pb-20 dá espaço para o menu não cobrir o conteúdo */}
        
        {children}
        
        <BottomMenu /> {/* <--- O Menu fixo entra aqui */}
      </body>
    </html>
  );
}