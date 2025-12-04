import React, { useEffect, useState } from "react";
import { MapPin, Calendar, Bus, Hotel, Trash2, Edit } from "lucide-react";
import {
  getTournaments,
  createTournament,
  updateTournamentDB,
  deleteTournamentDB,
} from "../../supabase/tournamentsservice";
import Modal from "../../components/ui/Modal";


// Tipo frontend
interface Tournament {
  id: string;
  name: string;
  dates: string;
  city: string;
  status: string;
  hotelId?: string;
  transportId?: string;
}

const Tournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [hotels] = useState<any[]>([]);
  const [transport] = useState<any[]>([]);
  const [teams] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Tournament>>({
    name: "",
    dates: "",
    city: "",
    status: "Planificado",
    hotelId: "",
    transportId: "",
  });

  // 🔥 CARGAR TORNEOS AL MONTAR
  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    const data = await getTournaments();
    console.log("DATA SUPABASE:", data);

    setTournaments(data); // ya viene mapeado del servicio

  };

  // 🔥 ABRIR MODAL CREAR
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      dates: "",
      city: "",
      status: "Planificado",
      hotelId: "",
      transportId: "",
    });
    setIsModalOpen(true);
  };

  // 🔥 ABRIR MODAL EDITAR
  const handleOpenEdit = (t: Tournament) => {
    setEditingId(t.id);
    setFormData(t);
    setIsModalOpen(true);
  };

  // 🔥 CREAR O EDITAR TORNEO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
  await updateTournamentDB({
    id: editingId,
    name: formData.name!,
    dates: formData.dates!,
    city: formData.city!,
    status: formData.status!,
    hotelId: formData.hotelId || "",
    transportId: formData.transportId || "",
  });
} else {
  await createTournament({
    name: formData.name!,
    dates: formData.dates!,
    city: formData.city!,
    status: formData.status!,
    hotelId: formData.hotelId || "",
    transportId: formData.transportId || "",
  });
}
    setIsModalOpen(false);
    loadTournaments();
  };

  // 🔥 BORRAR TORNEO
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar torneo?")) return;
    await deleteTournamentDB(id);
    loadTournaments();
  };

  const getHotelName = (id?: string) =>
    hotels.find((h) => h.id === id)?.name || "Sin asignar";

  const getTransportName = (id?: string) =>
    transport.find((t) => t.id === id)?.company || "Sin asignar";

  const getTeamCount = (id: string) =>
    teams.filter((t) => t.tournamentId === id).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Torneos</h1>
          <p className="text-slate-400 mt-1">
            Gestión centralizada de competiciones
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-brand-neon text-brand-deep px-6 py-2.5 rounded-xl font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(201,255,47,0.3)]"
        >
          + Nuevo Torneo
        </button>
      </div>

      <div className="bg-brand-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-deep/50 border-b border-white/5 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-6">Torneo</th>
                <th className="p-6">Fecha & Lugar</th>
                <th className="p-6">Logística</th>
                <th className="p-6">Equipos</th>
                <th className="p-6">Estado</th>
                <th className="p-6 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {tournaments.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-bold text-white text-lg">{t.name}</div>
                    <div className="text-xs text-brand-neon mt-1">
                      ID: #{t.id.slice(0, 6)}
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-slate-300 text-sm">
                        <Calendar size={14} className="text-brand-neon" />
                        {t.dates}
                      </span>
                      <span className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin size={14} />
                        {t.city}
                      </span>
                    </div>
                  </td>

                  <td className="p-6">
                    <span className="flex items-center gap-2 text-slate-300 text-sm">
                      <Hotel size={14} className={!t.hotelId ? "text-red-400" : "text-blue-400"} />
                      {t.hotelId ? getHotelName(t.hotelId) : <i className="text-red-400">Pendiente</i>}
                    </span>

                    <span className="flex items-center gap-2 text-slate-400 text-sm">
                      <Bus size={14} className={!t.transportId ? "text-red-400" : "text-purple-400"} />
                      {t.transportId ? getTransportName(t.transportId) : <i className="text-red-400">Pendiente</i>}
                    </span>
                  </td>

                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">{getTeamCount(t.id)}</span>
                      <span className="text-xs text-slate-500">Inscritos</span>
                    </div>
                  </td>

                  <td className="p-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border border-white/10 ${
                        t.status === "En curso"
                          ? "bg-green-500/20 text-green-400"
                          : t.status === "Urgente"
                          ? "bg-red-500/20 text-red-400"
                          : t.status === "Planificado"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-2 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {tournaments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No hay torneos creados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Torneo" : "Nuevo Torneo"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre del Torneo</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={formData.dates}
                onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Ciudad</label>
              <input
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Estado</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
            >
              <option value="Planificado">Planificado</option>
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">
              Cancelar
            </button>

            <button type="submit" className="px-6 py-2 bg-brand-neon text-brand-deep font-bold rounded-lg hover:bg-white">
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tournaments;
