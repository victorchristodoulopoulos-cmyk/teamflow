import React, { useEffect, useState } from "react";
import { MapPin, Phone, Star, Trash2, Edit } from "lucide-react";
import Modal from "../../components/ui/Modal";
import {
  getHotels,
  createHotel,
  updateHotelDB,
  deleteHotelDB,
  type Hotel,
} from "../../supabase/hotelService";

const Hotels: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Hotel, "id">>({
    name: "",
    city: "",
    stars: 3,
    contact: "",
    rooms: 0,
  });

  // Cargar hoteles al montar
  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    const data = await getHotels();
    setHotels(data);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      city: "",
      stars: 3,
      contact: "",
      rooms: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Hotel) => {
    setEditingId(h.id);
    setFormData({
      name: h.name,
      city: h.city,
      stars: h.stars,
      contact: h.contact,
      rooms: h.rooms,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("➡️ handleSubmit HOTEL", { editingId, formData });

  try {
    if (editingId) {
      console.log("✏️ Actualizando hotel...");
      await updateHotelDB({
        id: editingId,
        ...formData,
      });
    } else {
      console.log("➕ Creando hotel...");
      await createHotel(formData);
    }

    console.log("✅ Guardado OK, recargando lista...");
    setIsModalOpen(false);
    await loadHotels();
  } catch (err: any) {
    console.error("❌ Error guardando hotel:", err);
    alert("Error guardando hotel: " + (err?.message || "ver consola"));
  }
};


  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar hotel?")) return;
    await deleteHotelDB(id);
    loadHotels();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Hoteles</h1>
          <p className="text-slate-400 mt-1">
            Gestión de alojamientos asociados a tus torneos
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-brand-neon text-brand-deep px-6 py-2.5 rounded-xl font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(201,255,47,0.3)]"
        >
          + Añadir Hotel
        </button>
      </div>

      <div className="space-y-4">
        {hotels.map((h) => (
          <div
            key={h.id}
            className="bg-brand-surface p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between gap-4 hover:border-brand-neon/30 transition-all group"
          >
            <div className="flex-1 flex flex-col gap-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {h.name}
                <span className="flex items-center text-brand-neon text-sm">
                  <Star size={16} />
                  <span className="ml-1">{h.stars}★</span>
                </span>
              </h3>
              <div className="text-slate-400 text-sm flex items-center gap-2">
                <MapPin size={14} /> {h.city}
              </div>
              <div className="text-slate-400 text-sm flex items-center gap-2">
                <Phone size={14} /> {h.contact}
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{h.rooms}</div>
                <div className="text-xs text-slate-500 uppercase">
                  Habitaciones
                </div>
              </div>

              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(h)}
                  className="p-2 bg-brand-deep rounded-lg hover:text-blue-400 text-slate-400"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(h.id)}
                  className="p-2 bg-brand-deep rounded-lg hover:text-red-400 text-slate-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {hotels.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
            No hay hoteles aún. Empieza creando el primero.
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar Hotel" : "Nuevo Hotel"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Nombre del hotel
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Ciudad</label>
            <input
              required
              value={formData.city}
              onChange={(e) =>
                setFormData((f) => ({ ...f, city: e.target.value }))
              }
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Estrellas
              </label>
              <input
                type="number"
                min={1}
                max={5}
                required
                value={formData.stars}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    stars: parseInt(e.target.value || "0"),
                  }))
                }
                className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Habitaciones disponibles
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.rooms}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    rooms: parseInt(e.target.value || "0"),
                  }))
                }
                className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Contacto (teléfono / email)
            </label>
            <input
              required
              value={formData.contact}
              onChange={(e) =>
                setFormData((f) => ({ ...f, contact: e.target.value }))
              }
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
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

export default Hotels;
