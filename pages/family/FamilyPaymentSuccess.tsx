// src/pages/family/FamilyPaymentsSuccess.tsx
import React, { useEffect, useState } from "react";
import { fetchMyPagos } from "../../services/PaymentService";

export default function FamilyPaymentsSuccess() {
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    // Damos un pequeño margen al webhook (cuando lo tengas)
    const t = setTimeout(async () => {
      try {
        await fetchMyPagos();
      } finally {
        setRefreshing(false);
      }
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="rounded-xl border p-6">
        <h1 className="text-2xl font-semibold">Pago recibido ✅</h1>
        <p className="text-sm text-gray-600 mt-2">
          Gracias. En breve verás el estado actualizado en tu lista de pagos.
        </p>

        <div className="mt-5">
          <a
            href="/#/family/payments"
            className="inline-flex items-center rounded-lg bg-black text-white px-4 py-2 text-sm"
          >
            Volver a Pagos
          </a>
        </div>

        {refreshing && <div className="text-xs text-gray-500 mt-3">Actualizando estado…</div>}
      </div>
    </div>
  );
}
