import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/api/endpoints";
import { toApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/Field";
import { useSession } from "@/lib/session";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function PasswordToggle({ shown, toggle }: { shown: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle} aria-label={shown ? "Ocultar senha" : "Mostrar senha"} className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground">
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

export function LoginForm({ onDone, expired }: { onDone: () => void; expired?: boolean }) {
  const { signIn } = useSession();
  const [v, setV] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!EMAIL.test(v.email)) errs.email = "Informe um e-mail válido";
    if (!v.password) errs.password = "Informe a senha";
    setErrors(errs);
    setFormErr("");
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await signIn(await api.login(v));
      onDone();
    } catch (err) {
      const a = toApiError(err);
      setErrors(a.fields ?? {});
      setFormErr(a.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {expired && <p role="status" className="rounded-md bg-panel px-3 py-2 text-xs">Sua sessão expirou. Entre novamente para continuar de onde parou.</p>}
      <FormError message={formErr} />
      <Field label="E-mail" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={errors.email} placeholder="seu@email.com" />
      <Field label="Senha" type={show ? "text" : "password"} autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} error={errors.password} className="[&_input]:pr-10">
        <PasswordToggle shown={show} toggle={() => setShow(!show)} />
      </Field>
      <Button variant="brand" className="w-full" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</Button>
    </form>
  );
}

export function RegisterForm({ onDone }: { onDone: () => void }) {
  const { signIn } = useSession();
  const [v, setV] = useState({ displayName: "", username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (v.displayName.trim().length < 2) errs.displayName = "Informe seu nome";
    if (!/^[a-z0-9_.]{3,20}$/.test(v.username)) errs.username = "Use 3–20 letras minúsculas, números, _ ou .";
    if (!EMAIL.test(v.email)) errs.email = "Informe um e-mail válido";
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v.password)) errs.password = "Mínimo 8 caracteres com letras e números";
    if (v.confirm !== v.password) errs.confirm = "As senhas não conferem";
    setErrors(errs);
    setFormErr("");
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const { confirm: _c, ...body } = v;
      await signIn(await api.register(body));
      onDone();
    } catch (err) {
      const a = toApiError(err);
      setErrors(a.fields ?? {});
      setFormErr(a.code === "CONFLICT" ? "Já existe uma conta com estes dados. Entre ou use outros dados." : a.message);
    } finally {
      setBusy(false);
    }
  };
  const bind = (k: keyof typeof v) => ({ value: v[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value }), error: errors[k] });
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormError message={formErr} />
      <Field label="Nome de exibição" autoComplete="name" {...bind("displayName")} />
      <Field label="Nome de usuário" autoComplete="username" {...bind("username")} />
      <Field label="E-mail" type="email" autoComplete="email" {...bind("email")} />
      <Field label="Senha" type={show ? "text" : "password"} autoComplete="new-password" hint="Mínimo 8 caracteres com letras e números" {...bind("password")} className="[&_input]:pr-10">
        <PasswordToggle shown={show} toggle={() => setShow(!show)} />
      </Field>
      <Field label="Confirmar senha" type={show ? "text" : "password"} autoComplete="new-password" {...bind("confirm")} />
      <Button variant="brand" className="w-full" disabled={busy}>{busy ? "Criando…" : "Criar conta"}</Button>
    </form>
  );
}
