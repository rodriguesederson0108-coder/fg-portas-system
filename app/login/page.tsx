"use client";

import { useEffect, useState } from "react";
import { salvarLogin, verificarLogin } from "@/app/autenticacao/auth";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const jaLogado = verificarLogin();

    if (jaLogado) {
      window.location.replace("/");
      return;
    }
  }, []);

  function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const usuarioDigitado = usuario.trim();
    const senhaDigitada = senha.trim();

    if (usuarioDigitado === "admin" && senhaDigitada === "124") {
      salvarLogin();

      setTimeout(() => {
        window.location.replace("/");
      }, 150);

      return;
    }

    setErro("Usuário ou senha inválidos.");
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-em-logo-area">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/em-nexus.png?v=4"
              alt="Logo EM Nexus"
              className="login-em-logo"
            />
          </div>

          <div className="login-brand-text">
            <span className="login-brand-label">Sistema desenvolvido por</span>
            <h1>EM Nexus</h1>
            <p>
              Soluções digitais para gestão administrativa, organização de
              processos e controle operacional.
            </p>
          </div>

          <div className="login-brand-features">
            <div>
              <strong>Gestão comercial</strong>
              <span>Clientes, orçamentos e pedidos em um só ambiente.</span>
            </div>

            <div>
              <strong>Controle operacional</strong>
              <span>Produtos, valores, aprovações e geração de documentos.</span>
            </div>

            <div>
              <strong>Sistema personalizado</strong>
              <span>Estrutura desenvolvida para o fluxo da FG Portas.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-access-panel">
        <form className="login-card-profissional" onSubmit={entrar}>
          <div className="login-client-header">
            <span>Sistema administrativo</span>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fg-logo.png?v=4"
              alt="Logo FG Portas"
              className="login-fg-logo"
            />
          </div>

          <div className="login-card-title">
            <h2>Acesso ao sistema</h2>
            <p>Entre com suas credenciais para acessar o painel da FG Portas.</p>
          </div>

          <div className="login-field">
            <label htmlFor="usuario">Usuário</label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Digite seu usuário"
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </div>

          {erro && <span className="login-erro">{erro}</span>}

          <button type="submit" className="login-button">
            Entrar no sistema
          </button>

          <div className="login-footer-dev">
            <span>Desenvolvido por</span>
            <strong>EM Nexus</strong>
          </div>
        </form>
      </section>
    </main>
  );
}