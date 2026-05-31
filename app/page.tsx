"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { verificarLogin, sairLogin } from "@/app/autenticacao/auth";

type OrcamentoSalvo = {
  id: number;
  numeroOrcamento?: string;
  cliente: string;
  telefone?: string;
  endereco?: string;
  enderecoCompleto?: string;
  validade?: string;
  frete?: string;
  desconto?: string;
  observacao?: string;
  status?: string;
  total?: number;
  dataCriacao?: string;
};

type PedidoSalvo = {
  id: number;
  numeroPedido?: string;
  numeroOrcamento?: string;
  cliente?: string;
  total?: number;
  status?: string;
  dataCriacao?: string;
};

export default function DashboardPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [orcamentosSalvos, setOrcamentosSalvos] = useState<OrcamentoSalvo[]>(
    []
  );
  const [pedidosSalvos, setPedidosSalvos] = useState<PedidoSalvo[]>([]);

  useEffect(() => {
    const logado = verificarLogin();

    if (!logado) {
      window.location.replace("/login");
      return;
    }

    setAutorizado(true);
  }, []);

  useEffect(() => {
    if (!autorizado) return;

    try {
      const orcamentos = localStorage.getItem("fg_orcamentos");
      const pedidos = localStorage.getItem("fg_pedidos");

      if (orcamentos) {
        setOrcamentosSalvos(JSON.parse(orcamentos));
      } else {
        setOrcamentosSalvos([]);
      }

      if (pedidos) {
        setPedidosSalvos(JSON.parse(pedidos));
      } else {
        setPedidosSalvos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      setOrcamentosSalvos([]);
      setPedidosSalvos([]);
    }
  }, [autorizado]);

  function sairDoSistema() {
    sairLogin();
    window.location.href = "/login";
  }

  function formatarMoeda(valor?: number) {
    if (!valor) {
      return "R$ 0,00";
    }

    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const orcamentosAtivos = orcamentosSalvos.filter(
  (orcamento) =>
    orcamento.status !== "Aprovado" &&
    orcamento.status !== "Cancelado" &&
    orcamento.status !== "Recusado" &&
    orcamento.status !== "Reprovado"
);

const pedidosAtivos = pedidosSalvos.filter(
  (pedido) =>
    pedido.status !== "Finalizado" &&
    pedido.status !== "Cancelado"
);

const totalOrcamentos = orcamentosAtivos.length;

const aguardandoAprovacao = orcamentosAtivos.filter(
  (orcamento) =>
    orcamento.status === "Aguardando aprovação" ||
    orcamento.status === "Aguardando Aprovação" ||
    orcamento.status === "Pendente"
).length;

const recusados = orcamentosSalvos.filter(
  (orcamento) =>
    orcamento.status === "Recusado" ||
    orcamento.status === "Reprovado" ||
    orcamento.status === "Cancelado"
).length;

const totalPedidos = pedidosSalvos.length;

const totalPedidosAtivos = pedidosAtivos.length;

const pedidosFinalizados = pedidosSalvos.filter(
  (pedido) => pedido.status === "Finalizado"
).length;

const pedidosCancelados = pedidosSalvos.filter(
  (pedido) => pedido.status === "Cancelado"
).length;

const valorTotalOrcamentos = orcamentosAtivos.reduce((total, orcamento) => {
  return total + (Number(orcamento.total) || 0);
}, 0);

const valorTotalPedidosAtivos = pedidosAtivos.reduce((total, pedido) => {
  return total + (Number(pedido.total) || 0);
}, 0);

const ultimosOrcamentos = [...orcamentosAtivos].reverse().slice(0, 5);
const ultimosPedidos = [...pedidosSalvos].reverse().slice(0, 5);

  if (carregando) {
    return null;
  }

  if (!autorizado) {
    return null;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <strong>FG Portas</strong>
          <span>Sistema administrativo</span>
        </div>

        <nav className="sidebar-menu">
          <Link href="/" className="sidebar-link">
            Dashboard
          </Link>

          <Link href="/clientes" className="sidebar-link">
            Clientes
          </Link>

          <Link href="/orcamentos" className="sidebar-link">
            Orçamentos
          </Link>

          <Link href="/pedidos" className="sidebar-link">
            Pedidos
          </Link>

          <Link href="/estoque" className="sidebar-link">
            Estoque
          </Link>
        </nav>
      </aside>

      <main className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Resumo geral do sistema FG Portas</p>
          </div>

          <button type="button" onClick={sairDoSistema} className="botao-sair">
            Sair
          </button>
        </header>

        <section className="cards-dashboard">
          <div className="card-dashboard">
            <span>Orçamentos ativos</span>
            <strong>{totalOrcamentos}</strong>
          </div>

          <div className="card-dashboard">
            <span>Aguardando aprovação</span>
            <strong>{aguardandoAprovacao}</strong>
          </div>

          <div className="card-dashboard">
            <span>Recusados / cancelados</span>
            <strong>{recusados}</strong>
          </div>

          <div className="card-dashboard">
            <span>Pedidos gerados</span>
            <strong>{totalPedidos}</strong>
          </div>

          <div className="card-dashboard">
            <span>Pedidos ativos</span>
            <strong>{totalPedidosAtivos}</strong>
          </div>

          <div className="card-dashboard">
            <span>Pedidos finalizados</span>
            <strong>{pedidosFinalizados}</strong>
          </div>

          <div className="card-dashboard">
            <span>Pedidos cancelados</span>
            <strong>{pedidosCancelados}</strong>
          </div>

          <div className="card-dashboard">
            <span>Valor em orçamentos ativos</span>
            <strong>{formatarMoeda(valorTotalOrcamentos)}</strong>
          </div>

          <div className="card-dashboard">
            <span>Valor em pedidos ativos</span>
            <strong>{formatarMoeda(valorTotalPedidosAtivos)}</strong>
          </div>
        </section>

        <section className="dashboard-listas">
          <div className="dashboard-lista-card">
            <div className="lista-header">
              <h2>Últimos orçamentos ativos</h2>
              <Link href="/orcamentos">Ver todos</Link>
            </div>

            {ultimosOrcamentos.length === 0 ? (
              <p className="lista-vazia">Nenhum orçamento ativo no momento.</p>
            ) : (
              <div className="tabela-resumo">
                <div className="linha-resumo cabecalho">
                  <span>Número</span>
                  <span>Cliente</span>
                  <span>Status</span>
                  <span>Total</span>
                </div>

                {ultimosOrcamentos.map((orcamento) => (
                  <div className="linha-resumo" key={orcamento.id}>
                    <span>{orcamento.numeroOrcamento || "-"}</span>
                    <span>{orcamento.cliente || "-"}</span>
                    <span>{orcamento.status || "Sem status"}</span>
                    <span>{formatarMoeda(orcamento.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-lista-card">
            <div className="lista-header">
              <h2>Últimos pedidos</h2>
              <Link href="/pedidos">Ver todos</Link>
            </div>

            {ultimosPedidos.length === 0 ? (
              <p className="lista-vazia">Nenhum pedido gerado ainda.</p>
            ) : (
              <div className="tabela-resumo">
                <div className="linha-resumo cabecalho">
                  <span>Pedido</span>
                  <span>Cliente</span>
                  <span>Status</span>
                  <span>Total</span>
                </div>

                {ultimosPedidos.map((pedido) => (
                  <div className="linha-resumo" key={pedido.id}>
                    <span>
                      {pedido.numeroPedido || pedido.numeroOrcamento || "-"}
                    </span>
                    <span>{pedido.cliente || "-"}</span>
                    <span>{pedido.status || "Gerado"}</span>
                    <span>{formatarMoeda(pedido.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}