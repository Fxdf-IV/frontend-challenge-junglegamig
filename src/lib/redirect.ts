// Validação e sanitização de URLs de redirecionamento pós-login.
// Previne vulnerabilidades de Open Redirect restringindo o destino a rotas relativas válidas.

/** Valida se a URL de redirecionamento é um caminho relativo seguro da mesma origem. */
export function safeRedirect(r: string | undefined) {
  return r &&
    r.startsWith("/") &&
    !r.startsWith("//") &&
    !r.startsWith("/login") &&
    !r.startsWith("/cadastro")
    ? r
    : "/";
}
