// Campos ENS e apelido da carteira usados no formulário do perfil.
import { Field, inputClass } from "@/components/Field";
import type { ProfileMetadata } from "@/lib/profile-metadata";
import { cn } from "@/lib/utils";

/**
 * Renderiza os metadados ENS e da carteira mantendo rótulos e erros acessíveis.
 * No Figma, o seletor .eth fica posicionado à esquerda do campo de texto.
 */
export function ProfileMetadataFields({
  ensName,
  walletNickname,
  errors,
  onEnsNameChange,
  onWalletNicknameChange,
}: {
  ensName: string;
  walletNickname: string;
  errors: Partial<Record<keyof ProfileMetadata, string>>;
  onEnsNameChange: (value: string) => void;
  onWalletNicknameChange: (value: string) => void;
}) {
  return (
    <>
      <div className="min-w-0">
        <label
          htmlFor="profile-ens-name"
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
            id="profile-ens-name"
            value={ensName}
            onChange={(event) => onEnsNameChange(event.target.value)}
            aria-invalid={!!errors.ensName}
            aria-describedby={errors.ensName ? "profile-ens-error" : undefined}
            className={cn(inputClass, "rounded-l-none")}
          />
        </div>
        {errors.ensName && (
          <p id="profile-ens-error" role="alert" className="mt-1 text-[11px] text-destructive">
            {errors.ensName}
          </p>
        )}
      </div>
      <Field
        label="Apelido da carteira *"
        value={walletNickname}
        onChange={(event) => onWalletNicknameChange(event.target.value)}
        error={errors.walletNickname}
      />
    </>
  );
}
