"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  ClipboardDocumentListIcon, // Para "Pedidos" (Ícone equivalente ao List)
  BookOpenIcon,              // Para "Catálogo" (Ícone equivalente ao AutoStories)
  CurrencyDollarIcon         // Para "Financeiro" (Ícone equivalente ao AttachMoney)
} from "@heroicons/react/24/solid";

export default function BottomMenu() {
  const router = useRouter();
  const pathname = usePathname();

  // Função para verificar se o botão está ativo
  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-navy-primary border-t border-navy-dark shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        
        {/* Botão PEDIDOS */}
        <button
          onClick={() => router.push("/")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/") ? "text-blue-action" : "text-white/60"
          }`}
        >
          <ClipboardDocumentListIcon className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">Pedidos</span>
        </button>

        {/* Botão CATÁLOGO */}
        <button
          onClick={() => router.push("/catalogo")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/catalogo") ? "text-blue-action" : "text-white/60"
          }`}
        >
          <BookOpenIcon className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">Catálogo</span>
        </button>

        {/* Botão FINANCEIRO */}
        <button
          onClick={() => router.push("/financeiro")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/financeiro") ? "text-blue-action" : "text-white/60"
          }`}
        >
          <CurrencyDollarIcon className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">Financeiro</span>
        </button>

      </div>
    </div>
  );
}