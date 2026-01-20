"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import SignatureCanvas from "../../components/SignatureCanvas"; // <--- IMPORTE AQUI
import { 
  UserIcon, 
  MapPinIcon, 
  EyeIcon, 
  CurrencyDollarIcon,
  CameraIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  MapIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon, // Ícone do WhatsApp
  DocumentTextIcon,         // Ícone do PDF
  PencilIcon // <--- ADICIONE ESTE NOME NA LISTA
} from "@heroicons/react/24/solid";

export default function NovoPedidoScreen() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  
  // Controle do Modal de Sucesso
  const [showModalSucesso, setShowModalSucesso] = useState(false);
  const [novoIdPedido, setNovoIdPedido] = useState<string | null>(null);

  // --- DADOS DO CLIENTE ---
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  
  // Endereço
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [carregandoCep, setCarregandoCep] = useState(false);
  const [dataEntrega, setDataEntrega] = useState("");

  // --- PRESCRIÇÃO ---
  const [fotoReceita, setFotoReceita] = useState<string | null>(null);
  const [obsMedica, setObsMedica] = useState("");
  const [diagnosticos, setDiagnosticos] = useState<string[]>([]);
  const opcoesDiagnostico = ["Miopia", "Hipermetropia", "Astigmatismo", "Presbiopia"];

  // Graus
  const [odEsf, setOdEsf] = useState(""); const [odCil, setOdCil] = useState(""); const [odEixo, setOdEixo] = useState(""); const [odDnp, setOdDnp] = useState("");
  const [oeEsf, setOeEsf] = useState(""); const [oeCil, setOeCil] = useState(""); const [oeEixo, setOeEixo] = useState(""); const [oeDnp, setOeDnp] = useState("");

  // --- PRODUTO ---
  const opcoesLentes = ["Visão Simples", "Multifocal Padrão", "Multifocal Digital", "Bifocal", "Ocupacional", "Lente de Contato"];
  const opcoesTratamento = ["Incolor", "Antirreflexo Básico", "Antirreflexo Premium", "Filtro Azul", "Fotossensível", "Solar Polarizado"];
  const [tipoLente, setTipoLente] = useState(opcoesLentes[0]);
  const [tratamento, setTratamento] = useState(opcoesTratamento[0]);
  const [armacao, setArmacao] = useState("");
  
  // --- FINANCEIRO ---
  const [valorTotal, setValorTotal] = useState("");
  const [valorEntrada, setValorEntrada] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  // ADICIONE ESTA LINHA ABAIXO:
  const [assinatura, setAssinatura] = useState<string | null>(null);

  // --- FUNÇÕES ---

  const buscarCep = async (cepInput: string) => {
    const cepLimpo = cepInput.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      setCarregandoCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setRua(data.logradouro);
          setBairro(data.bairro);
          setCidade(`${data.localidade}/${data.uf}`);
        }
      } catch (error) {
        console.error("Erro no CEP", error);
      } finally {
        setCarregandoCep(false);
      }
    }
  };

  const abrirNoMapa = () => {
    const enderecoCompleto = `${rua}, ${numero}, ${bairro}, ${cidade}`;
    if (!rua || !cidade) return alert("Preencha o endereço primeiro.");
    // Link universal corrigido
    window.open(`http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}`, '_blank');
  };

  const toggleDiagnostico = (diag: string) => {
    if (diagnosticos.includes(diag)) setDiagnosticos(diagnosticos.filter(d => d !== diag));
    else setDiagnosticos([...diagnosticos, diag]);
  };

  // Compressor de imagem simples para o cadastro
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setFunction: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFunction(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- AÇÃO: SALVAR PEDIDO ---
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return alert("Preencha o nome do cliente!");
    
    setSalvando(true);
    try {
      const valorTotalNum = parseFloat(valorTotal.replace(",", ".") || "0");
      const valorEntradaNum = parseFloat(valorEntrada.replace(",", ".") || "0");

      // Salva e guarda a referência do documento criado
      const docRef = await addDoc(collection(db, "pedidos"), {
        dataCriacao: Date.now(),
        cliente: {
          nome, telefone, rua, numero, bairro, cidadeEstado: cidade, cep,
          dataEntrega, caminhoFotoPerfil: fotoPerfil
        },
        prescricao: {
          olhoDireito: { esferico: odEsf, cilindrico: odCil, eixo: odEixo, dnp: odDnp },
          olhoEsquerdo: { esferico: oeEsf, cilindrico: oeCil, eixo: oeEixo, dnp: oeDnp },
          observacoesMedicas: obsMedica,
          diagnostico: diagnosticos,
          caminhoFoto: fotoReceita
        },
        produto: {
          tipoLente, materialTratamento: tratamento, modeloArmacao: armacao
        },
        financeiro: {
          valorTotal: valorTotalNum,
          valorEntrada: valorEntradaNum,
          formaPagamento,
          statusPagamento: valorEntradaNum >= valorTotalNum ? "Pago" : "Pendente"
        },
        caminhoAssinatura: assinatura // <--- SALVANDO ASSINATURA
      });

      // SUCESSO: Salva o ID e abre o modal
      setNovoIdPedido(docRef.id);
      setShowModalSucesso(true);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  // --- AÇÕES DO MODAL DE SUCESSO ---

  const enviarWhatsApp = () => {
    const texto = `Olá *${nome}*! 👓\nSeu pedido foi registrado na Ótica.\n\n*Modelo:* ${armacao}\n*Total:* R$ ${valorTotal}\n*Previsão:* ${dataEntrega}\n\nObrigado pela preferência!`;
    const linkZap = `https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
    window.open(linkZap, "_blank");
  };

  const agendarRetorno = () => {
    const hoje = new Date();
    hoje.setFullYear(hoje.getFullYear() + 1);
    
    const inicio = hoje.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const fim = new Date(hoje.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");

    const titulo = `Retorno Ótica - ${nome}`;
    const descricao = `Renovar óculos. Tel: ${telefone}. Armação anterior: ${armacao}`;

    const icsContent = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      `DTSTART:${inicio}`, `DTEND:${fim}`, `SUMMARY:${titulo}`, `DESCRIPTION:${descricao}`,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `retorno_${nome}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-surface-background pb-24">
      
      {/* Top Bar */}
      <div className="bg-navy-primary p-4 shadow-md flex items-center gap-4 sticky top-0 z-20">
        <button onClick={() => router.back()} className="text-white p-1">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">Novo Pedido</h1>
      </div>

      <form onSubmit={handleSalvar} className="p-4 space-y-6 max-w-lg mx-auto">
        
        {/* CLIENTE */}
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
               <label className="text-xs text-text-secondary font-bold">Nome Completo *</label>
               <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2 border rounded-lg bg-surface-background focus:border-blue-action outline-none" />
            </div>
          </div>
          <input placeholder="WhatsApp" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>

        {/* ENDEREÇO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-navy-primary font-bold border-b pb-2">
            <MapPinIcon className="w-5 h-5 text-blue-action" /><h2>Endereço</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
             <div><label className="text-xs">CEP</label><input value={cep} onChange={e => { setCep(e.target.value); buscarCep(e.target.value) }} className={`w-full p-2 border rounded-lg ${carregandoCep ? 'bg-gray-100 animate-pulse' : ''}`} placeholder="00000-000" /></div>
             <div><label className="text-xs">Cidade</label><input value={cidade} readOnly className="w-full p-2 bg-gray-50 border rounded-lg" /></div>
          </div>
          <input placeholder="Rua" value={rua} onChange={e => setRua(e.target.value)} className="w-full p-2 border rounded-lg mb-3" />
          <div className="flex gap-3 mb-3">
             <input placeholder="Nº" value={numero} onChange={e => setNumero(e.target.value)} className="w-1/3 p-2 border rounded-lg" />
             <input placeholder="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} className="w-2/3 p-2 border rounded-lg" />
          </div>
          <button type="button" onClick={abrirNoMapa} className="w-full mb-4 flex items-center justify-center gap-2 bg-teal-accent/10 text-teal-accent py-2 rounded-lg font-bold text-sm hover:bg-teal-accent/20 transition"><MapIcon className="w-4 h-4" /> VER NO MAPA</button>
          <div><label className="text-xs font-bold text-navy-primary">Data de Entrega</label><input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="w-full p-2 border rounded-lg" /></div>
        </div>

        {/* RECEITA */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-4 text-navy-primary font-bold border-b pb-2"><EyeIcon className="w-5 h-5 text-blue-action" /><h2>Prescrição</h2></div>
          <div className="mb-4">
            <label className="text-xs font-bold text-text-secondary mb-2 block">Diagnóstico</label>
            <div className="flex flex-wrap gap-2">
              {opcoesDiagnostico.map(diag => (
                <button key={diag} type="button" onClick={() => toggleDiagnostico(diag)} className={`px-3 py-1 rounded-full text-xs font-bold transition border ${diagnosticos.includes(diag) ? "bg-navy-primary text-white border-navy-primary" : "bg-white text-text-secondary border-gray-300"}`}>{diag}</button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-2 text-text-secondary">Foto da Receita</label>
            <div className="relative h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition">
               {fotoReceita ? <img src={fotoReceita} className="h-full w-full object-contain rounded-lg" /> : <CameraIcon className="w-6 h-6 text-gray-400" />}
               <input type="file" accept="image/*" className="absolute inset-0 opacity-0" onChange={(e) => handleImageUpload(e, setFotoReceita)} />
            </div>
          </div>
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
          <div><label className="text-xs font-bold text-text-secondary">Observações Médicas</label><textarea value={obsMedica} onChange={e => setObsMedica(e.target.value)} className="w-full p-2 border rounded-lg h-20 text-sm" /></div>
        </div>

        {/* PRODUTO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-navy-primary font-bold border-b pb-2"><ShoppingBagIcon className="w-5 h-5 text-blue-action" /><h2>Lentes & Armação</h2></div>
          <div className="space-y-4">
            <div><label className="text-xs font-bold text-text-secondary">Tipo de Lente</label><select value={tipoLente} onChange={e => setTipoLente(e.target.value)} className="w-full p-3 bg-white border rounded-lg mt-1">{opcoesLentes.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
            <div><label className="text-xs font-bold text-text-secondary">Tratamento</label><select value={tratamento} onChange={e => setTratamento(e.target.value)} className="w-full p-3 bg-white border rounded-lg mt-1">{opcoesTratamento.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
            <div><label className="text-xs font-bold text-text-secondary">Modelo da Armação</label><input value={armacao} onChange={e => setArmacao(e.target.value)} className="w-full p-3 border rounded-lg mt-1" /></div>
          </div>
        </div>

        {/* FINANCEIRO & ASSINATURA */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-4 text-navy-primary font-bold border-b pb-2"><CurrencyDollarIcon className="w-5 h-5 text-blue-action" /><h2>Pagamento & Assinatura</h2></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
             <div><label className="text-xs font-bold text-navy-primary">Total (R$)</label><input type="number" step="0.01" value={valorTotal} onChange={e => setValorTotal(e.target.value)} className="w-full p-2 border rounded-lg font-bold" /></div>
             <div><label className="text-xs font-bold text-green-700">Entrada (R$)</label><input type="number" step="0.01" value={valorEntrada} onChange={e => setValorEntrada(e.target.value)} className="w-full p-2 border rounded-lg font-bold" /></div>
          </div>
          <div className="mb-6">
             <label className="text-xs font-bold text-text-secondary mb-1 block">Forma de Pagamento</label>
             <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg">{["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto"].map(f => <option key={f}>{f}</option>)}</select>
          </div>
          
          {/* CAMPO DE ASSINATURA NOVO */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-navy-primary font-bold">
               <PencilIcon className="w-4 h-4 text-blue-action" /> <h3>Assinatura do Cliente</h3>
            </div>
            <SignatureCanvas onSave={setAssinatura} />
          </div>
        </div>

        <button type="submit" disabled={salvando} className="w-full bg-navy-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-navy-dark transition flex items-center justify-center gap-2 disabled:opacity-70">
          {salvando ? "Salvando..." : <><CheckCircleIcon className="w-6 h-6 text-blue-action" /> SALVAR PEDIDO</>}
        </button>

      </form>

      {/* --- MODAL DE SUCESSO E AÇÕES --- */}
      {showModalSucesso && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-navy-primary mb-2">Pedido Salvo! 🎉</h2>
                <p className="text-text-secondary mb-6 text-sm">O que deseja fazer agora?</p>

                <div className="space-y-3">
                    {/* Botão WhatsApp */}
                    <button 
                        onClick={enviarWhatsApp}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" /> Enviar WhatsApp
                    </button>

                    {/* Botão Ver PDF (Vai para detalhes) */}
                    <button 
                        onClick={() => router.push(`/pedidos/${novoIdPedido}`)}
                        className="w-full bg-blue-action text-navy-primary font-bold py-3 rounded-xl shadow-md hover:bg-teal-accent transition flex items-center justify-center gap-2"
                    >
                        <DocumentTextIcon className="w-5 h-5" /> Ver PDF / Imprimir
                    </button>

                    {/* Botão Agendar Retorno */}
                    <button 
                        onClick={agendarRetorno}
                        className="w-full bg-white border border-blue-action text-blue-action font-bold py-3 rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
                    >
                        <CalendarDaysIcon className="w-5 h-5" /> Agendar Retorno (1 Ano)
                    </button>
                    
                    <button 
                        onClick={() => router.push("/")}
                        className="text-gray-400 text-sm underline mt-2 block"
                    >
                        Voltar para Home
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}