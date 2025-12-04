import React, { useState } from 'react';
import { Users, Edit, Trash2, KeyRound, Copy } from 'lucide-react';
import { useStore, Team } from '../../context/Store';
import Modal from '../../components/ui/Modal';

const Teams: React.FC = () => {
  const { teams, addTeam, updateTeam, deleteTeam, tournaments } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    tournamentId: '',
    category: '',
    password: ''
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', tournamentId: '', category: '', password: '123' }); // Default password
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Team) => {
    setEditingId(t.id);
    setFormData(t);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTeam({ ...formData, id: editingId } as Team);
    } else {
      addTeam(formData as Team);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar equipo? Se borrará del sistema.')) {
      deleteTeam(id);
    }
  };

  const getTournamentName = (id: string) => tournaments.find(t => t.id === id)?.name || 'Sin torneo';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-display font-bold text-white">Equipos & Accesos</h1>
           <p className="text-slate-400 mt-1">Gestión de credenciales y asignaciones</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-brand-neon text-brand-deep px-6 py-2.5 rounded-xl font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(201,255,47,0.3)]">
          + Nuevo Equipo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
            <div key={team.id} className="bg-brand-surface border border-white/5 rounded-2xl p-6 group hover:border-brand-neon/30 transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-brand-deep border border-white/10 flex items-center justify-center text-brand-neon">
                        <Users size={24} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                         <button onClick={() => handleOpenEdit(team)} className="p-2 bg-brand-deep rounded-lg hover:text-blue-400 text-slate-400"><Edit size={16} /></button>
                         <button onClick={() => handleDelete(team.id)} className="p-2 bg-brand-deep rounded-lg hover:text-red-400 text-slate-400"><Trash2 size={16} /></button>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
                <span className="inline-block bg-white/5 px-2 py-1 rounded text-xs text-slate-400 mb-4">{team.category}</span>
                
                <div className="pt-4 border-t border-white/5 space-y-3">
                    <div>
                        <div className="text-xs text-slate-500 mb-1">Torneo Inscrito</div>
                        <div className="text-sm text-slate-200">{getTournamentName(team.tournamentId)}</div>
                    </div>
                    
                    <div className="bg-brand-deep/50 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                             <KeyRound size={12} className="text-brand-neon" />
                             <span className="text-xs font-bold text-slate-300 uppercase">Credenciales Portal</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-500">ID: <span className="text-white font-mono">{team.id}</span></span>
                             <span className="text-slate-500">Pass: <span className="text-white font-mono">{team.password || '****'}</span></span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
        {teams.length === 0 && <div className="text-slate-500 col-span-3 text-center py-10">No hay equipos registrados.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Equipo" : "Nuevo Equipo"}>
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm text-slate-400 mb-1">Nombre del Equipo</label>
                <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
             <div>
                <label className="block text-sm text-slate-400 mb-1">Categoría</label>
                <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Sub-16" />
            </div>
            <div>
                <label className="block text-sm text-slate-400 mb-1">Torneo</label>
                 <select required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.tournamentId} onChange={e => setFormData({...formData, tournamentId: e.target.value})}>
                    <option value="">Selecciona un torneo</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                 </select>
            </div>
             <div className="pt-4 mt-4 border-t border-white/10">
                <label className="block text-sm text-brand-neon font-bold mb-1">Contraseña de Acceso</label>
                <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none font-mono" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Contraseña para el equipo" />
                 <p className="text-xs text-slate-500 mt-1">El equipo usará su ID y esta contraseña para entrar.</p>
            </div>
             <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                 <button type="submit" className="px-6 py-2 bg-brand-neon text-brand-deep font-bold rounded-lg hover:bg-white">Guardar</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;