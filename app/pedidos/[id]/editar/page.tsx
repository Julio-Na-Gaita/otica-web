"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { 
  UserIcon, MapPinIcon, EyeIcon, CurrencyDollarIcon, 
  CameraIcon, CheckCircleIcon, ArrowLeftIcon, ShoppingBagIcon
} from "@heroicons/react/24/solid";

export default function EditarPedidoScreen() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [salvando, setSalvando] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados (Iniciam vazios e preenchem ao carregar)
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");

  const [fotoReceita, setFotoReceita] = useState<string | null>(null);
  const [obsMedica, setObsMedica] = useState("");
  const [diagnosticos, setDiagnosticos] = useState<string[]>([]);

  // Graus
  const [odEsf, setOdEsf] = useState(""); const [odCil, setOdCil] = useState(""); const [odEixo, setOdEixo] = useState(""); const [odDnp, setOdDnp] = useState("");
  const [oeEsf, setOeEsf] = useState(""); const [oeCil, setOeCil] = useState(""); const [oeEixo, setOeEixo] = useState(""); const [oeDnp, setOeDnp] = useState("");

  const [tipoLente, setTipoLente] = useState("");
  const [tratamento, setTratamento] = useState("");
  const [armacao, setArmacao] = useState("");
  
  const [valorTotal, setValorTotal] = useState("");
  const [valorEntrada, setValorEntrada] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");

  // OPÇÕES (Com "Nenhum" adicionado)
  const opcoesDiagnostico = ["Miopia", "Hipermetropia", "Astigmatismo", "Presbiopia"];
  const opcoesLentes = ["Nenhum", "Visão Simples", "Multifocal Padrão", "Multifocal Digital", "Bifocal", "Ocupacional", "Lente de Contato"];
  const opcoesTratamento = ["Nenhum", "Incolor", "Antirreflexo Básico", "Antirreflexo Premium", "Filtro Azul", "Fotossensível", "Solar Polarizado"];

  // CARREGAR DADOS DO PEDIDO
  useEffect(() => {
    async function loadData() {
      const docRef = doc(db, "pedidos", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Cliente
        setNome(data.cliente.nome);
        setTelefone(data.cliente.telefone);
        setFotoPerfil(data.cliente.caminhoFotoPerfil);
        setCep(data.cliente.cep);
        setRua(data.cliente.rua);
        setNumero(data.cliente.numero);
        setBairro(data.cliente.bairro);
        setCidade(data.cliente.cidadeEstado);
        setDataEntrega(data.cliente.dataEntrega);

        // Prescrição
        setFotoReceita(data.prescricao.caminhoFoto);
        setObsMedica(data.prescricao.observacoesMedicas);
        setDiagnosticos(data.prescricao.diagnostico || []);
        
        setOdEsf(data.prescricao.olhoDireito.esferico); setOdCil(data.prescricao.olhoDireito.cilindrico);
        setOdEixo(data.prescricao.olhoDireito.eixo); setOdDnp(data.prescricao.olhoDireito.dnp);
        
        setOeEsf(data.prescricao.olhoEsquerdo.esferico); setOeCil(data.prescricao.olhoEsquerdo.cilindrico);
        setOeEixo(data.prescricao.olhoEsquerdo.eixo); setOeDnp(data.prescricao.olhoEsquerdo.dnp);

        // Produto
        setTipoLente(data.produto.tipoLente || "Nenhum");
        setTratamento(data.produto.materialTratamento || "Nenhum");
        setArmacao(data.produto.modeloArmacao);

        // Financeiro
        setValorTotal(data.financeiro.valorTotal.toString());
        setValorEntrada(data.financeiro.valorEntrada.toString());
        setFormaPagamento(data.financeiro.formaPagamento);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const toggleDiagnostico = (diag: string) => {
    if (diagnosticos.includes(diag)) setDiagnosticos(diagnosticos.filter(d => d !== diag));
    else setDiagnosticos([...diagnosticos, diag]);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const valorTotalNum = parseFloat(valorTotal.replace(",", ".") || "0");
      const valorEntradaNum = parseFloat(valorEntrada.replace(",", ".") || "0");

      await updateDoc(doc(db, "pedidos", id), {
        "cliente.nome": nome, "cliente.telefone": telefone, "cliente.rua": rua, 
        "cliente.numero": numero, "cliente.bairro": bairro, "cliente.cidadeEstado": cidade, 
        "cliente.cep": cep, "cliente.dataEntrega": dataEntrega, "cliente.caminhoFotoPerfil": fotoPerfil,
        
        "prescricao.olhoDireito": { esferico: odEsf, cilindrico: odCil, eixo: odEixo, dnp: odDnp },
        "prescricao.olhoEsquerdo": { esferico: oeEsf, cilindrico: oeCil, eixo: oeEixo, dnp: oeDnp },
        "prescricao.observacoesMedicas": obsMedica,
        "prescricao.diagnostico": diagnosticos,
        "prescricao.caminhoFoto": fotoReceita,

        "produto.tipoLente": tipoLente,
        "produto.materialTratamento": tratamento,
        "produto.modeloArmacao": armacao,

        "financeiro.valorTotal": valorTotalNum,
        "financeiro.valorEntrada": valorEntradaNum,
        "financeiro.formaPagamento": formaPagamento,
        "financeiro.statusPagamento": valorEntradaNum >= valorTotalNum ? "Pago" : "Pendente"
      });

      alert("Pedido Atualizado!");
      router.push(`/pedidos/${id}`); // Volta para detalhes
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setFunction: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFunction(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando dados...</div>;

  return (
    <div className="min-h-screen bg-surface-background pb-24">
      <div className="bg-navy-primary p-4 shadow-md flex items-center gap-4 sticky top-0 z-20">
        <button onClick={() => router.back()} className="text-white p-1"><ArrowLeftIcon className="w-6 h-6" /></button>
        <h1 className="text-lg font-bold text-white">Editar Pedido</h1>
      </div>

      <form onSubmit={handleSalvar} className="p-4 space-y-6 max-w-lg mx-auto">
        
        {/* CARD CLIENTE */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-navy-primary font-bold border-b pb-2">
            <UserIcon className="w-5 h-5 text-blue-action" /><h2>Dados do Cliente</h2>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full bg-gray-100 overflow-hidden border-2 border-dashed border-blue-action flex items-center justify-center cursor-pointer">
              {fotoPerfil ? <img src={fotoPerfil} className="w-full h-full object-cover" /> : <CameraIcon className="w-6 h-6 text-gray-400" />}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, setFotoPerfil)} />
            </div>
            <div className="flex-1">
               <label className="text-xs font-bold text-text-secondary mb-1 block">Nome Completo</label>
               <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <label className="text-xs font-bold text-text-secondary mb-1 block">Telefone / WhatsApp</label>
          <input placeholder="WhatsApp" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>

        {/* CARD ENDEREÇO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-navy-primary font-bold border-b pb-2"><MapPinIcon className="w-5 h-5 text-blue-action" /><h2>Endereço</h2></div>
          
          <label className="text-xs font-bold text-text-secondary mb-1 block">Rua / Logradouro</label>
          <input value={rua} onChange={e => setRua(e.target.value)} className="w-full p-2 border rounded-lg mb-3" />
          
          <div className="flex gap-3 mb-3">
             <div className="w-1/3">
                <label className="text-xs font-bold text-text-secondary mb-1 block">Número</label>
                <input value={numero} onChange={e => setNumero(e.target.value)} className="w-full p-2 border rounded-lg" />
             </div>
             <div className="w-2/3">
                <label className="text-xs font-bold text-text-secondary mb-1 block">Bairro</label>
                <input value={bairro} onChange={e => setBairro(e.target.value)} className="w-full p-2 border rounded-lg" />
             </div>
          </div>
          
          <div className="flex gap-3 mb-3">
             <div className="w-2/3">
                <label className="text-xs font-bold text-text-secondary mb-1 block">Cidade</label>
                <input value={cidade} onChange={e => setCidade(e.target.value)} className="w-full p-2 border rounded-lg" />
             </div>
             <div className="w-1/3">
                 <label className="text-xs font-bold text-text-secondary mb-1 block">CEP</label>
                 <input value={cep} onChange={e => setCep(e.target.value)} className="w-full p-2 border rounded-lg" />
             </div>
          </div>

          <label className="text-xs font-bold text-navy-primary mb-1 block">Data de Entrega</label>
          <input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>

        {/* CARD RECEITA (AGORA COMPLETO!) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-4 text-navy-primary font-bold border-b pb-2">
            <EyeIcon className="w-5 h-5 text-blue-action" />
            <h2>Prescrição</h2>
          </div>

          <label className="text-xs font-bold text-text-secondary mb-2 block">Diagnóstico</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {opcoesDiagnostico.map(diag => (
              <button
                key={diag}
                type="button"
                onClick={() => toggleDiagnostico(diag)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                  diagnosticos.includes(diag) 
                    ? "bg-navy-primary text-white border-navy-primary" 
                    : "bg-white text-text-secondary border-gray-300"
                }`}
              >
                {diag}
              </button>
            ))}
          </div>

          {/* GRAUS */}
          <div className="space-y-4 mb-4">
             <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <span className="text-xs font-bold text-red-600 mb-2 block">OLHO DIREITO (OD)</span>
                <div className="grid grid-cols-4 gap-2">
                   <input placeholder="Esf" value={odEsf} onChange={e => setOdEsf(e.target.value)} className="p-1 text-center border rounded bg-white text-sm" />
                   <input placeholder="Cil" value={odCil} onChange={e => setOdCil(e.target.value)} className="p-1 text-center border rounded bg-white text-sm" />
                   <input placeholder="Eixo" value={odEixo} onChange={e => setOdEixo(e.target.value)} className="p-1 text-center border rounded bg-white text-sm" />
                   <input placeholder="DNP" value={odDnp} onChange={e => setOdDnp(e.target.value)} className="p-1 text-center border rounded bg-white text-sm" />
                </div>
             </div>
             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <span className="text-xs font-bold text-blue-600 mb-2 block">OLHO ESQUERDO (OE)</span>
                <div className="grid grid-cols-4 gap-2">
                   <input placeholder="Esf" value={oeEsf} onChange={e => setOeEsf(e.target.value)} className="p-1 text-center border rounded bg-white text-sm" />
                   <input placeholder="Cil" value={oeCil} onChange={e => setOeCil(e.target.value)} className="p-1 text-center border rounded bg-white text-sm" />
                   <input placeholder="Eixo" value={oeEixo} onChange={e => setOeEixo(e.target.value)} className="p-1 text-center border rounded bg-white text-sm" />
                   <input placeholder="DNP" value={oeDnp} onChange={e => setOeDnp(e.target.value)} className="p-1 text-center border rounded bg-white text-sm" />
                </div>
             </div>
          </div>

          <label className="text-xs font-bold text-text-secondary mb-1 block">Observações Médicas</label>
          <textarea 
             value={obsMedica} 
             onChange={e => setObsMedica(e.target.value)}
             className="w-full p-2 border rounded-lg h-20 text-sm"
          />
        </div>

        {/* CARD PRODUTO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-navy-primary font-bold border-b pb-2"><ShoppingBagIcon className="w-5 h-5 text-blue-action" /><h2>Produto</h2></div>
          
          <label className="text-xs font-bold text-text-secondary mb-1 block">Tipo de Lente</label>
          <select value={tipoLente} onChange={e => setTipoLente(e.target.value)} className="w-full p-3 bg-white border rounded-lg mb-3">
            {opcoesLentes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          
          <label className="text-xs font-bold text-text-secondary mb-1 block">Tratamento</label>
          <select value={tratamento} onChange={e => setTratamento(e.target.value)} className="w-full p-3 bg-white border rounded-lg mb-3">
            {opcoesTratamento.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          
          <label className="text-xs font-bold text-text-secondary mb-1 block">Modelo da Armação</label>
          <input value={armacao} onChange={e => setArmacao(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Ex: Aviador" />
        </div>

        {/* CARD FINANCEIRO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-4 text-navy-primary font-bold border-b pb-2"><CurrencyDollarIcon className="w-5 h-5 text-blue-action" /><h2>Financeiro</h2></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
                <label className="text-xs font-bold text-navy-primary mb-1 block">Total (R$)</label>
                <input type="number" step="0.01" value={valorTotal} onChange={e => setValorTotal(e.target.value)} className="w-full p-2 border rounded-lg font-bold" />
             </div>
             <div>
                <label className="text-xs font-bold text-green-700 mb-1 block">Entrada (R$)</label>
                <input type="number" step="0.01" value={valorEntrada} onChange={e => setValorEntrada(e.target.value)} className="w-full p-2 border rounded-lg font-bold" />
             </div>
          </div>
          <label className="text-xs font-bold text-text-secondary mb-1 block">Forma de Pagamento</label>
          <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg">
             {["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto"].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>

        <button type="submit" disabled={salvando} className="w-full bg-navy-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-navy-dark transition flex items-center justify-center gap-2 disabled:opacity-70">
          {salvando ? "Salvando..." : <><CheckCircleIcon className="w-6 h-6 text-blue-action" /> SALVAR ALTERAÇÕES</>}
        </button>
      </form>
    </div>
  );
}