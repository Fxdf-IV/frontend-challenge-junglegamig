// Rota autenticada de carteiras: gerencia carteira principal e secundária do colecionador.
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
import { cn } from "@/lib/utils";

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
  component: WalletsPage,
});

/** Formato completo dos campos da carteira alinhado ao frame do Figma (Print 2). */
interface WalletFormState {
  displayName: string;
  label: string;
  network: Network | "";
  profileName: string;
  address: string;
  secondaryAddress: string;
  provider: WalletProvider | "";
  referralCode: string;
  email: string;
  ensName: string;
}

const selectClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary";

/**
 * Página de gerenciamento de carteiras com fidelidade total ao Figma:
 * - Seção Carteira principal com todos os 10 campos em grade de 2 colunas e botão Salvar carteira.
 * - Seção Carteira secundária com estado vazio e opção de replicar a carteira principal.
 */
function WalletsPage() {
  const { user } = useSession();
  const cart = useCart();
  const hasCartItems = !!cart.data?.items.length;

  const q = useQuery({
    queryKey: qk.wallets(user!.id),
    queryFn: api.wallets,
    select: (d) => d.items,
  });

  const primaryWallet = q.data?.find((w) => w.role === "primary");
  const secondaryWallet = q.data?.find((w) => w.role === "secondary");

  const [addingSecondary, setAddingSecondary] = useState(false);
  const [sameAsPrimary, setSameAsPrimary] = useState(false);

  return (
    <div className="container-page grid gap-8 py-8 md:grid-cols-[16rem_1fr]">
      <AccountNav />

      <div className="min-w-0">
        {hasCartItems && (
          <div className="mb-6 flex justify-end">
            <Button variant="line" size="sm" asChild>
              <Link to="/checkout">Voltar para o pagamento</Link>
            </Button>
          </div>
        )}

        {q.isLoading ? (
          <div className="space-y-6">
            <div className="shimmer h-12 w-1/3 rounded-md" />
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="shimmer h-14 rounded-md" />
              ))}
            </div>
          </div>
        ) : q.isError ? (
          <div role="alert" className="rounded-lg bg-card p-6">
            <p>{(q.error as Error).message}</p>
            <Button variant="brand" className="mt-3" onClick={() => q.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Seção 1: Carteira principal */}
            <section aria-labelledby="primary-title">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <h1 id="primary-title" className="text-xl font-bold font-mono text-foreground">
                    Carteira principal
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
                  </p>
                </div>
                {!primaryWallet && (
                  <span className="text-sm font-mono font-bold text-primary">Adicionar</span>
                )}
              </div>

              <WalletDetailForm
                role="primary"
                wallet={primaryWallet}
                userDefaults={{
                  displayName: user?.displayName ?? "",
                  profileName: user?.username ?? "",
                  email: user?.email ?? "",
                  ensName: user?.ensName ?? "",
                  label: user?.walletNickname ?? "Reserva",
                }}
              />
            </section>

            {/* Seção 2: Carteira secundária */}
            <section aria-labelledby="secondary-title" className="border-t border-border/40 pt-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2
                    id="secondary-title"
                    className="text-base font-bold font-mono text-foreground"
                  >
                    Carteira secundária
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    {secondaryWallet
                      ? "Carteira secundária configurada para recebimento de NFTs."
                      : "Você ainda não adicionou uma carteira secundária."}
                  </p>
                </div>

                {!secondaryWallet && (
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-mono text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPrimary}
                        onChange={(e) => {
                          setSameAsPrimary(e.target.checked);
                          if (e.target.checked) setAddingSecondary(true);
                        }}
                        className="h-4 w-4 rounded-full border border-border bg-card accent-primary"
                      />
                      <span>Igual à carteira principal</span>
                    </label>
                    {!addingSecondary && (
                      <button
                        type="button"
                        onClick={() => setAddingSecondary(true)}
                        className="text-sm font-mono font-bold text-primary hover:underline cursor-pointer"
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                )}
              </div>

              {secondaryWallet || addingSecondary ? (
                <WalletDetailForm
                  role="secondary"
                  wallet={secondaryWallet}
                  initialFromPrimary={sameAsPrimary ? primaryWallet : undefined}
                  userDefaults={{
                    displayName: user?.displayName ?? "",
                    profileName: user?.username ?? "",
                    email: user?.email ?? "",
                    ensName: user?.ensName ?? "",
                    label: "Carteira Secundária",
                  }}
                  onCancel={() => {
                    setAddingSecondary(false);
                    setSameAsPrimary(false);
                  }}
                />
              ) : null}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Formulário com os 10 campos de carteira especificados no Figma:
 * Nome de exibição, Apelido da carteira, Rede, Nome do perfil, Endereço da carteira,
 * ENS/secundária, Tipo de carteira, Código de indicação, E-mail e Nome ENS.
 */
function WalletDetailForm({
  role,
  wallet,
  initialFromPrimary,
  userDefaults,
  onCancel,
}: {
  role: "primary" | "secondary";
  wallet?: Wallet;
  initialFromPrimary?: Wallet;
  userDefaults: {
    displayName: string;
    profileName: string;
    email: string;
    ensName: string;
    label: string;
  };
  onCancel?: () => void;
}) {
  const { user } = useSession();
  const qc = useQueryClient();

  const [form, setForm] = useState<WalletFormState>(() => {
    if (wallet) {
      return {
        displayName: wallet.displayName || userDefaults.displayName,
        label: wallet.label || userDefaults.label,
        network: wallet.network,
        profileName: wallet.profileName || userDefaults.profileName,
        address: wallet.address,
        secondaryAddress: wallet.secondaryAddress || "",
        provider: wallet.provider,
        referralCode: wallet.referralCode || "",
        email: wallet.email || userDefaults.email,
        ensName: wallet.ensName || userDefaults.ensName,
      };
    }
    if (initialFromPrimary) {
      return {
        displayName: initialFromPrimary.displayName || userDefaults.displayName,
        label: "Secundária",
        network: initialFromPrimary.network,
        profileName: initialFromPrimary.profileName || userDefaults.profileName,
        address: "",
        secondaryAddress: "",
        provider: initialFromPrimary.provider,
        referralCode: initialFromPrimary.referralCode || "",
        email: initialFromPrimary.email || userDefaults.email,
        ensName: initialFromPrimary.ensName || userDefaults.ensName,
      };
    }
    return {
      displayName: userDefaults.displayName,
      label: userDefaults.label,
      network: "ethereum",
      profileName: userDefaults.profileName,
      address: "",
      secondaryAddress: "",
      provider: "metamask",
      referralCode: "",
      email: userDefaults.email,
      ensName: userDefaults.ensName,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (wallet) {
      setForm({
        displayName: wallet.displayName || userDefaults.displayName,
        label: wallet.label || userDefaults.label,
        network: wallet.network,
        profileName: wallet.profileName || userDefaults.profileName,
        address: wallet.address,
        secondaryAddress: wallet.secondaryAddress || "",
        provider: wallet.provider,
        referralCode: wallet.referralCode || "",
        email: wallet.email || userDefaults.email,
        ensName: wallet.ensName || userDefaults.ensName,
      });
    }
  }, [wallet, userDefaults]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: Omit<Wallet, "id"> = {
        role,
        label: form.label.trim() || (role === "primary" ? "Reserva" : "Secundária"),
        address: form.address.trim(),
        provider: (form.provider as WalletProvider) || "metamask",
        network: (form.network as Network) || "ethereum",
        displayName: form.displayName,
        profileName: form.profileName,
        secondaryAddress: form.secondaryAddress,
        referralCode: form.referralCode,
        email: form.email,
        ensName: form.ensName,
      };

      return wallet ? api.updateWallet(wallet.id, payload) : api.createWallet(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.wallets(user!.id) });
      setErrors({});
      toast.success(
        wallet
          ? role === "primary"
            ? "Carteira principal atualizada"
            : "Carteira secundária atualizada"
          : role === "primary"
            ? "Carteira principal cadastrada"
            : "Carteira secundária cadastrada",
      );
    },
    onError: (e: ApiError) => {
      setErrors(e.fields ?? { form: e.message });
      toast.error(e.message || "Não foi possível salvar a carteira");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!form.label.trim() || form.label.trim().length < 2) {
      errs.label = "Informe o apelido da carteira";
    }

    if (!form.network) {
      errs.network = "Selecione uma rede";
    }

    if (!form.provider) {
      errs.provider = "Selecione uma carteira";
    }

    if (!form.address.trim()) {
      errs.address = "Informe o endereço da carteira";
    } else if (
      form.network === "solana"
        ? !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(form.address)
        : !/^0x[0-9a-fA-F]{40}$/.test(form.address)
    ) {
      errs.address =
        form.network === "solana"
          ? "Endereço Solana inválido"
          : "Use 0x seguido de 40 caracteres hexadecimais";
    }

    setErrors(errs);
    if (!Object.keys(errs).length) {
      saveMutation.mutate();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FormError message={errors.form} />

      <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {/* Linha 1 */}
        <Field
          label="Nome de exibição *"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          error={errors.displayName}
        />
        <Field
          label="Apelido da carteira *"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          error={errors.label}
        />

        {/* Linha 2 */}
        <div>
          <label
            htmlFor={`${role}-network`}
            className="mb-1.5 block text-xs font-semibold font-mono text-foreground"
          >
            Rede <span className="text-primary">*</span>
          </label>
          <select
            id={`${role}-network`}
            value={form.network}
            onChange={(e) => setForm({ ...form, network: e.target.value as Network })}
            className={selectClass}
          >
            <option value="" disabled>
              Selecione uma rede
            </option>
            {(Object.keys(NETWORK_LABELS) as Network[]).map((n) => (
              <option key={n} value={n}>
                {NETWORK_LABELS[n]}
              </option>
            ))}
          </select>
          {errors.network && (
            <p role="alert" className="mt-1 text-[11px] text-destructive">
              {errors.network}
            </p>
          )}
        </div>

        <Field
          label="Nome do perfil *"
          value={form.profileName}
          onChange={(e) => setForm({ ...form, profileName: e.target.value })}
          error={errors.profileName}
        />

        {/* Linha 3 */}
        <Field
          label="Endereço da carteira *"
          placeholder="Endereço 0x da carteira"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value.trim() })}
          error={errors.address}
          spellCheck={false}
        />

        <Field
          label="ENS ou carteira secundária (opcional)"
          placeholder="ENS ou carteira secundária (opcional)"
          value={form.secondaryAddress}
          onChange={(e) => setForm({ ...form, secondaryAddress: e.target.value.trim() })}
          error={errors.secondaryAddress}
        />

        {/* Linha 4 */}
        <div>
          <label
            htmlFor={`${role}-provider`}
            className="mb-1.5 block text-xs font-semibold font-mono text-foreground"
          >
            Tipo de carteira <span className="text-primary">*</span>
          </label>
          <select
            id={`${role}-provider`}
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value as WalletProvider })}
            className={selectClass}
          >
            <option value="" disabled>
              Selecione uma carteira
            </option>
            {(Object.keys(PROVIDER_LABELS) as WalletProvider[]).map((p) => (
              <option key={p} value={p}>
                {PROVIDER_LABELS[p]}
              </option>
            ))}
          </select>
          {errors.provider && (
            <p role="alert" className="mt-1 text-[11px] text-destructive">
              {errors.provider}
            </p>
          )}
        </div>

        <Field
          label="Código de indicação *"
          value={form.referralCode}
          onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
          error={errors.referralCode}
        />

        {/* Linha 5 */}
        <Field
          label="E-mail *"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />

        <div className="min-w-0">
          <label
            htmlFor={`${role}-ens`}
            className="mb-1.5 block text-xs font-semibold font-mono text-foreground"
          >
            Nome ENS <span className="text-primary">*</span>
          </label>
          <div className="flex">
            <select
              aria-label="Sufixo ENS"
              defaultValue=".eth"
              className="h-10 rounded-l-md border border-r-0 border-input bg-card px-2.5 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value=".eth">.eth</option>
              <option value=".sol">.sol</option>
              <option value=".crypto">.crypto</option>
            </select>
            <input
              id={`${role}-ens`}
              value={form.ensName}
              onChange={(e) => setForm({ ...form, ensName: e.target.value })}
              className={cn(inputClass, "rounded-l-none")}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          variant="brand"
          className="px-8 py-2 text-sm font-bold font-mono normal-case"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Salvando…" : "Salvar carteira"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="text-xs font-mono">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
