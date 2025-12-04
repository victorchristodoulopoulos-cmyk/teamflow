import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* Fondo oscuro: clic aquí cierra */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Contenido del modal — 🔥 DETENER PROPAGACIÓN */}
      <div
        className="relative bg-brand-deep border border-white/10 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all scale-100 opacity-100 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} // ← ESTA ES LA CLAVE
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h3 className="text-xl font-display font-bold text-white">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>

    </div>
  );
};

export default Modal;
