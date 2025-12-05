import React, { useEffect, useState } from "react";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import {
  getTeams,
  createTeam,
  updateTeamDB,
  deleteTeamDB,
  type Team,
} from "../../supabase/teamsService.tsx";

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{ name: string }>({
    name: "",
  });

  // 🔥 Cargar equipos al montar
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      console.error("Error cargando equipos:", err);
      alert("Error cargando equipos");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
  };

  // 🔥 Abrir modal para editar
  const handleOpenEdit = (team: Team) => {
    setEditingId(team.id);
    setFormData({ name: team.name });
    setIsModalOpen(true);
  };

  // 🔥 Guardar (crear o editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingId) {
        await updateTeamDB({
          id: editingId,
          name: formData.name,
          created_at: null,
        });
      } else {
        await createTeam({ name: formData.name });
      }

      setIsModalOpen(false);
      await loadTeams();
    } catch (err) {
      console.error("Error guardando equipo:", err);
      alert("Error guardando equipo");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Borrar equipo
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este equipo?")) return;

    try {
      setLoading(true);
      await deleteTeamDB(id);
      await loadTeams();
    } catch (err) {
      console.error("Error eliminando equipo:", err);
      alert("Error eliminando equipo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Users size={26} className="text-brand-neon" />
            Equipos
          </h1>
          <p className="text-slate-400 mt-1">
            Gestión de equipos participantes en tus torneos
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-brand-neon text-brand-deep px-6 py-2.5 rounded-xl font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(201,255,47,0.3)] flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo equipo
        </button>
      </div>

      {/* Lista de equipos */}
      <div className="space-y-4">
        {loading && teams.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
            Cargando equipos...
          </div>
        )}

        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-brand-surface p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:border-brand-neon/40 transition-all"
          >
            <div>
              <div className="text-lg font-bold text-white">{team.name}</div>
              <div className="text-xs text-slate-500 mt-1">
                ID: <span className="font-mono">{team.id.slice(0, 8)}…</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleOpenEdit(team)}
                className="p-2 rounded-lg bg-brand-deep text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(team.id)}
                className="p-2 rounded-lg bg-brand-deep text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {!loading && teams.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
            Todavía no hay equipos. Crea el primero.
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar equipo" : "Nuevo equipo"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Nombre del equipo
            </label>
            <input
              required
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-brand-neon text-brand-deep font-bold rounded-lg hover:bg-white disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
