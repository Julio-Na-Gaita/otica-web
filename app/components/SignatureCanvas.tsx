// app/components/SignatureCanvas.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";

interface SignatureCanvasProps {
  onSave: (base64: string | null) => void;
}

export default function SignatureCanvas({ onSave }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Configura o canvas para o tamanho do container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 150;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
      }
    }
  }, []);

  const getCoords = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Suporte a Touch (iPhone) e Mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault(); // Impede rolagem da tela no iPhone ao assinar
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.lineTo(x, y);
    ctx?.stroke();
    setHasSignature(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    save();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      onSave(null);
    }
  };

  const save = () => {
    if (canvasRef.current && hasSignature) {
      // Gera imagem transparente
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSave(dataUrl);
    }
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-400 rounded-lg bg-gray-50 touch-none relative" style={{ height: "150px" }}>
        {!hasSignature && <span className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none select-none">Assine aqui</span>}
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <button 
        type="button" 
        onClick={clear} 
        className="text-xs text-red-500 flex items-center gap-1 mt-2 hover:underline"
      >
        <TrashIcon className="w-3 h-3" /> Limpar Assinatura
      </button>
    </div>
  );
}