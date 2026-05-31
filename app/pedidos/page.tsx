"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { verificarLogin } from "@/app/autenticacao/auth";

type ItemPedido = {
  id: number;
  descricao: string;
  quantidade: string;
  valorUnitario: string;
};

type PedidoSalvo = {
  id: number;
  numeroPedido?: string;
  numeroOrcamento?: string;
  cliente?: string;
  telefone?: string;
  cpfCnpj?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  enderecoCompleto?: string;
  itens?: ItemPedido[];
  produtoServico?: string;
  valor?: number;
  frete?: string;
  desconto?: string;
  subtotal?: number;
  total?: number;
  status?: string;
  prazo?: string;
  dataCriacao?: string;
};

export default function PedidosPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [pedidosSalvos, setPedidosSalvos] = useState<PedidoSalvo[]>([]);
  const [pedidoEditandoId, setPedidoEditandoId] = useState<number | null>(null);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const [numeroPedido, setNumeroPedido] = useState("");
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");
  const [status, setStatus] = useState("Em produção");
  const [prazo, setPrazo] = useState("");
  const [observacao, setObservacao] = useState("");

  const [itens, setItens] = useState<ItemPedido[]>([
    {
      id: Date.now(),
      descricao: "",
      quantidade: "1",
      valorUnitario: "",
    },
  ]);

  useEffect(() => {
    const logado = verificarLogin();

    if (!logado) {
      window.location.href = "/login";
      return;
    }

    setAutorizado(true);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (!autorizado) return;

    const pedidos = localStorage.getItem("fg_pedidos");

    if (pedidos) {
      try {
        setPedidosSalvos(JSON.parse(pedidos));
      } catch {
        setPedidosSalvos([]);
      }
    }
  }, [autorizado]);

  const subtotal = useMemo(() => {
    return itens.reduce((total, item) => {
      const quantidade = converterNumero(item.quantidade);
      const valorUnitario = converterNumero(item.valorUnitario);

      return total + quantidade * valorUnitario;
    }, 0);
  }, [itens]);

  const enderecoCompleto = useMemo(() => {
    return montarEnderecoPorCampos({
      endereco,
      numero,
      bairro,
      cidade,
      cep,
    });
  }, [endereco, numero, bairro, cidade, cep]);

  const totalPedidos = pedidosSalvos.length;

  const pedidosEmProducao = pedidosSalvos.filter(
    (pedido) => pedido.status === "Em produção"
  ).length;

  const pedidosAguardandoEntrega = pedidosSalvos.filter(
    (pedido) => pedido.status === "Aguardando entrega"
  ).length;

  const pedidosFinalizados = pedidosSalvos.filter(
    (pedido) => pedido.status === "Finalizado"
  ).length;

  const pedidosFiltrados = pedidosSalvos.filter((pedido) => {
    const textoBusca = busca.trim().toLowerCase();

    const correspondeBusca =
      !textoBusca ||
      pedido.cliente?.toLowerCase().includes(textoBusca) ||
      pedido.numeroPedido?.toLowerCase().includes(textoBusca) ||
      pedido.numeroOrcamento?.toLowerCase().includes(textoBusca) ||
      pedido.produtoServico?.toLowerCase().includes(textoBusca);

    const correspondeStatus =
      filtroStatus === "Todos" || pedido.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  function converterNumero(valor: string | number | undefined) {
    if (!valor) return 0;

    if (typeof valor === "number") {
      return valor;
    }

    const valorNormalizado = valor
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

    const numeroConvertido = Number(valorNormalizado);

    return Number.isNaN(numeroConvertido) ? 0 : numeroConvertido;
  }

  function formatarMoeda(valor?: number) {
    return (valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function montarEnderecoPorCampos(dados: {
    endereco?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    cep?: string;
  }) {
    const partes = [];

    if (dados.endereco) partes.push(dados.endereco);
    if (dados.numero) partes.push(`Nº ${dados.numero}`);
    if (dados.bairro) partes.push(dados.bairro);
    if (dados.cidade) partes.push(dados.cidade);
    if (dados.cep) partes.push(`CEP ${dados.cep}`);

    return partes.join(" - ");
  }

  function atualizarItem(id: number, campo: keyof ItemPedido, valor: string) {
    const itensAtualizados = itens.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [campo]: valor,
        };
      }

      return item;
    });

    setItens(itensAtualizados);
  }

  function adicionarItem() {
    setItens((itensAtuais) => [
      ...itensAtuais,
      {
        id: Date.now(),
        descricao: "",
        quantidade: "1",
        valorUnitario: "",
      },
    ]);
  }

  function removerItem(id: number) {
    if (itens.length === 1) {
      alert("O pedido precisa ter pelo menos um item.");
      return;
    }

    setItens((itensAtuais) => itensAtuais.filter((item) => item.id !== id));
  }

  function limparFormulario() {
    setPedidoEditandoId(null);
    setNumeroPedido("");
    setCliente("");
    setTelefone("");
    setCpfCnpj("");
    setEndereco("");
    setNumero("");
    setBairro("");
    setCidade("");
    setCep("");
    setStatus("Em produção");
    setPrazo("");
    setObservacao("");
    setItens([
      {
        id: Date.now(),
        descricao: "",
        quantidade: "1",
        valorUnitario: "",
      },
    ]);
  }

  function editarPedido(pedido: PedidoSalvo) {
    setPedidoEditandoId(pedido.id);

    setNumeroPedido(pedido.numeroPedido || pedido.numeroOrcamento || "");
    setCliente(pedido.cliente || "");
    setTelefone(pedido.telefone || "");
    setCpfCnpj(pedido.cpfCnpj || "");
    setEndereco(pedido.endereco || "");
    setNumero(pedido.numero || "");
    setBairro(pedido.bairro || "");
    setCidade(pedido.cidade || "");
    setCep(pedido.cep || "");
    setStatus(pedido.status || "Em produção");
    setPrazo(pedido.prazo || "");

    if (pedido.itens && pedido.itens.length > 0) {
      setItens(pedido.itens);
    } else {
      setItens([
        {
          id: Date.now(),
          descricao: pedido.produtoServico || "",
          quantidade: "1",
          valorUnitario: String(pedido.valor || pedido.total || ""),
        },
      ]);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function salvarPedido(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!cliente.trim()) {
      alert("Informe o cliente do pedido.");
      return;
    }

    const itensValidos = itens.filter(
      (item) =>
        item.descricao.trim() &&
        converterNumero(item.quantidade) > 0 &&
        converterNumero(item.valorUnitario) > 0
    );

    if (itensValidos.length === 0) {
      alert("Adicione pelo menos um item válido ao pedido.");
      return;
    }

    if (pedidoEditandoId) {
      const pedidoOriginal = pedidosSalvos.find(
        (pedido) => pedido.id === pedidoEditandoId
      );

      if (!pedidoOriginal) {
        alert("Pedido não encontrado para edição.");
        return;
      }

      const pedidoAtualizado: PedidoSalvo = {
        ...pedidoOriginal,
        numeroPedido,
        cliente,
        telefone,
        cpfCnpj,
        endereco,
        numero,
        bairro,
        cidade,
        cep,
        enderecoCompleto,
        itens: itensValidos,
        produtoServico: itensValidos.map((item) => item.descricao).join(", "),
        subtotal,
        total: subtotal,
        status,
        prazo,
      };

      const pedidosAtualizados = pedidosSalvos.map((pedido) => {
        if (pedido.id === pedidoEditandoId) {
          return pedidoAtualizado;
        }

        return pedido;
      });

      localStorage.setItem("fg_pedidos", JSON.stringify(pedidosAtualizados));
      setPedidosSalvos(pedidosAtualizados);

      alert("Pedido atualizado com sucesso.");

      limparFormulario();
      return;
    }

    const novoPedido: PedidoSalvo = {
      id: Date.now(),
      numeroPedido: numeroPedido || `PED-${Date.now()}`,
      cliente,
      telefone,
      cpfCnpj,
      endereco,
      numero,
      bairro,
      cidade,
      cep,
      enderecoCompleto,
      itens: itensValidos,
      produtoServico: itensValidos.map((item) => item.descricao).join(", "),
      subtotal,
      total: subtotal,
      status,
      prazo,
      dataCriacao: new Date().toLocaleDateString("pt-BR"),
    };

    const pedidosAtualizados = [...pedidosSalvos, novoPedido];

    localStorage.setItem("fg_pedidos", JSON.stringify(pedidosAtualizados));
    setPedidosSalvos(pedidosAtualizados);

    alert("Pedido salvo com sucesso.");

    limparFormulario();
  }

  function atualizarStatusPedido(id: number, novoStatus: string) {
    const pedidosAtualizados = pedidosSalvos.map((pedido) => {
      if (pedido.id === id) {
        return {
          ...pedido,
          status: novoStatus,
        };
      }

      return pedido;
    });

    localStorage.setItem("fg_pedidos", JSON.stringify(pedidosAtualizados));
    setPedidosSalvos(pedidosAtualizados);
  }

  function excluirPedido(id: number) {
    const confirmar = window.confirm("Deseja realmente excluir este pedido?");

    if (!confirmar) return;

    const pedidosAtualizados = pedidosSalvos.filter(
      (pedido) => pedido.id !== id
    );

    localStorage.setItem("fg_pedidos", JSON.stringify(pedidosAtualizados));
    setPedidosSalvos(pedidosAtualizados);
  }

  function imprimirPedido(pedido: PedidoSalvo) {
    const janela = window.open("", "_blank", "width=900,height=700");

    if (!janela) {
      alert("O navegador bloqueou a janela de impressão.");
      return;
    }

    const itensPedido =
      pedido.itens && pedido.itens.length > 0
        ? pedido.itens
        : [
            {
              id: Date.now(),
              descricao: pedido.produtoServico || "Produto/Serviço",
              quantidade: "1",
              valorUnitario: String(pedido.total || 0),
            },
          ];

    const linhasItens = itensPedido
      .map((item) => {
        const quantidade = converterNumero(item.quantidade);
        const valorUnitario = converterNumero(item.valorUnitario);
        const totalItem = quantidade * valorUnitario;

        return `
          <tr>
            <td>${item.descricao}</td>
            <td>${item.quantidade}</td>
            <td>${formatarMoeda(valorUnitario)}</td>
            <td>${formatarMoeda(totalItem)}</td>
          </tr>
        `;
      })
      .join("");

    janela.document.open();
    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Pedido ${pedido.numeroPedido || pedido.numeroOrcamento || ""}</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              background: #ffffff;
            }

            .pedido-pdf {
              max-width: 900px;
              margin: 0 auto;
            }

            .topo {
              display: flex;
              justify-content: space-between;
              border-bottom: 3px solid #111827;
              padding-bottom: 18px;
              margin-bottom: 24px;
            }

            h1, h2, h3 {
              margin-top: 0;
            }

            .bloco {
              margin-bottom: 22px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 14px;
            }

            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 20px;
              font-size: 14px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 14px;
            }

            th {
              background: #111827;
              color: #ffffff;
              text-align: left;
              padding: 10px;
            }

            td {
              border: 1px solid #d1d5db;
              padding: 10px;
            }

            .resumo {
              margin-left: auto;
              width: 320px;
              margin-top: 18px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              overflow: hidden;
            }

            .resumo div {
              display: flex;
              justify-content: space-between;
              padding: 10px 14px;
              border-bottom: 1px solid #e5e7eb;
            }

            .resumo div:last-child {
              border-bottom: none;
              background: #f3f4f6;
              font-weight: 700;
              font-size: 18px;
            }

            .rodape {
              margin-top: 40px;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>

        <body>
          <main class="pedido-pdf">
            <section class="topo">
              <div>
                <h1>FG Portas</h1>
                <p>Pedido de produção / entrega</p>
              </div>

              <div>
                <h2>Pedido</h2>
                <p><strong>Nº:</strong> ${pedido.numeroPedido || pedido.numeroOrcamento || "-"}</p>
                <p><strong>Data:</strong> ${pedido.dataCriacao || "-"}</p>
                <p><strong>Status:</strong> ${pedido.status || "-"}</p>
              </div>
            </section>

            <section class="bloco">
              <h3>Dados do cliente</h3>

              <div class="grid">
                <div><strong>Cliente:</strong> ${pedido.cliente || "-"}</div>
                <div><strong>Telefone:</strong> ${pedido.telefone || "-"}</div>
                <div><strong>CPF/CNPJ:</strong> ${pedido.cpfCnpj || "-"}</div>
                <div><strong>Prazo:</strong> ${pedido.prazo || "-"}</div>
                <div style="grid-column: 1 / -1;"><strong>Endereço:</strong> ${
                  pedido.enderecoCompleto || "-"
                }</div>
              </div>
            </section>

            <section class="bloco">
              <h3>Itens do pedido</h3>

              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Qtd.</th>
                    <th>Valor unitário</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  ${linhasItens}
                </tbody>
              </table>

              <div class="resumo">
                <div>
                  <span>Total</span>
                  <strong>${formatarMoeda(pedido.total || 0)}</strong>
                </div>
              </div>
            </section>

            <footer class="rodape">
              Documento gerado pelo sistema FG Portas.
            </footer>
          </main>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    janela.document.close();
  }

  if (carregando) {
    return (
      <main className="pedidos-container">
        <p>Carregando...</p>
      </main>
    );
  }

  if (!autorizado) {
    return null;
  }

  return (
    <main className="pedidos-container">
      <header className="pagina-header">
        <div>
          <h1>Pedidos</h1>
          <p>Gestão operacional dos pedidos gerados e cadastrados.</p>
        </div>

        <Link href="/" className="botao-secundario">
          Voltar ao dashboard
        </Link>
      </header>

      <section className="cards-dashboard">
        <div className="card-dashboard">
          <span>Total de pedidos</span>
          <strong>{totalPedidos}</strong>
        </div>

        <div className="card-dashboard">
          <span>Em produção</span>
          <strong>{pedidosEmProducao}</strong>
        </div>

        <div className="card-dashboard">
          <span>Aguardando entrega</span>
          <strong>{pedidosAguardandoEntrega}</strong>
        </div>

        <div className="card-dashboard">
          <span>Finalizados</span>
          <strong>{pedidosFinalizados}</strong>
        </div>
      </section>

      <section className="form-card">
        <h2>{pedidoEditandoId ? "Editar pedido" : "Novo pedido"}</h2>

        <form className="form-pedido" onSubmit={salvarPedido}>
          <div className="form-grid">
            <div className="campo">
              <label>Número do pedido</label>
              <input
                type="text"
                value={numeroPedido}
                onChange={(e) => setNumeroPedido(e.target.value)}
                placeholder="Ex: 0000001/2026"
              />
            </div>

            <div className="campo">
              <label>Cliente</label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div className="campo">
              <label>Telefone</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Telefone"
              />
            </div>

            <div className="campo">
              <label>CPF/CNPJ</label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="CPF ou CNPJ"
              />
            </div>

            <div className="campo">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Em produção">Em produção</option>
                <option value="Aguardando entrega">Aguardando entrega</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="campo">
              <label>Prazo</label>
              <input
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="campo">
              <label>Endereço</label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, avenida, travessa..."
              />
            </div>

            <div className="campo">
              <label>Número</label>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Nº"
              />
            </div>

            <div className="campo">
              <label>Bairro</label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Bairro"
              />
            </div>

            <div className="campo">
              <label>Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Cidade"
              />
            </div>

            <div className="campo">
              <label>CEP</label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="campo">
            <label>Endereço completo</label>
            <input type="text" value={enderecoCompleto} readOnly />
          </div>

          <div className="itens-header">
            <h3>Itens do pedido</h3>

            <button type="button" onClick={adicionarItem}>
              + Adicionar item
            </button>
          </div>

          <div className="itens-lista">
            {itens.map((item, index) => {
              const quantidade = converterNumero(item.quantidade);
              const valorUnitario = converterNumero(item.valorUnitario);
              const totalItem = quantidade * valorUnitario;

              return (
                <div className="item-orcamento" key={item.id}>
                  <div className="campo">
                    <label>Descrição do item {index + 1}</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) =>
                        atualizarItem(item.id, "descricao", e.target.value)
                      }
                      placeholder="Produto ou serviço"
                    />
                  </div>

                  <div className="campo">
                    <label>Quantidade</label>
                    <input
                      type="text"
                      value={item.quantidade}
                      onChange={(e) =>
                        atualizarItem(item.id, "quantidade", e.target.value)
                      }
                    />
                  </div>

                  <div className="campo">
                    <label>Valor unitário</label>
                    <input
                      type="text"
                      value={item.valorUnitario}
                      onChange={(e) =>
                        atualizarItem(item.id, "valorUnitario", e.target.value)
                      }
                    />
                  </div>

                  <div className="campo">
                    <label>Total</label>
                    <input type="text" value={formatarMoeda(totalItem)} readOnly />
                  </div>

                  <button
                    type="button"
                    className="botao-remover"
                    onClick={() => removerItem(item.id)}
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>

          <div className="resumo-orcamento">
            <div className="total-final">
              <span>Total do pedido</span>
              <strong>{formatarMoeda(subtotal)}</strong>
            </div>
          </div>

          <div className="acoes-form">
            <button type="button" onClick={limparFormulario}>
              {pedidoEditandoId ? "Cancelar edição" : "Limpar"}
            </button>

            <button type="submit" className="botao-primario">
              {pedidoEditandoId ? "Salvar alterações" : "Salvar pedido"}
            </button>
          </div>
        </form>
      </section>

      <section className="lista-card">
        <div className="lista-header">
          <div>
            <h2>Lista de pedidos</h2>
            <p>{pedidosFiltrados.length} registro(s) exibido(s)</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="campo">
            <label>Buscar</label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Cliente, produto, valor, status..."
            />
          </div>

          <div className="campo">
            <label>Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Em produção">Em produção</option>
              <option value="Aguardando entrega">Aguardando entrega</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="campo">
            <label>&nbsp;</label>
            <button
              type="button"
              className="botao-secundario"
              onClick={() => {
                setBusca("");
                setFiltroStatus("Todos");
              }}
            >
              Limpar filtros
            </button>
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <p className="lista-vazia">Nenhum pedido encontrado.</p>
        ) : (
          <div className="tabela-pedidos">
            <div className="linha-pedido cabecalho">
              <span>Nº</span>
              <span>Cliente</span>
              <span>Status</span>
              <span>Total</span>
              <span>Ações</span>
            </div>

            {[...pedidosFiltrados].reverse().map((pedido) => (
              <div className="linha-pedido" key={pedido.id}>
                <span>{pedido.numeroPedido || pedido.numeroOrcamento || "-"}</span>
                <span>{pedido.cliente || "-"}</span>

                <span>
                  <select
                    value={pedido.status || "Em produção"}
                    onChange={(e) =>
                      atualizarStatusPedido(pedido.id, e.target.value)
                    }
                  >
                    <option value="Em produção">Em produção</option>
                    <option value="Aguardando entrega">Aguardando entrega</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </span>

                <span>{formatarMoeda(pedido.total || pedido.valor || 0)}</span>

                <div className="acoes-linha">
                  <button type="button" onClick={() => editarPedido(pedido)}>
                    Editar
                  </button>

                  <button type="button" onClick={() => imprimirPedido(pedido)}>
                    Imprimir
                  </button>

                  <button type="button" onClick={() => imprimirPedido(pedido)}>
                    Gerar PDF
                  </button>

                  <button type="button" onClick={() => excluirPedido(pedido.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}