import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TournamentClubPayments() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold uppercase text-xs tracking-widest">
        <ArrowLeft size={16} /> Volver al Hub
      </button>
      
      <div className="text-center py-20">
        <h1 className="text-3xl text-white font-bold">Detalle de Pagos: {clubId}</h1>
        <p className="text-slate-400">Aquí irá el desglose detallado, historial de transacciones y botones de acción manual.</p>
        <p className="text-amber-500 mt-4 text-sm">🚧 Construcción pendiente para el siguiente paso.</p>
      </div>
    </div>
  );
}