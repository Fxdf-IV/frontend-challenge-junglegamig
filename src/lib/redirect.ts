/** Only same-origin relative paths are accepted as post-login destinations. */
export function safeRedirect(r: string | undefined) {
  return r && r.startsWith("/") && !r.startsWith("//") && !r.startsWith("/login") && !r.startsWith("/cadastro") ? r : "/";
}
