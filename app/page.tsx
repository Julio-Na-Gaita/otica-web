"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// ADICIONEI updateDoc e doc AQUI
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  PlusIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  PaperClipIcon,
  TrashIcon // <--- ADICIONEI O ÍCONE DA LIXEIRA
} from "@heroicons/react/24/solid";

// Interface atualizada com o campo lixeira (opcional)
interface PedidoOtica {
  id: string;
  lixeira?: boolean; // <--- NOVO CAMPO
  cliente: {
    nome: string;
    caminhoFotoPerfil?: string | null;
  };
  produto: {
    tipoLente: string;
  };
  prescricao: {
    caminhoFoto?: string | null;
  };
  financeiro: {
    valorTotal: number;
    valorEntrada: number;
    statusPagamento: string;
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoOtica[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos"); // Todos, Pendentes, Pagos

  // 1. Buscar Pedidos em Tempo Real
  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("dataCriacao", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PedidoOtica));

      // FILTRO DE SEGURANÇA: Só mostra o que NÃO está na lixeira
      const listaAtiva = lista.filter(item => !item.lixeira);

      setPedidos(listaAtiva);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. FUNÇÃO PARA MOVER PARA LIXEIRA
  const handleMoverLixeira = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Impede que o clique abra os detalhes do pedido
    
    const confirmar = window.confirm("Mover este pedido para a Lixeira?");
    if (confirmar) {
        try {
            // Atualiza o documento adicionando lixeira: true
            await updateDoc(doc(db, "pedidos", id), {
                lixeira: true
            });
            // Não precisa atualizar o estado manual, o onSnapshot faz isso sozinho
        } catch (error) {
            alert("Erro ao mover para lixeira.");
            console.error(error);
        }
    }
  };

  // 3. Lógica de Filtragem (Mantida igual)
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const nomeMatch = pedido.cliente.nome.toLowerCase().includes(busca.toLowerCase());
    
    const isPago = pedido.financeiro.valorEntrada >= pedido.financeiro.valorTotal;
    let statusMatch = true;
    if (statusFiltro === "Pendentes") statusMatch = !isPago;
    if (statusFiltro === "Pagos") statusMatch = isPago;

    return nomeMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-surface-background">
      
      {/* --- TOPO AZUL --- */}
      <div className="bg-navy-primary p-4 pb-6 shadow-md rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
  <h1 className="text-xl font-bold text-white">Clientes & Pedidos</h1>
  
  {/* BOTÃO PARA ACESSAR A LIXEIRA */}
  <button 
    onClick={() => router.push("/lixeira")}
    className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition flex items-center gap-1"
  >
    <TrashIcon className="w-5 h-5" />
    <span className="text-xs font-bold">Lixeira</span>
  </button>
</div>

        {/* Barra de Busca */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-text-secondary" />
          </div>
          <input
            type="text"
            className="block w-full p-3 pl-10 text-sm rounded-xl bg-blue-light text-navy-primary placeholder-text-secondary focus:ring-2 focus:ring-blue-action focus:outline-none"
            placeholder="Buscar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button 
              onClick={() => setBusca("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-navy-primary"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Chips de Filtro */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["Todos", "Pendentes", "Pagos"].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setStatusFiltro(filtro)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap border ${
                statusFiltro === filtro
                  ? "bg-blue-action text-navy-primary border-blue-action"
                  : "bg-navy-primary text-white border-white/30"
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>

      {/* --- LISTA DE PEDIDOS --- */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center text-text-secondary mt-10">Carregando pedidos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center text-text-secondary mt-10">
            Nenhum pedido encontrado.
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => {
            const isPago = pedido.financeiro.valorEntrada >= pedido.financeiro.valorTotal;
            
            return (
              <div 
                key={pedido.id}
                onClick={() => router.push(`/pedidos/${pedido.id}`)}
                className="bg-surface-card rounded-2xl p-4 shadow-sm flex items-center gap-4 cursor-pointer active:scale-95 transition-transform relative group"
              >
                
                {/* --- BOTÃO LIXEIRA (NOVO) --- */}
                <button 
                    onClick={(e) => handleMoverLixeira(e, pedido.id)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-2 z-10 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>

                {/* Foto de Perfil */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-navy-primary/10 flex items-center justify-center overflow-hidden">
                    {pedido.cliente.caminhoFotoPerfil && !pedido.cliente.caminhoFotoPerfil.startsWith("/data/") ? (
                      <img src={pedido.cliente.caminhoFotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-navy-primary" />
                    )}
                  </div>
                </div>

                {/* Dados do Cliente */}
                <div className="flex-1 min-w-0 pr-6"> {/* pr-6 para não bater na lixeira */}
                  <h3 className="text-text-primary font-bold text-base truncate">
                    {pedido.cliente.nome || "Cliente sem nome"}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-secondary truncate max-w-[120px]">
                      {pedido.produto.tipoLente}
                    </span>
                    
                    {pedido.prescricao.caminhoFoto && (
                      <div className="bg-blue-light px-1.5 py-0.5 rounded flex items-center gap-1">
                        <PaperClipIcon className="w-3 h-3 text-blue-action" />
                        <span className="text-[10px] font-bold text-blue-action">FOTO</span>
                      </div>
                    )}
                  </div>

                  {/* Badge de Status */}
                  <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isPago ? "bg-green-100 text-status-success" : "bg-orange-100 text-status-warning"
                  }`}>
                    {isPago ? "PAGO" : "PENDENTE"}
                  </div>
                </div>

                {/* Valor Total */}
                <div className="text-right flex flex-col justify-end self-end">
                   <div className="text-navy-primary font-bold text-sm">
                      R$ {pedido.financeiro.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- FAB (Botão Flutuante) --- */}
      <button
        onClick={() => router.push("/pedidos/novo")}
        className="fixed bottom-20 right-4 bg-blue-action text-navy-primary p-4 rounded-2xl shadow-lg hover:bg-teal-accent transition shadow-navy-primary/20 z-40"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

    </div>
  );
}