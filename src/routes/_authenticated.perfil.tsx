// Rota autenticada do perfil do colecionador: exibe e altera dados da conta, avatar e senha.
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import type { ApiError } from "@/api/client";
import { qk } from "@/api/queries";
import type { User } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/Field";
import { AccountNav } from "@/components/AccountNav";
import { ProfileMetadataFields } from "@/components/profile/ProfileMetadataFields";
import { useSession } from "@/lib/session";
import { validateProfileMetadata } from "@/lib/profile-metadata";
import { cn } from "@/lib/utils";

/** Metadados e montagem da rota de edição do perfil do colecionador. */
export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Kurio" },
      { name: "description", content: "Edite seus dados, avatar e senha." },
      { property: "og:title", content: "Meu perfil — Kurio" },
      { property: "og:description", content: "Perfil do colecionador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

/** Converte e redimensiona arquivo de imagem local para avatar em base64 JPEG de 160 px. */
async function toAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Selecione um arquivo de imagem");
  if (file.size > 5_000_000) throw new Error("Imagem maior que 5 MB");
  const bmp = await createImageBitmap(file);
  const c = document.createElement("canvas");
  c.width = c.height = 160;
  const s = Math.min(bmp.width, bmp.height);
  c.getContext("2d")!.drawImage(
    bmp,
    (bmp.width - s) / 2,
    (bmp.height - s) / 2,
    s,
    s,
    0,
    0,
    160,
    160,
  );
  return c.toDataURL("image/jpeg", 0.85);
}

/**
 * Tela de perfil do colecionador estruturada fielmente ao Figma (Print 1):
 * - Sem cartões individuais com bordas pesadas (layout fluido sobre o fundo da página).
 * - Grade de 2 colunas: Nome de exibição, Nome de usuário, E-mail, Nome ENS, Apelido da carteira e Avatar.
 * - Seção Alterar senha na mesma página, com alternância de visibilidade e botão Salvar unificado.
 */
function ProfilePage() {
  const { user, setUser } = useSession();
  const qc = useQueryClient();
  const me = useQuery({ queryKey: qk.me(user!.id), queryFn: api.me });

  // Estado dos dados do perfil
  const [profile, setProfile] = useState<Partial<User>>({});
  // Estado dos campos de senha
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  // Controle de visibilidade de senha
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Mensagens de erro de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (me.data) {
      setProfile({
        displayName: me.data.displayName,
        username: me.data.username,
        email: me.data.email,
        bio: me.data.bio ?? "",
        avatar: me.data.avatar,
        ensName: me.data.ensName ?? "",
        walletNickname: me.data.walletNickname ?? "",
      });
    }
  }, [me.data]);

  /** Mutation para atualizar dados do perfil */
  const saveProfile = useMutation({
    mutationFn: api.updateMe,
    onSuccess: (u) => {
      qc.setQueryData(qk.me(u.id), u);
      setUser(u);
    },
  });

  /** Mutation para alterar a senha do usuário */
  const changePassword = useMutation({
    mutationFn: api.changePassword,
  });

  const isSaving = saveProfile.isPending || changePassword.isPending;

  /** Valida e submete alterações de dados e senha em um único fluxo de salvamento */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    // 1. Validação dos campos do perfil
    if (!profile.displayName || profile.displayName.trim().length < 2) {
      errs.displayName = "Informe seu nome";
    }
    if (!profile.username || !/^[a-z0-9_.]{3,20}$/.test(profile.username)) {
      errs.username = "Use 3–20 letras minúsculas, números, _ ou .";
    }
    if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(profile.email)) {
      errs.email = "Informe um e-mail válido";
    }
    Object.assign(
      errs,
      validateProfileMetadata({
        ensName: profile.ensName ?? "",
        walletNickname: profile.walletNickname ?? "",
      }),
    );

    // 2. Validação dos campos de senha (caso algum tenha sido preenchido)
    const hasPasswordInput =
      passwords.current.length > 0 || passwords.next.length > 0 || passwords.confirm.length > 0;

    if (hasPasswordInput) {
      if (!passwords.current) {
        errs.current = "Informe a senha atual";
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(passwords.next)) {
        errs.next = "Mínimo 8 caracteres com letras e números";
      }
      if (passwords.confirm !== passwords.next) {
        errs.confirm = "As senhas não conferem";
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      // Atualiza o perfil
      await saveProfile.mutateAsync({
        displayName: profile.displayName,
        username: profile.username,
        email: profile.email,
        ensName: profile.ensName,
        walletNickname: profile.walletNickname,
        bio: profile.bio,
        avatar: profile.avatar ?? "",
      });

      // Se informou senha nova, atualiza
      if (hasPasswordInput) {
        await changePassword.mutateAsync({
          current: passwords.current,
          next: passwords.next,
        });
        setPasswords({ current: "", next: "", confirm: "" });
        toast.success("Perfil e senha atualizados com sucesso");
      } else {
        toast.success("Perfil atualizado com sucesso");
      }
      setErrors({});
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.fields) {
        setErrors(apiErr.fields);
      } else {
        setErrors({ form: apiErr.message || "Erro ao salvar alterações" });
      }
      toast.error(apiErr.message || "Não foi possível salvar as alterações");
    }
  };

  return (
    <div className="container-page grid gap-8 py-8 md:grid-cols-[16rem_1fr]">
      <AccountNav />

      <div className="min-w-0">
        <form onSubmit={handleSubmit} noValidate aria-busy={me.isLoading || isSaving}>
          <h1 className="text-xl font-bold font-mono text-foreground mb-6">
            Perfil do colecionador
          </h1>

          <FormError message={errors.form} />

          {me.isLoading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="shimmer h-14 rounded-md" />
              ))}
            </div>
          ) : (
            <>
              {/* Grade de 2 colunas com campos do perfil idênticos ao Figma */}
              <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                <Field
                  label="Nome de exibição *"
                  value={profile.displayName ?? ""}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  error={errors.displayName}
                />
                <Field
                  label="Nome de usuário *"
                  value={profile.username ?? ""}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  error={errors.username}
                />
                <Field
                  label="E-mail *"
                  type="email"
                  value={profile.email ?? ""}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  error={errors.email}
                />

                <ProfileMetadataFields
                  ensName={profile.ensName ?? ""}
                  walletNickname={profile.walletNickname ?? ""}
                  errors={errors}
                  onEnsNameChange={(ensName) => setProfile({ ...profile, ensName })}
                  onWalletNicknameChange={(walletNickname) =>
                    setProfile({ ...profile, walletNickname })
                  }
                />

                {/* Seletor de Avatar alinhado na 2ª coluna da 3ª linha */}
                <div>
                  <p
                    className="mb-1.5 text-xs font-semibold font-mono text-foreground"
                    id="avatar-label"
                  >
                    Avatar
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-[#1c140e] border border-border text-foreground">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Seu avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      )}
                    </span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      aria-labelledby="avatar-label"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                          setProfile({ ...profile, avatar: await toAvatar(f) });
                          setErrors((x) => ({ ...x, avatar: "" }));
                        } catch (err) {
                          setErrors((x) => ({ ...x, avatar: (err as Error).message }));
                        }
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="brand"
                      size="sm"
                      className="h-9 px-4 text-xs font-bold font-mono normal-case"
                      onClick={() => fileRef.current?.click()}
                    >
                      Alterar
                    </Button>
                    <button
                      type="button"
                      disabled={!profile.avatar}
                      onClick={() => setProfile({ ...profile, avatar: undefined })}
                      className="text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                  {errors.avatar && (
                    <p role="alert" className="mt-1 text-[11px] text-destructive">
                      {errors.avatar}
                    </p>
                  )}
                </div>
              </div>

              {/* Seção Alterar senha posicionada diretamente na sequência */}
              <div className="mt-10">
                <h2 className="text-base font-bold font-mono text-foreground mb-4">
                  Alterar senha
                </h2>
                <div className="grid gap-4 max-w-md">
                  <div className="relative">
                    <Field
                      label="Senha atual"
                      type={showCurrent ? "text" : "password"}
                      autoComplete="current-password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      error={errors.current}
                    >
                      <button
                        type="button"
                        aria-label={showCurrent ? "Ocultar senha" : "Ver senha"}
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </Field>
                  </div>

                  <div className="relative">
                    <Field
                      label="Nova senha"
                      type={showNext ? "text" : "password"}
                      autoComplete="new-password"
                      value={passwords.next}
                      onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                      error={errors.next}
                    >
                      <button
                        type="button"
                        aria-label={showNext ? "Ocultar nova senha" : "Ver nova senha"}
                        onClick={() => setShowNext(!showNext)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </Field>
                  </div>

                  <div className="relative">
                    <Field
                      label="Confirmar nova senha"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      error={errors.confirm}
                    >
                      <button
                        type="button"
                        aria-label={
                          showConfirm ? "Ocultar confirmação de senha" : "Ver confirmação de senha"
                        }
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </Field>
                  </div>
                </div>

                {/* Botão de Salvar único do formulário */}
                <Button
                  type="submit"
                  variant="brand"
                  className="mt-6 px-8 py-2 text-sm font-bold font-mono normal-case"
                  disabled={isSaving || me.isLoading}
                >
                  {isSaving ? "Salvando…" : "Salvar"}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
