"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  PlusIcon, 
  TrashIcon, 
  CameraIcon,
  XMarkIcon,
  ShoppingBagIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/solid";

interface ProdutoCatalogo {
  id: string;
  modelo: string;
  marca: string;
  preco: number;
  fotos?: string[];
  caminhoFoto?: string;
}

export default function CatalogoScreen() {
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Modais
  const [showModalCadastro, setShowModalCadastro] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoCatalogo | null>(null); // Para ver detalhes
  
  // Estados de Cadastro
  const [salvando, setSalvando] = useState(false);
  const [comprimindo, setComprimindo] = useState(false);
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [preco, setPreco] = useState("");
  const [fotosSelecionadas, setFotosSelecionadas] = useState<string[]>([]);

  // Estado da Galeria (Qual foto está vendo agora)
  const [indiceFotoAtual, setIndiceFotoAtual] = useState(0);

  // 1. Carregar Produtos
  useEffect(() => {
    const q = query(collection(db, "produtos_catalogo"), orderBy("modelo"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProdutoCatalogo));
      setProdutos(lista);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- FUNÇÕES DE CADASTRO ---

  const comprimirImagem = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          const finalWidth = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
          const finalHeight = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;
          canvas.width = finalWidth;
          canvas.height = finalHeight;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, finalWidth, finalHeight);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprimindo(true);
      try {
        const fotoComprimida = await comprimirImagem(file);
        setFotosSelecionadas(prev => [...prev, fotoComprimida]);
      } catch (error) {
        alert("Erro ao processar imagem.");
      } finally {
        setComprimindo(false);
      }
    }
    e.target.value = "";
  };

  const removerFotoDaLista = (index: number) => {
    setFotosSelecionadas(prev => prev.filter((_, i) => i !== index));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelo || fotosSelecionadas.length === 0) return alert("Adicione foto e modelo.");
    setSalvando(true);
    try {
      await addDoc(collection(db, "produtos_catalogo"), {
        modelo, marca, preco: parseFloat(preco.replace(",", ".") || "0"), fotos: fotosSelecionadas,
      });
      setModelo(""); setMarca(""); setPreco(""); setFotosSelecionadas([]); setShowModalCadastro(false);
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Impede de abrir o modal ao clicar na lixeira
    if (confirm("Remover do catálogo?")) {
      await deleteDoc(doc(db, "produtos_catalogo", id));
      if (produtoSelecionado?.id === id) setProdutoSelecionado(null); // Fecha modal se estiver aberto
    }
  };

  // --- FUNÇÕES DA GALERIA ---
  const abrirProduto = (prod: ProdutoCatalogo) => {
    setProdutoSelecionado(prod);
    setIndiceFotoAtual(0); // Começa sempre na primeira foto
  };

  const proximaFoto = () => {
    if (!produtoSelecionado) return;
    const total = produtoSelecionado.fotos?.length || 1;
    setIndiceFotoAtual((prev) => (prev + 1) % total);
  };

  const fotoAnterior = () => {
    if (!produtoSelecionado) return;
    const total = produtoSelecionado.fotos?.length || 1;
    setIndiceFotoAtual((prev) => (prev - 1 + total) % total);
  };

  return (
    <div className="min-h-screen bg-surface-background pb-24">
      {/* Top Bar */}
      <div className="bg-navy-primary p-4 shadow-md sticky top-0 z-20">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingBagIcon className="w-6 h-6 text-blue-action" />
          Vitrine Digital
        </h1>
      </div>

      {/* Grid de Produtos */}
      <div className="p-4">
        {loading ? (
          <div className="text-center mt-10 text-text-secondary">Carregando...</div>
        ) : produtos.length === 0 ? (
          <div className="text-center mt-20 opacity-60">
            <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-400 mb-2" />
            <p className="text-text-secondary">Catálogo vazio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {produtos.map((prod) => {
              const imagemCapa = prod.fotos && prod.fotos.length > 0 ? prod.fotos[0] : prod.caminhoFoto;
              const qtdFotos = prod.fotos?.length || (prod.caminhoFoto ? 1 : 0);

              return (
                <div 
                  key={prod.id} 
                  onClick={() => abrirProduto(prod)} // <--- AQUI ESTÁ O CLIQUE PARA ABRIR!
                  className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col relative group cursor-pointer active:scale-95 transition-transform"
                >
                  <button 
                    onClick={(e) => handleExcluir(e, prod.id)}
                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm z-10 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  {qtdFotos > 1 && (
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-bold flex items-center gap-1 z-10">
                      <PhotoIcon className="w-3 h-3" />
                      +{qtdFotos - 1}
                    </div>
                  )}

                  <div className="h-36 bg-gray-100 relative">
                    {imagemCapa ? <img src={imagemCapa} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400"><PhotoIcon className="w-8 h-8" /></div>}
                  </div>

                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-bold text-navy-primary text-sm truncate">{prod.modelo}</h3>
                    <p className="text-xs text-text-secondary truncate mb-2">{prod.marca}</p>
                    <div className="mt-auto">
                      <span className="text-blue-action font-bold text-sm">R$ {prod.preco.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowModalCadastro(true)} className="fixed bottom-24 right-4 bg-blue-action text-navy-primary p-4 rounded-2xl shadow-lg z-30">
        <PlusIcon className="w-7 h-7" />
      </button>

      {/* --- MODAL DETALHES / GALERIA (NOVO!) --- */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center animate-fade-in">
            {/* Botão Fechar */}
            <button 
              onClick={() => setProdutoSelecionado(null)} 
              className="absolute top-4 right-4 text-white p-2 z-50 bg-white/10 rounded-full"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            {/* Área da Imagem Principal */}
            <div className="flex-1 flex items-center justify-center relative w-full">
                {/* Imagem Atual */}
                <img 
                  src={produtoSelecionado.fotos ? produtoSelecionado.fotos[indiceFotoAtual] : produtoSelecionado.caminhoFoto} 
                  className="max-h-[60vh] max-w-full object-contain"
                />
                
                {/* Setas de Navegação (Só se tiver +1 foto) */}
                {(produtoSelecionado.fotos?.length || 0) > 1 && (
                    <>
                        <button onClick={fotoAnterior} className="absolute left-2 text-white p-2 bg-black/20 rounded-full"><ChevronLeftIcon className="w-8 h-8"/></button>
                        <button onClick={proximaFoto} className="absolute right-2 text-white p-2 bg-black/20 rounded-full"><ChevronRightIcon className="w-8 h-8"/></button>
                    </>
                )}
            </div>

            {/* Carrossel de Miniaturas */}
            {(produtoSelecionado.fotos?.length || 0) > 1 && (
                <div className="h-20 flex gap-2 justify-center items-center px-4 overflow-x-auto">
                    {produtoSelecionado.fotos?.map((foto, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setIndiceFotoAtual(idx)}
                          className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 ${idx === indiceFotoAtual ? 'border-blue-action opacity-100' : 'border-transparent opacity-50'}`}
                        >
                            <img src={foto} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Informações do Produto (Fundo Branco em baixo) */}
            <div className="bg-white p-6 rounded-t-3xl mt-4 animate-slide-up">
                <h2 className="text-2xl font-bold text-navy-primary">{produtoSelecionado.modelo}</h2>
                <div className="flex justify-between items-end mt-2">
                    <p className="text-lg text-text-secondary">{produtoSelecionado.marca}</p>
                    <p className="text-3xl font-bold text-blue-action">R$ {produtoSelecionado.preco.toFixed(2).replace(".", ",")}</p>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL CADASTRO (Mantido igual) --- */}
      {showModalCadastro && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-navy-primary">Nova Armação</h2>
              <button onClick={() => setShowModalCadastro(false)} className="text-gray-400"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary mb-2 block">Fotos ({fotosSelecionadas.length})</label>
                {fotosSelecionadas.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                    {fotosSelecionadas.map((foto, index) => (
                      <div key={index} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                        <img src={foto} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removerFotoDaLista(index)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"><XMarkIcon className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`relative h-16 bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition ${comprimindo ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2 text-blue-action font-bold text-sm">
                      <CameraIcon className="w-5 h-5" />
                      <span>{comprimindo ? "Comprimindo..." : "Adicionar fotos"}</span>
                    </div>
                    <input type="file" accept="image/*" disabled={comprimindo} className="absolute inset-0 opacity-0" onChange={handleImageUpload} />
                </div>
              </div>
              <input required value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Modelo" className="w-full p-3 border rounded-lg" />
              <div className="flex gap-3">
                <input value={marca} onChange={e => setMarca(e.target.value)} placeholder="Marca" className="w-full p-3 border rounded-lg" />
                <input type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} placeholder="Preço" className="w-full p-3 border rounded-lg" />
              </div>
              <button type="submit" disabled={salvando || comprimindo} className="w-full bg-navy-primary text-white font-bold py-4 rounded-xl shadow-lg mt-4 disabled:opacity-70">
                {salvando ? "Salvando..." : "SALVAR NA VITRINE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}