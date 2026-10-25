// Campos ENS e apelido da carteira usados no formulário do perfil.
import { Field, inputClass } from "@/components/Field";
import type { ProfileMetadata } from "@/lib/profile-metadata";

/** Renderiza os metadados ENS e da carteira mantendo rótulos e erros acessíveis. */
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
        <label htmlFor="profile-ens-name" className="mb-1.5 block text-xs font-semibold">
          Nome ENS *
        </label>
        <div className="flex gap-2">
          <input
            id="profile-ens-name"
            value={ensName}
            onChange={(event) => onEnsNameChange(event.target.value)}
            aria-invalid={!!errors.ensName}
            aria-describedby={errors.ensName ? "profile-ens-error" : undefined}
            className={inputClass}
          />
          <select
            aria-label="Sufixo ENS"
            defaultValue=".eth"
            className="h-10 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value=".eth">.eth</option>
          </select>
        </div>
        {errors.ensName && (
          <p id="profile-ens-error" className="mt-1 text-[11px] text-destructive">
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
