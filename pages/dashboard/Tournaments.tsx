import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Plus, AlertTriangle } from "lucide-react";
import { useStore } from "../../context/Store";

const Tournaments: React.FC = () => {
  const navigate = useNavigate();

  // ⚠️ Defensivo: si el store por lo que sea devuelve undefined, evitamos crash
  const store = useStore() as any;

  const tournamentsRaw = store?.tournaments;
  const loadingFromStore = store?.loading; // si existe en tu store
  const refresh = store?.refresh; // si existe en tu store

  const tournaments = useMemo(() => {
    return Array.isArray(tournamentsRaw) ? tournamentsRaw : [];
  }, [tournamentsRaw]);

  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    // Si tu Store tiene refresh() o loadData() úsalo aquí para asegurar carga
    const run = async () => {
      if (typeof refresh === "function") {
        try {
          setLocalLoading(true);
          await refresh();
        } catch (e) {
          console.error("Error refresh tournaments:", e);
        } finally {
          setLocalLoading(false);
        }
      }
    };
    run();
  }, [refresh]);

  const loading = Boolean(loadingFromStore) || localLoading;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black italic text-white uppercase">
            Torneos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión interna de torneos (admin)
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/tournaments")}
          className="hidden"
        />

        <button
          onClick={() => alert("TODO: abrir modal crear torneo")}
          className="px-4 py-2 rounded-xl bg-brand-neon text-brand-deep font-black uppercase text-xs tracking-wider hover:brightness-110 transition flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo torneo
        </button>
      </div>

      {/* DEBUG CARD si el store no trae lo esperado */}
      {!Array.isArray(tournamentsRaw) && (
        <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 mt-0.5" size={18} />
          <div className="text-sm">
            <div className="text-red-300 font-bold">
              Store inconsistente: tournaments no es un array
            </div>
            <div className="text-red-200/70 text-xs mt-1">
              Revisa `useStore()` / `StoreProvider` y asegúrate de inicializar
              `tournaments: []` por defecto.
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="text-slate-400">Cargando torneos…</div>
      ) : tournaments.length === 0 ? (
        <div className="bg-brand-surface border border-white/10 rounded-2xl p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-deep/60 border border-white/10 flex items-center justify-center mb-4">
            <Trophy className="text-slate-400" size={22} />
          </div>
          <div className="text-white font-bold text-lg">No hay torneos</div>
          <div className="text-slate-500 text-sm mt-1">
            Crea tu primer torneo para empezar.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tournaments.map((t: any) => (
            <div
              key={t.id ?? t.uuid ?? t.nombre}
              className="bg-brand-surface border border-white/10 rounded-2xl p-6 hover:border-brand-neon/30 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-white font-black italic uppercase">
                    {t.nombre ?? t.name ?? "Torneo"}
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    {t.ciudad ?? t.city ?? "—"} · {t.fecha ?? t.dates ?? "—"}
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded border border-white/10 text-slate-300">
                  {t.estado ?? t.status ?? "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tournaments;
