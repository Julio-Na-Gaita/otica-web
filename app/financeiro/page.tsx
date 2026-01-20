"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  TruckIcon, 
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CloudArrowDownIcon // Ícone do Backup
} from "@heroicons/react/24/solid";

interface PedidoFinanceiro {
  id: string;
  dataCriacao: number;
  cliente: {
    nome: string;
    dataEntrega: string; 
  };
  financeiro: {
    valorTotal: number;
    valorEntrada: number;
    statusPagamento: string;
  };
}

export default function FinanceiroScreen() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);

  const [vendasMes, setVendasMes] = useState(0);
  const [aReceber, setAReceber] = useState(0);
  const [entregasHoje, setEntregasHoje] = useState(0);
  const [qtdPendentes, setQtdPendentes] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("dataCriacao", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PedidoFinanceiro)); // Adicione 'lixeira?: boolean' na interface se o TS reclamar

      // --- CORREÇÃO AQUI: FILTRAR LIXEIRA ---
      // Só considera pedidos que NÃO têm lixeira = true
      const listaAtiva = lista.filter((item: any) => !item.lixeira);

      setPedidos(listaAtiva);
      calcularIndicadores(listaAtiva); // Calcula apenas com os ativos
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const calcularIndicadores = (lista: PedidoFinanceiro[]) => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    const hojeYMD = agora.toISOString().split('T')[0];
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const hojeDMY = `${dia}/${mes}/${anoAtual}`;

    let totalVendas = 0;
    let totalReceber = 0;
    let countEntregas = 0;
    let countPendentes = 0;

    lista.forEach(p => {
      const dataPedido = new Date(p.dataCriacao);
      if (dataPedido.getMonth() === mesAtual && dataPedido.getFullYear() === anoAtual) {
        totalVendas += p.financeiro.valorTotal;
      }
      const saldoDevedor = p.financeiro.valorTotal - p.financeiro.valorEntrada;
      if (saldoDevedor > 0) {
        totalReceber += saldoDevedor;
        countPendentes++;
      }
      if (p.cliente.dataEntrega === hojeYMD || p.cliente.dataEntrega === hojeDMY) {
        countEntregas++;
      }
    });

    setVendasMes(totalVendas);
    setAReceber(totalReceber);
    setEntregasHoje(countEntregas);
    setQtdPendentes(countPendentes);
  };

  // --- FUNÇÃO DE BACKUP ---
  const fazerBackup = async () => {
    if(!confirm("Baixar cópia de segurança de todos os pedidos?")) return;
    
    // Converte a lista atual de pedidos em texto JSON
    const dados = JSON.stringify(pedidos, null, 2);
    
    // Cria um "arquivo virtual"
    const blob = new Blob([dados], { type: "application/json" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `backup_otica_${new Date().toISOString().split('T')[0]}.json`;
    
    // Clica no link para baixar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-surface-background pb-24">
      
      {/* HEADER */}
      <div className="bg-gradient-to-b from-navy-primary to-navy-dark p-6 pb-20 rounded-b-[40px] shadow-lg relative z-10">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
          <ChartBarIcon className="w-8 h-8 text-blue-action" />
          Financeiro
        </h1>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-blue-action" />
                    <span className="text-xs text-blue-100 font-bold uppercase">Vendas (Mês)</span>
                </div>
                <p className="text-lg font-bold text-white truncate">
                    R$ {vendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="w-5 h-5 text-status-warning" />
                    <span className="text-xs text-orange-200 font-bold uppercase">A Receber</span>
                </div>
                <p className="text-lg font-bold text-white truncate">
                    R$ {aReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            </div>
        </div>
      </div>

      {/* CARDS FLUTUANTES */}
      <div className="px-6 -mt-12 grid grid-cols-2 gap-4 mb-10 relative z-20">
         <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-blue-action flex flex-col justify-between h-28">
            <div className="flex items-center gap-2 text-navy-primary font-bold text-xs uppercase">
                <TruckIcon className="w-5 h-5 text-blue-action" />
                Entregas Hoje
            </div>
            <div>
               <p className="text-3xl font-bold text-navy-primary">{entregasHoje}</p>
               <p className="text-[10px] text-text-secondary">pedidos</p>
            </div>
         </div>

         <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-status-warning flex flex-col justify-between h-28">
            <div className="flex items-center gap-2 text-navy-primary font-bold text-xs uppercase">
                <CurrencyDollarIcon className="w-5 h-5 text-status-warning" />
                Pendentes
            </div>
            <div>
               <p className="text-3xl font-bold text-navy-primary">{qtdPendentes}</p>
               <p className="text-[10px] text-text-secondary">em aberto</p>
            </div>
         </div>
      </div>

      {/* LISTA DE MOVIMENTAÇÕES */}
      <div className="px-6 mt-4">
        <h2 className="text-navy-primary font-bold text-lg mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5" />
            Movimentações Recentes
        </h2>

        {loading ? (
            <p className="text-center text-text-secondary">Carregando...</p>
        ) : (
            <div className="space-y-3">
                {pedidos.slice(0, 10).map(pedido => {
                    const saldo = pedido.financeiro.valorTotal - pedido.financeiro.valorEntrada;
                    const isPago = saldo <= 0.01;

                    return (
                        <div 
                            key={pedido.id}
                            onClick={() => router.push(`/pedidos/${pedido.id}`)}
                            className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center cursor-pointer active:scale-95 transition border border-gray-100"
                        >
                            <div>
                                <p className="font-bold text-navy-primary text-sm">{pedido.cliente.nome}</p>
                                <p className="text-xs text-text-secondary mt-1">
                                    Total: R$ {pedido.financeiro.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="text-right">
                                {isPago ? (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                                        PAGO
                                    </span>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                                            PENDENTE
                                        </span>
                                        <span className="text-xs text-red-500 font-bold whitespace-nowrap">
                                            resta R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* BOTÃO DE BACKUP */}
      <div className="mt-10 px-6 text-center">
        <button 
            onClick={fazerBackup}
            className="text-xs text-gray-400 underline hover:text-navy-primary flex items-center justify-center gap-1 mx-auto mb-6"
        >
            <CloudArrowDownIcon className="w-4 h-4" />
            Baixar Backup dos Dados
        </button>
      </div>

    </div>
  );
}