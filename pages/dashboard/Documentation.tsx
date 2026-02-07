import React, { useState } from 'react';
import { Check, X, FileText, Plus, Trash2, Edit } from 'lucide-react';
import { useStore, Player } from '../../context/Store';
import Modal from '../../components/ui/Modal';

const Documentation: React.FC = () => {
  const { players, teams, addPlayer, updatePlayer, deletePlayer } = useStore();
  
  // Filtering
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Player>>({ name: '', surname: '', teamId: '', dni: '', birthDate: '', status: 'Pendiente' });

  const filteredPlayers = selectedTeam === 'all' ? players : players.filter(p => p.teamId === selectedTeam);
  
  // Kanban columns
  const pendingPlayers = filteredPlayers.filter(p => p.status === 'Pendiente');
  const validatedPlayers = filteredPlayers.filter(p => p.status === 'Validado');

  const handleStatusChange = (player: Player, newStatus: 'Pendiente' | 'Validado') => {
    updatePlayer({ ...player, status: newStatus });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', surname: '', teamId: '', dni: '', birthDate: '', status: 'Pendiente' });
    setIsModalOpen(true);
  };
  
  const handleOpenEdit = (p: Player) => {
      setEditingId(p.id);
      setFormData(p);
      setIsModalOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(editingId) updatePlayer({ ...formData, id: editingId } as Player);
      else addPlayer(formData as Player);
      setIsModalOpen(false);
  }

  const handleDelete = (id: string) => {
      if(window.confirm("Eliminar jugador?")) deletePlayer(id);
  }

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown';

  const PlayerCard: React.FC<{ player: Player }> = ({ player }) => (
    <div className="bg-brand-deep p-4 rounded-xl border border-white/5 hover:border-brand-neon/30 transition-all group shadow-sm">
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-brand-neon bg-brand-neon/10 px-2 py-0.5 rounded uppercase">{getTeamName(player.teamId)}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(player)} className="text-slate-400 hover:text-white"><Edit size={14}/></button>
                <button onClick={() => handleDelete(player.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={14}/></button>
            </div>
        </div>
        <div className="font-bold text-white mb-1">{player.name} {player.surname}</div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <FileText size={12} /> {player.dni}
        </div>
        <div className="text-xs text-slate-500 mb-3">Nacimiento: {player.birthDate}</div>

        <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
            {player.status === 'Pendiente' ? (
                 <button onClick={() => handleStatusChange(player, 'Validado')} className="w-full py-1.5 bg-green-500/10 text-green-400 rounded text-xs font-bold hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                    <Check size={12} /> Validar
                </button>
            ) : (
                <button onClick={() => handleStatusChange(player, 'Pendiente')} className="w-full py-1.5 bg-orange-500/10 text-orange-400 rounded text-xs font-bold hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                    <X size={12} /> Invalidar
                </button>
            )}
        </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-display font-bold text-white">Documentación</h1>
           <p className="text-slate-400 mt-1">Validación de identidades y permisos (Admin View)</p>
        </div>
        <div className="flex gap-4 items-center">
             <select 
                className="bg-brand-deep border border-white/10 rounded-lg p-2 text-white text-sm focus:border-brand-neon outline-none"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
            >
                <option value="all">Todos los equipos</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={handleOpenCreate} className="bg-brand-neon text-brand-deep px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors flex items-center gap-2">
                <Plus size={18} /> Añadir Jugador
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-4">
                {/* Column Pending */}
                <div className="bg-brand-surface/50 border border-white/5 rounded-2xl flex flex-col h-full">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center border-l-4 border-l-orange-500 rounded-tl-xl">
                        <h3 className="font-bold text-white">Pendiente Revisión</h3>
                        <span className="bg-brand-deep px-2 py-0.5 rounded text-xs text-slate-400">{pendingPlayers.length}</span>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto dashboard-scroll">
                        {pendingPlayers.map(p => <PlayerCard key={p.id} player={p} />)}
                    </div>
                </div>

                {/* Column Validated */}
                 <div className="bg-brand-surface/50 border border-white/5 rounded-2xl flex flex-col h-full">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center border-l-4 border-l-brand-neon rounded-tl-xl">
                        <h3 className="font-bold text-white">Documentación Validada</h3>
                        <span className="bg-brand-deep px-2 py-0.5 rounded text-xs text-slate-400">{validatedPlayers.length}</span>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto dashboard-scroll">
                        {validatedPlayers.map(p => <PlayerCard key={p.id} player={p} />)}
                    </div>
                </div>
          </div>
      </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Jugador" : "Nuevo Jugador"}>
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Nombre</label>
                    <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Apellido</label>
                    <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
                </div>
             </div>
             <div>
                <label className="block text-sm text-slate-400 mb-1">DNI / Pasaporte</label>
                <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
            </div>
             <div>
                <label className="block text-sm text-slate-400 mb-1">Equipo</label>
                 <select required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})}>
                    <option value="">Selecciona equipo</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                 </select>
            </div>
            <div>
                <label className="block text-sm text-slate-400 mb-1">Fecha Nacimiento</label>
                <input type="date" required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
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

export default Documentation;