"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { 
  ArrowLeftIcon, 
  PencilSquareIcon, 
  PrinterIcon,

  UserIcon,
  MapPinIcon,
  EyeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  PhoneIcon
} from "@heroicons/react/24/solid";

// Interface Completa do Pedido
interface PedidoDetalhes {
  id: string;
  dataCriacao: number;
  cliente: {
    nome: string;
    telefone: string;
    rua: string;
    numero: string;
    bairro: string;
    cidadeEstado: string;
    cep: string;
    dataEntrega: string;
    caminhoFotoPerfil?: string;
  };
  prescricao: {
    olhoDireito: { esferico: string; cilindrico: string; eixo: string; dnp: string };
    olhoEsquerdo: { esferico: string; cilindrico: string; eixo: string; dnp: string };
    observacoesMedicas: string;
    diagnostico: string[];
    caminhoFoto?: string;
  };
  produto: {
    tipoLente: string;
    materialTratamento: string;
    modeloArmacao: string;
  };
  financeiro: {
    valorTotal: number;
    valorEntrada: number;
    formaPagamento: string;
    statusPagamento: string;
  };
}

export default function DetalhesPedidoScreen() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [pedido, setPedido] = useState<PedidoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "pedidos", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPedido({ id: docSnap.id, ...docSnap.data() } as PedidoDetalhes);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando detalhes...</div>;
  if (!pedido) return <div className="p-10 text-center text-red-500">Pedido não encontrado.</div>;

  const handleImprimir = () => {
    window.print();
  };

  const saldoDevedor = pedido.financeiro.valorTotal - pedido.financeiro.valorEntrada;
  const dataFormatada = new Date(pedido.dataCriacao).toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-surface-background pb-24">
      
      {/* --- CABEÇALHO (Visível apenas na TELA) --- */}
      <div className="bg-navy-primary p-4 shadow-md sticky top-0 z-20 no-print">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}><ArrowLeftIcon className="w-6 h-6" /></button>
            <h1 className="text-lg font-bold">Detalhes do Pedido</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push(`/pedidos/${id}/editar`)} 
              className="bg-white/10 p-2 rounded-lg hover:bg-white/20"
              title="Editar"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleImprimir} 
              className="bg-blue-action text-navy-primary p-2 rounded-lg font-bold hover:bg-teal-accent"
              title="Imprimir PDF"
            >
              <PrinterIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================================= */}
      {/* ÁREA DE IMPRESSÃO (O SEGREDO ESTÁ AQUI)                                           */}
      {/* O id="area-impressao" é controlado pelo globals.css                               */}
      {/* A classe "print:block" mostra na impressão, mas o layout normal esconde se quiser */}
      {/* ================================================================================= */}
      
      <div id="area-impressao" className="max-w-3xl mx-auto p-4 md:p-8">
        
        {/* 1. LOGO E CABEÇALHO (Aparece na impressão, escondido na tela se tiver 'hidden' na classe, mas aqui controlamos pelo CSS print) */}
        {/* Adicionei 'hidden print:flex' para garantir que suma da tela do celular */}
        <div className="hidden print:flex flex-col items-center justify-center mb-6 border-b-2 border-black pb-4 header-logo-print">
            {/* Caminho da logo conforme sua pasta public */}
            <img src="/logo.png" alt="Logo Ótica" className="h-24 object-contain mb-2" />
            <h2 className="text-xl font-bold uppercase">Ordem de Serviço / Recibo</h2>
            <p className="text-sm">Pedido #{pedido.id.slice(0, 8).toUpperCase()} - Data: {dataFormatada}</p>
        </div>

        {/* 2. CONTEÚDO VISUAL (Cards bonitos na tela, Texto limpo na impressão) */}
        
        <div className="space-y-6">

          {/* DADOS DO CLIENTE */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
            <h3 className="flex items-center gap-2 font-bold text-navy-primary border-b pb-2 mb-3 print:text-black">
              <UserIcon className="w-5 h-5 text-blue-action print:hidden" /> DADOS DO CLIENTE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm text-text-primary print:grid-cols-2 print:text-black">
              <p><span className="font-bold text-gray-500 print:text-black">Nome:</span> {pedido.cliente.nome}</p>
              <p><span className="font-bold text-gray-500 print:text-black">Telefone:</span> {pedido.cliente.telefone}</p>
              
              <div className="col-span-2 mt-2">
                <span className="font-bold text-gray-500 print:text-black block mb-1">Endereço de Entrega:</span>
                <p>{pedido.cliente.rua}, {pedido.cliente.numero} - {pedido.cliente.bairro}</p>
                <p>{pedido.cliente.cidadeEstado} - CEP: {pedido.cliente.cep}</p>
              </div>
              
              <p className="col-span-2 mt-2">
                <span className="font-bold text-gray-500 print:text-black">Previsão de Entrega:</span> {new Date(pedido.cliente.dataEntrega).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* PRESCRIÇÃO / RECEITA */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
            <h3 className="flex items-center gap-2 font-bold text-navy-primary border-b pb-2 mb-3 print:text-black">
              <EyeIcon className="w-5 h-5 text-blue-action print:hidden" /> PRESCRIÇÃO
            </h3>
            
            {/* Tabela de Graus */}
            <div className="overflow-x-auto border rounded-lg print:border-black mb-4">
              <table className="w-full text-sm text-center">
                <thead className="bg-gray-100 print:bg-gray-200 text-xs font-bold uppercase text-navy-primary print:text-black">
                  <tr>
                    <th className="p-2 border-r border-gray-300 print:border-black">Olho</th>
                    <th className="p-2 border-r border-gray-300 print:border-black">Esférico</th>
                    <th className="p-2 border-r border-gray-300 print:border-black">Cilíndrico</th>
                    <th className="p-2 border-r border-gray-300 print:border-black">Eixo</th>
                    <th className="p-2">DNP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 print:divide-black">
                  <tr>
                    <td className="p-2 font-bold bg-gray-50 print:bg-gray-100 text-right pr-4 border-r print:border-black">OD</td>
                    <td className="p-2 border-r print:border-black">{pedido.prescricao.olhoDireito.esferico || "-"}</td>
                    <td className="p-2 border-r print:border-black">{pedido.prescricao.olhoDireito.cilindrico || "-"}</td>
                    <td className="p-2 border-r print:border-black">{pedido.prescricao.olhoDireito.eixo || "-"}</td>
                    <td className="p-2">{pedido.prescricao.olhoDireito.dnp || "-"}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-gray-50 print:bg-gray-100 text-right pr-4 border-r print:border-black">OE</td>
                    <td className="p-2 border-r print:border-black">{pedido.prescricao.olhoEsquerdo.esferico || "-"}</td>
                    <td className="p-2 border-r print:border-black">{pedido.prescricao.olhoEsquerdo.cilindrico || "-"}</td>
                    <td className="p-2 border-r print:border-black">{pedido.prescricao.olhoEsquerdo.eixo || "-"}</td>
                    <td className="p-2">{pedido.prescricao.olhoEsquerdo.dnp || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {pedido.prescricao.diagnostico.length > 0 && (
               <p className="text-sm mb-2"><span className="font-bold text-gray-500 print:text-black">Diagnóstico:</span> {pedido.prescricao.diagnostico.join(", ")}</p>
            )}
            
            {pedido.prescricao.observacoesMedicas && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-sm print:bg-white print:border-black print:border-dashed">
                <span className="font-bold block text-xs uppercase text-gray-500 mb-1 print:text-black">Observações:</span>
                {pedido.prescricao.observacoesMedicas}
              </div>
            )}
          </div>

          {/* DADOS DO PRODUTO */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
             <h3 className="flex items-center gap-2 font-bold text-navy-primary border-b pb-2 mb-3 print:text-black">
              <ShoppingBagIcon className="w-5 h-5 text-blue-action print:hidden" /> PRODUTO ESCOLHIDO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm print:grid-cols-3 print:gap-2">
               <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase print:text-black">Armação</span>
                  <p className="font-bold text-lg text-navy-primary print:text-black">{pedido.produto.modeloArmacao || "Não informada"}</p>
               </div>
               <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase print:text-black">Lentes</span>
                  <p className="font-medium">{pedido.produto.tipoLente}</p>
               </div>
               <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase print:text-black">Tratamento</span>
                  <p className="font-medium">{pedido.produto.materialTratamento}</p>
               </div>
            </div>
          </div>

          {/* FINANCEIRO - COM CLASSE 'nao-quebrar' PARA NÃO CORTAR */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 print:border-none print:p-0 nao-quebrar">
            <h3 className="flex items-center gap-2 font-bold text-navy-primary border-b pb-1 mb-2 print:text-black text-sm">
              <CurrencyDollarIcon className="w-4 h-4 text-blue-action print:hidden" /> FINANCEIRO
            </h3>
            <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between border-b border-dashed pb-1"><span>Total</span><span className="font-bold">R$ {pedido.financeiro.valorTotal.toFixed(2)}</span></div>
                <div className="flex justify-between border-b border-dashed pb-1 text-green-700 print:text-black"><span>Entrada</span><span className="font-bold">R$ {pedido.financeiro.valorEntrada.toFixed(2)}</span></div>
                <div className="flex justify-between pt-1"><span className="font-bold text-gray-500 print:text-black">SALDO</span><span className={`font-bold text-lg ${saldoDevedor > 0 ? 'text-red-500' : 'text-green-600'} print:text-black`}>R$ {saldoDevedor.toFixed(2)}</span></div>
                <div className="text-xs text-right mt-1">Pgto: {pedido.financeiro.formaPagamento}</div>
                <div className="h-10 print:h-16 w-full"></div>
            </div>
          </div>

        </div>
{/* ESPAÇADOR FORÇADO PARA O PDF NÃO COLAR NO RODAPÉ */}
        <div className="w-full h-24 print:block hidden"></div>
        {/* RODAPÉ / ASSINATURA */}
        <div className="hidden print:flex footer-stamp flex-col items-center justify-end pb-4">
            {/* SE TIVER ASSINATURA DIGITAL, MOSTRA ELA. SE NÃO, MOSTRA LINHA */}
            {pedido.caminhoAssinatura ? (
               <img src={pedido.caminhoAssinatura} className="h-16 mb-2 object-contain" alt="Assinatura" />
            ) : (
               <div className="w-2/3 border-t border-black mb-4"></div>
            )}
            <p className="text-[10px] font-bold uppercase mb-8">Assinatura do Cliente</p>
            {/* Certifique-se que a imagem do carimbo existe em /public/footer_stamp.png */}
            <img src="/footer_stamp.png" alt="Carimbo" className="h-16 object-contain" />
        </div>

      </div>
    </div>
  );
}