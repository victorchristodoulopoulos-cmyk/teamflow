import React from "react";
import { FileText, Download, UploadCloud, CheckCircle, Clock, AlertCircle } from "lucide-react";

// Simulamos datos (o los que vengan de tu API)
const mockDocs = [
  { id: "1", name: "Autorización de Viaje", status: "pendiente", updated: "—", type: "legal" },
  { id: "2", name: "Ficha Médica Oficial", status: "pendiente", updated: "—", type: "medical" },
  { id: "3", name: "DNI / Pasaporte Escaneado", status: "subido", updated: "2026-02-01", type: "id" },
];

export default function FamilyDocuments() {
  return (
    <div className="space-y-6">
      
      {/* HEADER DE SECCIÓN */}
      <div className="p-6 rounded-2xl bg-[#162032]/60 border border-white/5 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-display font-bold text-white">Centro de Documentación</h2>
           <p className="text-sm text-slate-400 mt-1">Sube y gestiona los archivos requeridos para el torneo.</p>
        </div>
        <button className="bg-[#C9FF2F] text-[#0D1B2A] px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-[0_0_15px_rgba(201,255,47,0.3)] transition-all flex items-center gap-2">
           <UploadCloud size={18} /> Subir Nuevo
        </button>
      </div>

      {/* GRID DE DOCUMENTOS */}
      <div className="grid gap-4 lg:grid-cols-2">
        {mockDocs.map((d) => {
          const isDone = d.status === "subido";
          
          return (
            <div key={d.id} className="group relative overflow-hidden rounded-2xl bg-[#162032]/40 border border-white/5 p-6 hover:bg-[#162032]/80 transition-all hover:border-white/10">
              {/* Indicador lateral de color */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${isDone ? "bg-[#C9FF2F]" : "bg-orange-500"}`} />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDone ? "bg-[#C9FF2F]/10 text-[#C9FF2F]" : "bg-orange-500/10 text-orange-500"}`}>
                      <FileText size={20} />
                   </div>
                   <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{d.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">
                        {isDone ? `Actualizado: ${d.updated}` : "Acción Requerida"}
                      </p>
                   </div>
                </div>
                
                {/* Badge de Estado */}
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    isDone 
                    ? "bg-[#C9FF2F]/10 text-[#C9FF2F] border-[#C9FF2F]/20" 
                    : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                }`}>
                    {isDone ? <span className="flex items-center gap-1"><CheckCircle size={10} /> LISTO</span> : <span className="flex items-center gap-1"><Clock size={10} /> PENDIENTE</span>}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 mt-4 pl-14">
                <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors border border-white/5">
                   VER ARCHIVO
                </button>
                <button className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${
                    isDone 
                    ? "border-white/5 text-slate-400 hover:text-white" 
                    : "bg-orange-500 text-black border-orange-500 hover:brightness-110"
                }`}>
                   {isDone ? "REEMPLAZAR" : "SUBIR AHORA"}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}