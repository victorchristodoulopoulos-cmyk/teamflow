import React, { useState } from "react";
import { Bus, Plane, Edit, Trash2 } from "lucide-react";
import { useStore, Transport as TransportType } from "../../context/Store";
import Modal from "../../components/ui/Modal";

const TransportPage: React.FC = () => {
  const { transport, addTransport, updateTransport, deleteTransport } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TransportType>>({
    company: "",
    seats: 54,
    departureTime: "",
    departureCity: "",
    status: "Pendiente",
    type: "Bus",
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      company: "",
      seats: 54,
      departureTime: "",
      departureCity: "",
      status: "Pendiente",
      type: "Bus",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TransportType) => {
    setEditingId(t.id);
    setFormData(t);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateTransport({ ...formData, id: editingId } as TransportType);
    } else {
      addTransport(formData as TransportType);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Eliminar transporte?")) {
      deleteTransport(id);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Transporte</h1>
          <p className="text-slate-400 mt-1">Control de flota y horarios de salida</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-brand-neon text-brand-deep px-6 py-2.5 rounded-xl font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(201,255,47,0.3)]"
        >
          + Añadir Transporte
        </button>
      </div>

      {/* LISTA DE TRANSPORTES */}
      <div className="space-y-4">
        {transport.map((item) => (
          <div
            key={item.id}
            className="bg-brand-surface p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-6 hover:border-brand-neon/30 transition-all group"
          >
            <div className="w-16 h-16 bg-brand-deep rounded-2xl flex items-center justify-center text-brand-neon border border-white/5">
              {item.type === "Avión" ? <Plane size={32} /> : <Bus size={32} />}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div>
                <h3 className="text-lg font-bold text-white">{item.company}</h3>
                <div className="text-sm text-slate-400 mt-1">
                  {item.type} – Salida {item.departureCity}
                </div>
              </div>

              <div className="flex flex-col gap-2 justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-neon"></div>
                  <div className="text-sm text-white font-medium">
                    {item.departureTime}
                    <span className="text-slate-500 ml-2">Salida Estimada</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-6">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{item.seats}</div>
                  <div className="text-xs text-slate-500 uppercase">Plazas</div>
                </div>

                <div className="h-10 w-px bg-white/10"></div>

                <div className="text-right">
                  <div
                    className={`text-2xl font-bold ${
                      item.status === "OK" ? "text-green-400" : "text-orange-400"
                    }`}
                  >
                    {item.status}
                  </div>
                  <div className="text-xs text-slate-500 uppercase">Estado</div>
                </div>
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex flex-col gap-2 border-l border-white/5 pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-2 bg-brand-deep rounded-lg hover:text-blue-400 text-slate-400"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-brand-deep rounded-lg hover:text-red-400 text-slate-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar Transporte" : "Nuevo Transporte"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm text-slate-400 mb-1">Empresa / Aerolínea</label>
            <input
              required
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Tipo</label>
              <select
                required
                className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="Bus">Bus</option>
                <option value="Avión">Avión</option>
                <option value="Tren">Tren</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Plazas</label>
              <input
                type="number"
                required
                className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Ciudad Salida</label>
              <input
                required
                className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
                value={formData.departureCity}
                onChange={(e) =>
                  setFormData({ ...formData, departureCity: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Hora Salida</label>
              <input
                type="time"
                required
                className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
                value={formData.departureTime}
                onChange={(e) =>
                  setFormData({ ...formData, departureTime: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Estado</label>
            <select
              required
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
            >
              <option value="Pendiente">Pendiente</option>
              <option value="OK">OK</option>
              <option value="Retrasado">Retrasado</option>
            </select>
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
              className="px-6 py-2 bg-brand-neon text-brand-deep font-bold rounded-lg hover:bg-white"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransportPage;
