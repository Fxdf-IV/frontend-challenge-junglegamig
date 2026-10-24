import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import type { ApiError } from "@/api/client";
import { qk } from "@/api/queries";
import type { User } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Field, FormError, inputClass } from "@/components/Field";
import { AccountNav } from "@/components/AccountNav";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

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
  component: Profile,
});

/** Resize the chosen image to a 160px JPEG data URL before upload. */
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

function Profile() {
  const { user, setUser } = useSession();
  const qc = useQueryClient();
  const me = useQuery({ queryKey: qk.me(user!.id), queryFn: api.me });
  const [v, setV] = useState<Partial<User>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (me.data)
      setV({
        displayName: me.data.displayName,
        username: me.data.username,
        email: me.data.email,
        bio: me.data.bio ?? "",
        avatar: me.data.avatar,
      });
  }, [me.data]);

  const save = useMutation({
    mutationFn: api.updateMe,
    onSuccess: (u) => {
      qc.setQueryData(qk.me(u.id), u);
      setUser(u);
      setErrors({});
      toast.success("Perfil atualizado");
    },
    onError: (e: ApiError) => {
      setErrors(e.fields ?? {});
      toast.error(e.message);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v.displayName || v.displayName.trim().length < 2) errs.displayName = "Informe seu nome";
    if (!v.username || !/^[a-z0-9_.]{3,20}$/.test(v.username))
      errs.username = "Use 3–20 letras minúsculas, números, _ ou .";
    if (!v.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))
      errs.email = "Informe um e-mail válido";
    if ((v.bio ?? "").length > 160) errs.bio = "Máximo de 160 caracteres";
    setErrors(errs);
    if (!Object.keys(errs).length) save.mutate({ ...v, avatar: v.avatar ?? "" });
  };

  return (
    <div className="container-page grid gap-8 py-8 md:grid-cols-[14rem_1fr]">
      <AccountNav />
      <div className="space-y-8">
        <form
          onSubmit={submit}
          noValidate
          className="rounded-lg bg-card p-5"
          aria-busy={me.isLoading}
        >
          <h1 className="mb-4 font-bold">Perfil do colecionador</h1>
          {me.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="shimmer h-14 rounded" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome de exibição *"
                value={v.displayName ?? ""}
                onChange={(e) => setV({ ...v, displayName: e.target.value })}
                error={errors.displayName}
              />
              <Field
                label="Nome de usuário *"
                value={v.username ?? ""}
                onChange={(e) => setV({ ...v, username: e.target.value })}
                error={errors.username}
              />
              <Field
                label="E-mail *"
                type="email"
                value={v.email ?? ""}
                onChange={(e) => setV({ ...v, email: e.target.value })}
                error={errors.email}
              />
              <div>
                <label htmlFor="bio" className="mb-1.5 block text-xs font-semibold">
                  Bio
                </label>
                <input
                  id="bio"
                  value={v.bio ?? ""}
                  onChange={(e) => setV({ ...v, bio: e.target.value })}
                  aria-invalid={!!errors.bio}
                  aria-describedby={errors.bio ? "bio-err" : undefined}
                  className={inputClass}
                />
                {errors.bio && (
                  <p id="bio-err" className="mt-1 text-[11px] text-destructive">
                    {errors.bio}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <p className="mb-1.5 text-xs font-semibold" id="avatar-label">
                  Avatar
                </p>
                <div className="flex items-center gap-4">
                  <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-panel text-lg font-bold">
                    {v.avatar ? (
                      <img src={v.avatar} alt="Seu avatar" className="h-full w-full object-cover" />
                    ) : (
                      (v.displayName ?? "?").charAt(0).toUpperCase()
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
                        setV({ ...v, avatar: await toAvatar(f) });
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
                    className="normal-case"
                    onClick={() => fileRef.current?.click()}
                  >
                    Alterar
                  </Button>
                  {v.avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setV({ ...v, avatar: undefined })}
                    >
                      Remover
                    </Button>
                  )}
                </div>
                {errors.avatar && (
                  <p role="alert" className="mt-1 text-[11px] text-destructive">
                    {errors.avatar}
                  </p>
                )}
              </div>
            </div>
          )}
          <Button
            variant="brand"
            className="mt-5 normal-case"
            disabled={save.isPending || me.isLoading}
          >
            {save.isPending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </form>
        <PasswordForm />
      </div>
    </div>
  );
}

function PasswordForm() {
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const m = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      setV({ current: "", next: "", confirm: "" });
      setErrors({});
      toast.success("Senha alterada");
    },
    onError: (e: ApiError) => setErrors(e.fields ?? { form: e.message }),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v.current) errs.current = "Informe a senha atual";
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v.next))
      errs.next = "Mínimo 8 caracteres com letras e números";
    if (v.confirm !== v.next) errs.confirm = "As senhas não conferem";
    setErrors(errs);
    if (!Object.keys(errs).length) m.mutate({ current: v.current, next: v.next });
  };
  return (
    <form onSubmit={submit} noValidate className={cn("rounded-lg bg-card p-5")}>
      <h2 className="mb-4 font-bold">Alterar senha</h2>
      <FormError message={errors.form} />
      <div className="grid gap-4 sm:max-w-md">
        <Field
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          value={v.current}
          onChange={(e) => setV({ ...v, current: e.target.value })}
          error={errors.current}
        />
        <Field
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          value={v.next}
          onChange={(e) => setV({ ...v, next: e.target.value })}
          error={errors.next}
        />
        <Field
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          value={v.confirm}
          onChange={(e) => setV({ ...v, confirm: e.target.value })}
          error={errors.confirm}
        />
      </div>
      <Button variant="brand" className="mt-5 normal-case" disabled={m.isPending}>
        {m.isPending ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
