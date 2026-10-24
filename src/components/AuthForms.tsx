// Formulários de autenticação: validam campos e chamam as operações da API.
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import { toApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/Field";
import { useSession } from "@/lib/session";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Alterna a visibilidade da senha sem mover o foco do formulário. */
function PasswordToggle({ shown, toggle }: { shown: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={shown ? "Ocultar senha" : "Mostrar senha"}
      className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground"
    >
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

/** Valida credenciais e abre a sessão retornada pela API. */
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
    <form onSubmit={submit} noValidate className="space-y-3 [&_label]:sr-only">
      {expired && (
        <p role="status" className="rounded-md bg-panel px-3 py-2 text-xs">
          Sua sessão expirou. Entre novamente para continuar de onde parou.
        </p>
      )}
      <FormError message={formErr} />
      <Field
        label="E-mail"
        type="email"
        autoComplete="email"
        value={v.email}
        onChange={(e) => setV({ ...v, email: e.target.value })}
        error={errors.email}
        placeholder="seu@email.com"
      />
      <Field
        label="Senha"
        type={show ? "text" : "password"}
        autoComplete="current-password"
        value={v.password}
        onChange={(e) => setV({ ...v, password: e.target.value })}
        error={errors.password}
        placeholder="Senha"
        className="[&_input]:pr-10"
      >
        <PasswordToggle shown={show} toggle={() => setShow(!show)} />
      </Field>
      <div className="-mt-2 flex justify-end">
        <button
          type="button"
          className="text-xs text-primary underline-offset-4 hover:underline"
          onClick={() => toast.info("A recuperação de senha ainda não está disponível.")}
        >
          Esqueceu a senha?
        </button>
      </div>
      <Button variant="brand" className="w-full" disabled={busy}>
        {busy ? "Entrando…" : "Entrar"}
      </Button>
      <SocialSignIn />
    </form>
  );
}

/** Valida dados de cadastro e inicia sessão após resposta bem-sucedida. */
export function RegisterForm({ onDone }: { onDone: () => void }) {
  const { signIn } = useSession();
  const [v, setV] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^[a-z0-9_.]{3,20}$/.test(v.username))
      errs.username = "Use 3–20 letras minúsculas, números, _ ou .";
    if (!EMAIL.test(v.email)) errs.email = "Informe um e-mail válido";
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v.password))
      errs.password = "Mínimo 8 caracteres com letras e números";
    if (v.confirm !== v.password) errs.confirm = "As senhas não conferem";
    setErrors(errs);
    setFormErr("");
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const { confirm: _confirm, ...credentials } = v;
      const body = { ...credentials, displayName: v.username };
      await signIn(await api.register(body));
      onDone();
    } catch (err) {
      const a = toApiError(err);
      setErrors(a.fields ?? {});
      setFormErr(
        a.code === "CONFLICT"
          ? "Já existe uma conta com estes dados. Entre ou use outros dados."
          : a.message,
      );
    } finally {
      setBusy(false);
    }
  };
  const bind = (k: keyof typeof v) => ({
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value }),
    error: errors[k],
  });
  return (
    <form onSubmit={submit} noValidate className="space-y-3 [&_label]:sr-only">
      <FormError message={formErr} />
      <Field
        label="Nome de usuário"
        autoComplete="username"
        placeholder="Nome de usuário"
        {...bind("username")}
      />
      <Field
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="Digite seu e-mail"
        {...bind("email")}
      />
      <Field
        label="Senha"
        type={show ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Senha"
        {...bind("password")}
        className="[&_input]:pr-10"
      >
        <PasswordToggle shown={show} toggle={() => setShow(!show)} />
      </Field>
      <Field
        label="Confirmar senha"
        type={show ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Confirmar senha"
        {...bind("confirm")}
      />
      <Button variant="brand" className="w-full" disabled={busy}>
        {busy ? "Criando…" : "Criar conta"}
      </Button>
      <SocialSignIn />
    </form>
  );
}

/** Mostra provedores do design e informa que as integrações não estão disponíveis. */
function SocialSignIn() {
  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>ou continue com</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {(["Google", "Facebook"] as const).map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="line"
            onClick={() => toast.info(`A entrada com ${provider} ainda não está disponível.`)}
          >
            <span aria-hidden className="font-bold">
              {provider === "Google" ? "G" : "f"}
            </span>
            {provider}
          </Button>
        ))}
      </div>
    </div>
  );
}
