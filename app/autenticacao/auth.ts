export function salvarLogin() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("fg_logado", "true");
}

export function verificarLogin() {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem("fg_logado") === "true";
}

export function sairLogin() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("fg_logado");
}