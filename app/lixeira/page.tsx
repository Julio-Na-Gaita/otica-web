"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  ArrowLeftIcon, 
  ArrowPathIcon, // Ícone de Restaurar
  TrashIcon 
} from "@heroicons/react/24/solid";

interface PedidoLixeira {
  id: string;
  lixeira: boolean;
  cliente: { nome: string };
  financeiro: { valorTotal: number };
  dataCriacao: number;
}

export default function LixeiraScreen() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoLixeira[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("dataCriacao", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PedidoLixeira));
      
      // FILTRO: Só mostra o que ESTÁ na lixeira
      setPedidos(lista.filter(p => p.lixeira === true));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const restaurarPedido = async (id: string) => {
    if (confirm("Restaurar este pedido para a tela inicial?")) {
      await updateDoc(doc(db, "pedidos", id), {
        lixeira: false // Remove da lixeira
      });
    }
  };

  const excluirDefinitivamente = async (id: string) => {
    if (confirm("ATENÇÃO: Isso apagará o pedido para sempre. Confirmar?")) {
      await deleteDoc(doc(db, "pedidos", id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="bg-red-600 p-4 shadow-md sticky top-0 z-20 flex items-center gap-3 text-white">
        <button onClick={() => router.back()}><ArrowLeftIcon className="w-6 h-6" /></button>
        <h1 className="text-lg font-bold">Lixeira</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? <p className="text-center mt-10">Carregando...</p> : 
         pedidos.length === 0 ? <p className="text-center mt-10 text-gray-400">Lixeira vazia.</p> :
         pedidos.map(pedido => (
           <div key={pedido.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
             <div>
               <p className="font-bold text-gray-800">{pedido.cliente.nome}</p>
               <p className="text-xs text-gray-500">R$ {pedido.financeiro.valorTotal.toFixed(2)}</p>
               <p className="text-[10px] text-gray-400">{new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}</p>
             </div>
             <div className="flex gap-2">
               <button 
                 onClick={() => restaurarPedido(pedido.id)}
                 className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-200"
                 title="Restaurar"
               >
                 <ArrowPathIcon className="w-5 h-5" />
               </button>
               <button 
                 onClick={() => excluirDefinitivamente(pedido.id)}
                 className="bg-red-100 p-2 rounded-full text-red-600 hover:bg-red-200"
                 title="Excluir Definitivamente"
               >
                 <TrashIcon className="w-5 h-5" />
               </button>
             </div>
           </div>
         ))
        }
      </div>
    </div>
  );
}