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

// Classes compartilhadas pelos campos escuros do modal de autenticação conforme o Figma.
const authFieldClass =
  "[&_input]:h-10 [&_input]:rounded-[5px] [&_input]:border-[#3d291d] [&_input]:bg-[#261810] [&_input]:text-xs [&_input]:placeholder:text-[#b5895a] [&_input:focus-visible]:border-primary";

/** Alterna a visibilidade da senha sem mover o foco do formulário. */
function PasswordToggle({ shown, toggle }: { shown: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={shown ? "Ocultar senha" : "Mostrar senha"}
      className="absolute inset-y-0 right-0 grid w-10 cursor-pointer place-items-center text-[#c89258] transition-colors hover:text-primary"
    >
      {shown ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  );
}

/** Ícone oficial em 4 cores do Google exibido no botão de login social. */
function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 max-md:size-3.5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/** Ícone azul do Facebook exibido no botão de login social. */
function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 max-md:size-3.5">
      <path
        fill="#3B5998"
        d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V6.65c0-1.05.29-1.73 1.76-1.73z"
      />
    </svg>
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
    <form
      onSubmit={submit}
      noValidate
      className="space-y-3 [&_label]:sr-only max-md:mt-4 max-md:space-y-2 max-md:[&_input]:h-9"
    >
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
        placeholder="contato@email.com"
        className={authFieldClass}
      />
      <Field
        label="Senha"
        type={show ? "text" : "password"}
        autoComplete="current-password"
        value={v.password}
        onChange={(e) => setV({ ...v, password: e.target.value })}
        error={errors.password}
        placeholder="***********"
        className={`${authFieldClass} [&_input]:pr-10`}
      >
        <PasswordToggle shown={show} toggle={() => setShow(!show)} />
      </Field>
      <div className="-mt-1 flex justify-end pb-2 max-md:pb-1">
        <button
          type="button"
          className="cursor-pointer text-xs text-primary underline-offset-4 hover:underline"
          onClick={() => toast.info("A recuperação de senha ainda não está disponível.")}
        >
          Esqueceu a senha?
        </button>
      </div>
      <Button
        variant="brand"
        className="h-10 w-full rounded-[5px] text-sm font-bold normal-case tracking-normal max-md:h-9"
        disabled={busy}
      >
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
    <form
      onSubmit={submit}
      noValidate
      className="space-y-3 [&_label]:sr-only max-md:mt-4 max-md:space-y-2 max-md:[&_input]:h-9"
    >
      <FormError message={formErr} />
      <Field
        label="Nome de usuário"
        autoComplete="username"
        placeholder="Nome de usuário"
        className={authFieldClass}
        {...bind("username")}
      />
      <Field
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="Digite seu e-mail"
        className={authFieldClass}
        {...bind("email")}
      />
      <Field
        label="Senha"
        type={show ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Senha"
        {...bind("password")}
        className={`${authFieldClass} [&_input]:pr-10`}
      >
        <PasswordToggle shown={show} toggle={() => setShow(!show)} />
      </Field>
      <Field
        label="Confirmar senha"
        type={show ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Confirmar senha"
        className={authFieldClass}
        {...bind("confirm")}
      />
      <Button
        variant="brand"
        className="h-10 w-full rounded-[5px] text-sm font-bold normal-case tracking-normal max-md:h-9"
        disabled={busy}
      >
        {busy ? "Criando…" : "Criar conta"}
      </Button>
      <SocialSignIn />
    </form>
  );
}

/** Mostra provedores do design e informa que as integrações não estão disponíveis. */
function SocialSignIn() {
  return (
    <div className="space-y-3 pt-2 max-md:space-y-2 max-md:pt-1">
      {/* A linha divisória estende até as bordas do modal no desktop, mantendo os botões alinhados aos campos. */}
      <div className="flex items-center gap-3 py-1 text-xs text-foreground/90 sm:-mx-[70px] max-md:text-[10px]">
        <span className="h-px flex-1 bg-[#3a261a]" />
        <span>Ou continue com</span>
        <span className="h-px flex-1 bg-[#3a261a]" />
      </div>
      <div className="grid grid-cols-1 gap-3 max-md:gap-2">
        {(["Google", "Facebook"] as const).map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className="h-10 w-full gap-2.5 rounded-[5px] border-[#3d291d] bg-[#261810] text-xs font-normal text-[#d5ad86] shadow-none hover:border-primary/50 hover:bg-[#2e1d14] hover:text-foreground max-md:h-7 max-md:px-2 max-md:text-xs"
            onClick={() => toast.info(`A entrada com ${provider} ainda não está disponível.`)}
          >
            {provider === "Google" ? <GoogleIcon /> : <FacebookIcon />}
            <span>Continuar com {provider}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
