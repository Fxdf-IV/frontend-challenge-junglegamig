// Regras compartilhadas dos metadados editáveis do perfil do colecionador.

/** Campos de perfil relacionados ao ENS e à carteira exibidos no Figma. */
export interface ProfileMetadata {
  ensName: string;
  walletNickname: string;
}

/** Retorna mensagens para os metadados obrigatórios do perfil. */
export function validateProfileMetadata(value: Partial<ProfileMetadata>) {
  const errors: Partial<Record<keyof ProfileMetadata, string>> = {};
  const ensName = typeof value.ensName === "string" ? value.ensName.trim() : undefined;
  const walletNickname =
    typeof value.walletNickname === "string" ? value.walletNickname.trim() : undefined;

  if (value.ensName !== undefined && !ensName) errors.ensName = "Informe seu nome ENS";
  if (value.walletNickname !== undefined && !walletNickname)
    errors.walletNickname = "Informe o apelido da carteira";

  return errors;
}
