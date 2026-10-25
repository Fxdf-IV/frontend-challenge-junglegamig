// Rota de carteiras: permite cadastrar e editar as carteiras principal e secundária do colecionador.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import type { ApiError } from "@/api/client";
import { qk } from "@/api/queries";
import type { Network, Wallet, WalletProvider } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Field, FormError, inputClass } from "@/components/Field";
import { AccountNav } from "@/components/AccountNav";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { NETWORK_LABELS, PROVIDER_LABELS } from "@/lib/labels";

/** Metadados e montagem da rota privada de gerenciamento de carteiras. */
export const Route = createFileRoute("/_authenticated/carteiras")({
  head: () => ({
    meta: [
      { title: "Carteiras — Kurio" },
      { name: "description", content: "Cadastre e edite suas carteiras principal e secundária." },
      { property: "og:title", content: "Carteiras — Kurio" },
      { property: "og:description", content: "Gerencie suas carteiras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Wallets,
});

/** Lista os formulários de carteira principal e secundária e atalho de retorno ao checkout. */
function Wallets() {
  const { user } = useSession();
  const cart = useCart();
  const hasCartItems = !!cart.data?.items.length;
  const q = useQuery({
    queryKey: qk.wallets(user!.id),
    queryFn: api.wallets,
    select: (d) => d.items,
  });
  return (
    <div className="container-page grid gap-8 py-8 md:grid-cols-[14rem_1fr]">
      <AccountNav />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-bold">Carteiras</h1>
          {hasCartItems && (
            <Button variant="line" size="sm" asChild>
              <Link to="/checkout">Voltar para o pagamento</Link>
            </Button>
          )}
        </div>
        {q.isLoading ? (
          <div className="shimmer h-72 rounded-lg" />
        ) : q.isError ? (
          <div role="alert" className="rounded-lg bg-card p-6">
            <p>{(q.error as Error).message}</p>
            <Button variant="brand" className="mt-3" onClick={() => q.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <WalletForm role="primary" wallet={q.data?.find((w) => w.role === "primary")} />
            <WalletForm role="secondary" wallet={q.data?.find((w) => w.role === "secondary")} />
          </>
        )}
      </div>
    </div>
  );
}

const EMPTY = {
  label: "",
  address: "",
  provider: "metamask" as WalletProvider,
  network: "ethereum" as Network,
};

const SAMPLE_ADDRESS: Record<Wallet["role"], Record<Network, string>> = {
  primary: {
    ethereum: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    polygon: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    solana: "7fUAJdStEuGbc3sM84cKRL6yYaaSstyLSU4ve5oovLS7",
  },
  secondary: {
    ethereum: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
    polygon: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
    solana: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  },
};

/** Formulário individual de criação ou edição de carteira com validação por rede. */
function WalletForm({ role, wallet }: { role: Wallet["role"]; wallet?: Wallet }) {
  const { user } = useSession();
  const qc = useQueryClient();
  const [v, setV] = useState(wallet ?? EMPTY);
  const [editing, setEditing] = useState(!wallet);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    setV(wallet ?? EMPTY);
    setEditing(!wallet);
  }, [wallet]);
  const m = useMutation({
    mutationFn: () => (wallet ? api.updateWallet(wallet.id, v) : api.createWallet({ ...v, role })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.wallets(user!.id) });
      setErrors({});
      toast.success(wallet ? "Carteira atualizada" : "Carteira cadastrada");
    },
    onError: (e: ApiError) => setErrors(e.fields ?? { form: e.message }),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (v.label.trim().length < 2) errs.label = "Informe um nome com ao menos 2 caracteres";
    if (
      v.network === "solana"
        ? !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v.address)
        : !/^0x[0-9a-fA-F]{40}$/.test(v.address)
    )
      errs.address =
        v.network === "solana"
          ? "Endereço Solana inválido"
          : "Use 0x seguido de 40 caracteres hexadecimais";
    setErrors(errs);
    if (!Object.keys(errs).length) m.mutate();
  };
  const title = role === "primary" ? "Carteira principal" : "Carteira secundária";
  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-lg bg-card p-5"
      aria-labelledby={`${role}-title`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 id={`${role}-title`} className="font-bold">
            {title}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {role === "primary"
              ? "Usada por padrão no pagamento."
              : "Opcional, para receber NFTs separados."}
          </p>
        </div>
        {wallet && !editing && (
          <Button type="button" variant="line" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
        )}
      </div>
      <FormError message={errors.form} />
      <fieldset disabled={!editing || m.isPending} className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome da carteira *"
          value={v.label}
          onChange={(e) => setV({ ...v, label: e.target.value })}
          error={errors.label}
        />
        <div>
          <label htmlFor={`${role}-provider`} className="mb-1.5 block text-xs font-semibold">
            Tipo de carteira *
          </label>
          <select
            id={`${role}-provider`}
            value={v.provider}
            onChange={(e) => setV({ ...v, provider: e.target.value as WalletProvider })}
            className={inputClass}
          >
            {(Object.keys(PROVIDER_LABELS) as WalletProvider[]).map((p) => (
              <option key={p} value={p}>
                {PROVIDER_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Endereço da carteira *"
          value={v.address}
          onChange={(e) => setV({ ...v, address: e.target.value.trim() })}
          error={errors.address}
          className="sm:col-span-2"
          spellCheck={false}
        />
        <div>
          <label htmlFor={`${role}-network`} className="mb-1.5 block text-xs font-semibold">
            Rede *
          </label>
          <select
            id={`${role}-network`}
            value={v.network}
            onChange={(e) => setV({ ...v, network: e.target.value as Network })}
            className={inputClass}
          >
            {(Object.keys(NETWORK_LABELS) as Network[]).map((n) => (
              <option key={n} value={n}>
                {NETWORK_LABELS[n]}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
      {editing && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="brand" className="normal-case" disabled={m.isPending}>
            {m.isPending ? "Salvando…" : wallet ? "Salvar" : "Adicionar"}
          </Button>
          <Button
            type="button"
            variant="line"
            className="normal-case"
            disabled={m.isPending}
            onClick={() => {
              setV((curr) => ({
                ...curr,
                label:
                  curr.label.trim() ||
                  (role === "primary" ? "MetaMask Principal" : "Carteira Secundária"),
                address: SAMPLE_ADDRESS[role][curr.network],
              }));
              setErrors({});
            }}
          >
            Gerar endereço de exemplo
          </Button>
          {wallet && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setV(wallet);
                setEditing(false);
                setErrors({});
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
