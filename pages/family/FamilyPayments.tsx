import React, { useEffect, useMemo, useState } from "react";
import { fetchMyPagos, Pago, startCheckoutForPago } from "../../services/PaymentService";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Tabs } from "../../components/ui/Tabs";
import { useLocation } from "react-router-dom";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

function toneFromEstado(estado?: string | null) {
  const e = (estado ?? "").toLowerCase();
  if (e === "pagado") return "success" as const;
  if (e === "pendiente") return "warning" as const;
  if (e === "vencido") return "danger" as const;
  return "neutral" as const;
}

export default function FamilyPayments() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pendiente" | "pagado" | "todos">("pendiente");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [justPaidId, setJustPaidId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyPagos();
      setPagos(data);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando pagos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // On component mount or navigation, check for Stripe return status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const paidPagoId = params.get("pago");
    if (status === "success" && paidPagoId) {
      // Mark that a payment was just completed
      setJustPaidId(paidPagoId);
      // Optionally, reload payments after a short delay to allow webhook to update DB
      setLoading(true);
      setTimeout(async () => {
        try {
          await load();
        } finally {
          setLoading(false);
        }
      }, 1500);
    }
  }, [location.search]);

  const stats = useMemo(() => {
    const pending = pagos.filter((p) => (p.estado ?? "").toLowerCase() === "pendiente").length;
    const paid = pagos.filter((p) => (p.estado ?? "").toLowerCase() === "pagado").length;
    return { pending, paid, total: pagos.length };
  }, [pagos]);

  const filtered = useMemo(() => {
    if (filter === "todos") return pagos;
    return pagos.filter((p) => (p.estado ?? "").toLowerCase() === filter);
  }, [pagos, filter]);

  async function onPay(pagoId: string) {
    try {
      setPayingId(pagoId);
      await startCheckoutForPago(pagoId);
      // The above function redirects the browser to Stripe, so code below won't run on success.
    } catch (e: any) {
      alert(e?.message ?? "No se pudo iniciar el pago");
      setPayingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header / Summary */}
      <Card>
        <CardHeader
          title="Pagos del torneo"
          subtitle="Pagos"
          right={
            <Button variant="secondary" onClick={load} disabled={loading}>
              ↻ Actualizar
            </Button>
          }
        />
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-[rgb(var(--muted))]">
              Pendientes: <span className="font-extrabold text-[rgb(var(--text))]">{stats.pending}</span>{" "}
              · Pagados: <span className="font-extrabold text-[rgb(var(--text))]">{stats.paid}</span>{" "}
              · Total: <span className="font-extrabold text-[rgb(var(--text))]">{stats.total}</span>
            </div>
          </div>

          <Tabs
            value={filter}
            onChange={(v) => setFilter(v as any)}
            items={[
              { value: "pendiente", label: "Pendientes", count: stats.pending },
              { value: "pagado", label: "Pagados", count: stats.paid },
              { value: "todos", label: "Todos", count: stats.total },
            ]}
          />
        </CardContent>
      </Card>

      {/* If a payment was just completed, show a confirmation */}
      {justPaidId && (
        <Card className="border-green-500/50">
          <CardContent className="p-5 text-sm text-green-300">
            ✅ Pago realizado correctamente. El estado se ha actualizado.
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-[rgba(var(--danger),0.35)]">
          <CardContent className="p-5 text-sm text-[rgb(var(--danger))]">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-4">
          <div className="h-28 rounded-2xl border border-[rgba(var(--border))] bg-white/5 animate-pulse" />
          <div className="h-28 rounded-2xl border border-[rgba(var(--border))] bg-white/5 animate-pulse" />
          <div className="h-28 rounded-2xl border border-[rgba(var(--border))] bg-white/5 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="text-lg font-extrabold">No hay pagos en este filtro</div>
            <div className="mt-2 text-sm text-[rgb(var(--muted))]">
              {filter === "pagado"
                ? "Ningún pago completado todavía."
                : filter === "pendiente"
                ? "¡Genial! No tienes pagos pendientes."
                : "No existen pagos registrados."}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid gap-4 lg:hidden">
            {filtered.map((p) => {
              const estado = (p.estado ?? "").toLowerCase();
              const canPay = estado === "pendiente";
              return (
                <Card key={p.id} className={canPay ? "shadow-glow" : ""}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-base font-extrabold truncate">
                          {p.concepto ?? "Pago"}
                        </div>
                        <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                          {p.fecha_vencimiento ? `Vence: ${p.fecha_vencimiento}` : "—"}
                        </div>
                      </div>
                      <Badge tone={toneFromEstado(p.estado)}>{p.estado ?? "—"}</Badge>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs text-[rgb(var(--muted))]">Importe</div>
                        <div className="text-xl font-black">
                          {formatEUR(Number(p.importe))}
                        </div>
                      </div>
                      <Button
                        className="min-w-[140px]"
                        variant={canPay ? "primary" : "secondary"}
                        onClick={() => (canPay ? onPay(p.id) : null)}
                        disabled={!canPay || payingId === p.id}
                      >
                        {payingId === p.id ? "Redirigiendo…" : canPay ? "Pagar ahora" : "No disponible"}
                      </Button>
                    </div>
                    {p.fecha_pago ? (
                      <div className="text-xs text-[rgb(var(--muted))]">Pagado el {p.fecha_pago}</div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop: table */}
          <Card className="hidden lg:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[rgb(var(--muted))] border-b border-[rgba(var(--border))]">
                      <th className="px-6 py-4 font-semibold">Concepto</th>
                      <th className="px-6 py-4 font-semibold">Importe</th>
                      <th className="px-6 py-4 font-semibold">Vencimiento</th>
                      <th className="px-6 py-4 font-semibold">Estado</th>
                      <th className="px-6 py-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const estado = (p.estado ?? "").toLowerCase();
                      const canPay = estado === "pendiente";
                      return (
                        <tr
                          key={p.id}
                          className="border-b border-[rgba(var(--border))] hover:bg-white/5 transition"
                        >
                          <td className="px-6 py-5">
                            <div className="font-extrabold">{p.concepto ?? "Pago"}</div>
                            <div className="text-xs text-[rgb(var(--muted))]">ID: {p.id}</div>
                          </td>
                          <td className="px-6 py-5 font-black">
                            {formatEUR(Number(p.importe))}
                          </td>
                          <td className="px-6 py-5 text-[rgb(var(--muted))]">
                            {p.fecha_vencimiento ?? "—"}
                          </td>
                          <td className="px-6 py-5">
                            <Badge tone={toneFromEstado(p.estado)}>{p.estado ?? "—"}</Badge>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Button
                              variant={canPay ? "primary" : "secondary"}
                              disabled={!canPay || payingId === p.id}
                              onClick={() => (canPay ? onPay(p.id) : null)}
                            >
                              {payingId === p.id ? "Redirigiendo…" : canPay ? "Pagar ahora" : "No disponible"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="text-xs text-[rgb(var(--muted))]">
            Pagos procesados de forma segura con Stripe.
          </div>
        </>
      )}
    </div>
  );
}
