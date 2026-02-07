import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

const mockDocs = [
  { id: "1", name: "Autorización viaje", status: "pendiente", updated: "—" },
  { id: "2", name: "Ficha médica", status: "pendiente", updated: "—" },
  { id: "3", name: "DNI / Pasaporte", status: "subido", updated: "2026-02-01" },
];

function tone(status: string) {
  if (status === "subido") return "success" as const;
  if (status === "pendiente") return "warning" as const;
  return "neutral" as const;
}

export default function FamilyDocuments() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Documentos" subtitle="Docs" right={<Button variant="secondary">+ Subir</Button>} />
        <CardContent>
          <div className="text-sm text-[rgb(var(--muted))]">
            Documentación médica, autorizaciones y archivos del torneo. (Diseño listo, lógica después.)
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {mockDocs.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-base font-extrabold truncate">{d.name}</div>
                  <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                    Última actualización: {d.updated}
                  </div>
                </div>
                <Badge tone={tone(d.status)}>{d.status}</Badge>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="flex-1">
                  Ver
                </Button>
                <Button className="flex-1">
                  {d.status === "pendiente" ? "Subir ahora" : "Reemplazar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
