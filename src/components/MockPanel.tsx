import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { api } from "@/api/endpoints";
import type { ScenarioId } from "@/api/types";
import { useCart } from "@/lib/cart";
import { useRealtime } from "@/lib/realtime";
import { ethAdd } from "@/lib/eth";

const SCENARIOS: Array<[ScenarioId, string]> = [
  ["default", "Padrão"],
  ["slow", "Rede lenta (1,8 s)"],
  ["jitter", "Latência variável / fora de ordem"],
  ["flaky", "Falha intermitente (503)"],
  ["offline", "Sem conexão"],
  ["server-error", "Catálogo com erro 500"],
  ["empty", "Catálogo vazio"],
  ["session-expired", "Sessão expira em 20 s"],
  ["favorite-fail", "Falha ao favoritar"],
  ["price-change", "Preço muda ao confirmar"],
  ["sold-out", "Edição esgota ao confirmar"],
  ["order-timeout", "Timeout após criar pedido"],
  ["payment-declined", "Pagamento recusado"],
];

/** Demo control panel. Every action goes through MSW REST handlers; events reach the app via socket.io-client. */
export function MockPanel() {
  const qc = useQueryClient();
  const cart = useCart();
  const { status } = useRealtime();
  const [scenario, setScenario] = useState<string>("default");
  useEffect(() => {
    api.mock.scenario().then((r) => setScenario(r.scenario)).catch(() => {});
  }, []);

  const change = async (s: string) => {
    await api.mock.setScenario(s);
    setScenario(s);
    qc.invalidateQueries();
    toast.info(`Cenário: ${SCENARIOS.find((x) => x[0] === s)?.[1]}`);
  };
  const first = cart.data?.items[0];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="fixed bottom-16 left-3 z-40 md:bottom-4" aria-label="Abrir painel de cenários de simulação">
          <FlaskConical /> Cenários
          <span className={status === "connected" ? "h-2 w-2 rounded-full bg-success" : "h-2 w-2 rounded-full bg-destructive"} aria-label={`tempo real ${status}`} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Simulação (MSW)</SheetTitle>
          <SheetDescription>Cenários de rede, falhas e eventos em tempo real. Credenciais: ana@kurio.dev / bruno@kurio.dev — senha Kurio@123.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-5 px-4 pb-6 text-sm">
          <fieldset>
            <legend className="mb-2 font-semibold">Cenário ativo</legend>
            <div className="space-y-1">
              {SCENARIOS.map(([id, label]) => (
                <label key={id} className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="scenario" checked={scenario === id} onChange={() => change(id)} className="accent-primary" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <p className="font-semibold">Eventos Socket.IO ({status})</p>
            <Button size="sm" variant="line" className="w-full" disabled={!first} onClick={() => first && api.mock.nftUpdate({ nftId: first.nftId, edition: first.edition, price: ethAdd(first.unitPrice, "0.05") })}>
              +0,05 ETH no 1º item do carrinho
            </Button>
            <Button size="sm" variant="line" className="w-full" disabled={!first} onClick={() => first && api.mock.nftUpdate({ nftId: first.nftId, edition: first.edition, available: 0 })}>
              Esgotar 1º item do carrinho
            </Button>
            <Button size="sm" variant="line" className="w-full" onClick={() => api.mock.socket("duplicate")}>Reenviar último evento (duplicado)</Button>
            <Button size="sm" variant="line" className="w-full" onClick={() => api.mock.socket("stale")}>Enviar evento antigo</Button>
            <Button size="sm" variant="line" className="w-full" onClick={() => api.mock.socket("drop")}>Derrubar conexão (3 s)</Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={async () => {
              await api.mock.reset();
              localStorage.removeItem("kurio.token");
              localStorage.removeItem("kurio.guestCart");
              window.location.assign("/");
            }}
          >
            Restaurar dados iniciais
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
