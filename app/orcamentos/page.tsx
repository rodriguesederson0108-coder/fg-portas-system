"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { verificarLogin } from "@/app/autenticacao/auth";

const FG_LOGO_PATH = "/logo.png.png";
const FG_CNPJ = "56.024.213/0001-08";

type ClienteSalvo = {
  id: number;
  nome: string;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  cpfCnpj?: string;
  cpf?: string;
  cnpj?: string;
  tipo?: string;
};

type ProdutoEstoque = {
  id: number;
  nome: string;
  valorVenda: string;
  dataCadastro?: string;
};

type ItemOrcamento = {
  id: number;
  produtoId?: number;
  descricao: string;
  quantidade: string;
  valorUnitario: string;
};

type OrcamentoSalvo = {
  id: number;
  numeroOrcamento: string;
  clienteId: number;
  cliente: string;
  telefone: string;
  cpfCnpj: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  enderecoCompleto: string;
  validade: string;
  formaPagamento: string;
  parcelasCredito: string;
  frete: string;
  desconto: string;
  observacao: string;
  itens: ItemOrcamento[];
  subtotal: number;
  total: number;
  status: string;
  dataCriacao: string;
};

export default function OrcamentosPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [clientesSalvos, setClientesSalvos] = useState<ClienteSalvo[]>([]);
  const [orcamentosSalvos, setOrcamentosSalvos] = useState<OrcamentoSalvo[]>([]);
  const [produtosEstoque, setProdutosEstoque] = useState<ProdutoEstoque[]>([]);

  const [orcamentoEditandoId, setOrcamentoEditandoId] = useState<number | null>(
    null
  );

  const [filtroOrcamentos, setFiltroOrcamentos] = useState("");

  const [clienteDigitado, setClienteDigitado] = useState("");
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");

  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");

  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");

  const [validade, setValidade] = useState("");
  const [frete, setFrete] = useState("");
  const [desconto, setDesconto] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [parcelasCredito, setParcelasCredito] = useState("");
  const [observacao, setObservacao] = useState("");

  const [itens, setItens] = useState<ItemOrcamento[]>([
    {
      id: Date.now(),
      produtoId: undefined,
      descricao: "",
      quantidade: "1",
      valorUnitario: "",
    },
  ]);

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
      const clientes = localStorage.getItem("fg_clientes");
      const orcamentos = localStorage.getItem("fg_orcamentos");
      const estoque = localStorage.getItem("fg_estoque");

      if (clientes) {
        setClientesSalvos(JSON.parse(clientes));
      } else {
        setClientesSalvos([]);
      }

      if (orcamentos) {
        setOrcamentosSalvos(JSON.parse(orcamentos));
      } else {
        setOrcamentosSalvos([]);
      }

      if (estoque) {
        setProdutosEstoque(JSON.parse(estoque));
      } else {
        setProdutosEstoque([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setClientesSalvos([]);
      setOrcamentosSalvos([]);
      setProdutosEstoque([]);
    }
  }, [autorizado]);

  const clienteSelecionado = useMemo(() => {
    return clientesSalvos.find(
      (cliente) => String(cliente.id) === clienteSelecionadoId
    );
  }, [clientesSalvos, clienteSelecionadoId]);

  const orcamentosFiltrados = useMemo(() => {
    const filtro = filtroOrcamentos.trim().toLowerCase();

    const orcamentosAtivos = orcamentosSalvos.filter(
      (orcamento) => orcamento.status !== "Aprovado"
    );

    if (!filtro) {
      return orcamentosAtivos;
    }

    return orcamentosAtivos.filter((orcamento) => {
      const numeroOrcamento = orcamento.numeroOrcamento?.toLowerCase() || "";
      const cliente = orcamento.cliente?.toLowerCase() || "";
      const telefone = orcamento.telefone?.toLowerCase() || "";
      const cpfCnpj = orcamento.cpfCnpj?.toLowerCase() || "";
      const endereco = orcamento.enderecoCompleto?.toLowerCase() || "";
      const status = orcamento.status?.toLowerCase() || "";
      const forma = orcamento.formaPagamento?.toLowerCase() || "";

      return (
        numeroOrcamento.includes(filtro) ||
        cliente.includes(filtro) ||
        telefone.includes(filtro) ||
        cpfCnpj.includes(filtro) ||
        endereco.includes(filtro) ||
        status.includes(filtro) ||
        forma.includes(filtro)
      );
    });
  }, [orcamentosSalvos, filtroOrcamentos]);

  const subtotal = useMemo(() => {
    return itens.reduce((total, item) => {
      const quantidade = converterNumero(item.quantidade);
      const valorUnitario = converterNumero(item.valorUnitario);

      return total + quantidade * valorUnitario;
    }, 0);
  }, [itens]);

  const total = useMemo(() => {
    const valorFrete = converterNumero(frete);
    const valorDesconto = converterNumero(desconto);

    return Math.max(subtotal + valorFrete - valorDesconto, 0);
  }, [subtotal, frete, desconto]);

  const enderecoCompleto = useMemo(() => {
    return montarEnderecoPorCampos({
      endereco,
      numero,
      bairro,
      cidade,
      cep,
    });
  }, [endereco, numero, bairro, cidade, cep]);

  function converterNumero(valor: string) {
    if (!valor) return 0;

    const valorNormalizado = valor
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

    const numero = Number(valorNormalizado);

    return Number.isNaN(numero) ? 0 : numero;
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function obterCpfCnpjCliente(cliente: ClienteSalvo) {
    return cliente.cpfCnpj || cliente.cpf || cliente.cnpj || "";
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

  function selecionarClientePorNome(nomeDigitado: string) {
    setClienteDigitado(nomeDigitado);

    const clienteEncontrado = clientesSalvos.find(
      (cliente) =>
        cliente.nome.trim().toLowerCase() === nomeDigitado.trim().toLowerCase()
    );

    if (!clienteEncontrado) {
      setClienteSelecionadoId("");
      setTelefone("");
      setCpfCnpj("");
      setEndereco("");
      setNumero("");
      setBairro("");
      setCidade("");
      setCep("");
      return;
    }

    setClienteSelecionadoId(String(clienteEncontrado.id));
    setTelefone(clienteEncontrado.telefone || clienteEncontrado.celular || "");
    setCpfCnpj(obterCpfCnpjCliente(clienteEncontrado));
    setEndereco(clienteEncontrado.endereco || "");
    setNumero(clienteEncontrado.numero || "");
    setBairro(clienteEncontrado.bairro || "");
    setCidade(clienteEncontrado.cidade || "");
    setCep(clienteEncontrado.cep || "");
  }

  function selecionarProdutoNoItem(id: number, produtoId: string) {
    const produtoEncontrado = produtosEstoque.find(
      (produto) => String(produto.id) === produtoId
    );

    const itensAtualizados = itens.map((item) => {
      if (item.id === id) {
        if (!produtoEncontrado) {
          return {
            ...item,
            produtoId: undefined,
            descricao: "",
            valorUnitario: "",
          };
        }

        return {
          ...item,
          produtoId: produtoEncontrado.id,
          descricao: produtoEncontrado.nome,
          valorUnitario: produtoEncontrado.valorVenda,
        };
      }

      return item;
    });

    setItens(itensAtualizados);
  }

  function atualizarItem(
    id: number,
    campo: keyof ItemOrcamento,
    valor: string
  ) {
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
        produtoId: undefined,
        descricao: "",
        quantidade: "1",
        valorUnitario: "",
      },
    ]);
  }

  function removerItem(id: number) {
    if (itens.length === 1) {
      alert("O orçamento precisa ter pelo menos um item.");
      return;
    }

    setItens((itensAtuais) => itensAtuais.filter((item) => item.id !== id));
  }

  function gerarNumeroOrcamento() {
    const contadorAtual = Number(
      localStorage.getItem("fg_contador_orcamentos") || "0"
    );

    const proximoNumero = contadorAtual + 1;
    const anoAtual = String(new Date().getFullYear()).slice(-2);

    localStorage.setItem("fg_contador_orcamentos", String(proximoNumero));

    return `${String(proximoNumero).padStart(5, "0")}/${anoAtual}`;
  }

  function atualizarCadastroCliente() {
    if (!clienteSelecionadoId) return;

    const clientesAtualizados = clientesSalvos.map((cliente) => {
      if (String(cliente.id) === clienteSelecionadoId) {
        return {
          ...cliente,
          nome: clienteDigitado,
          telefone,
          cpfCnpj,
          endereco,
          numero,
          bairro,
          cidade,
          cep,
        };
      }

      return cliente;
    });

    localStorage.setItem("fg_clientes", JSON.stringify(clientesAtualizados));
    setClientesSalvos(clientesAtualizados);
  }

  function limparFormulario() {
    setOrcamentoEditandoId(null);
    setClienteDigitado("");
    setClienteSelecionadoId("");
    setTelefone("");
    setCpfCnpj("");
    setEndereco("");
    setNumero("");
    setBairro("");
    setCidade("");
    setCep("");
    setValidade("");
    setFrete("");
    setDesconto("");
    setFormaPagamento("");
    setParcelasCredito("");
    setObservacao("");
    setItens([
      {
        id: Date.now(),
        produtoId: undefined,
        descricao: "",
        quantidade: "1",
        valorUnitario: "",
      },
    ]);
  }

  function editarOrcamento(orcamento: OrcamentoSalvo) {
    setOrcamentoEditandoId(orcamento.id);

    setClienteDigitado(orcamento.cliente || "");
    setClienteSelecionadoId(String(orcamento.clienteId || ""));
    setTelefone(orcamento.telefone || "");
    setCpfCnpj(orcamento.cpfCnpj || "");
    setEndereco(orcamento.endereco || "");
    setNumero(orcamento.numero || "");
    setBairro(orcamento.bairro || "");
    setCidade(orcamento.cidade || "");
    setCep(orcamento.cep || "");
    setValidade(orcamento.validade || "");
    setFrete(orcamento.frete || "");
    setDesconto(orcamento.desconto || "");
    setFormaPagamento(orcamento.formaPagamento || "");
    setParcelasCredito(orcamento.parcelasCredito || "");
    setObservacao(orcamento.observacao || "");

    setItens(
      orcamento.itens && orcamento.itens.length > 0
        ? orcamento.itens
        : [
            {
              id: Date.now(),
              produtoId: undefined,
              descricao: "",
              quantidade: "1",
              valorUnitario: "",
            },
          ]
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function atualizarPedidoVinculado(orcamentoAtualizado: OrcamentoSalvo) {
    const pedidosSalvos = localStorage.getItem("fg_pedidos");

    if (!pedidosSalvos) return;

    let pedidosAtuais = [];

    try {
      pedidosAtuais = JSON.parse(pedidosSalvos);
    } catch {
      pedidosAtuais = [];
    }

    const pedidosAtualizados = pedidosAtuais.map((pedido: any) => {
      if (pedido.numeroOrcamento === orcamentoAtualizado.numeroOrcamento) {
        return {
          ...pedido,
          clienteId: orcamentoAtualizado.clienteId,
          cliente: orcamentoAtualizado.cliente,
          telefone: orcamentoAtualizado.telefone,
          cpfCnpj: orcamentoAtualizado.cpfCnpj,
          endereco: orcamentoAtualizado.endereco,
          numero: orcamentoAtualizado.numero,
          bairro: orcamentoAtualizado.bairro,
          cidade: orcamentoAtualizado.cidade,
          cep: orcamentoAtualizado.cep,
          enderecoCompleto: orcamentoAtualizado.enderecoCompleto,
          formaPagamento: orcamentoAtualizado.formaPagamento,
          parcelasCredito: orcamentoAtualizado.parcelasCredito,
          itens: orcamentoAtualizado.itens,
          frete: orcamentoAtualizado.frete,
          desconto: orcamentoAtualizado.desconto,
          subtotal: orcamentoAtualizado.subtotal,
          total: orcamentoAtualizado.total,
        };
      }

      return pedido;
    });

    localStorage.setItem("fg_pedidos", JSON.stringify(pedidosAtualizados));
  }

  function salvarOrcamento(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!clienteSelecionadoId || !clienteSelecionado) {
      alert("Selecione um cliente já cadastrado antes de salvar o orçamento.");
      return;
    }

    if (!endereco.trim()) {
      alert("Informe o endereço do cliente.");
      return;
    }

    if (!numero.trim()) {
      alert("Informe o número do endereço.");
      return;
    }

    if (!bairro.trim()) {
      alert("Informe o bairro.");
      return;
    }

    if (!cidade.trim()) {
      alert("Informe a cidade.");
      return;
    }

    if (!cep.trim()) {
      alert("Informe o CEP.");
      return;
    }

    if (!formaPagamento.trim()) {
      alert("Selecione a forma de pagamento.");
      return;
    }

    if (formaPagamento === "Crédito" && !parcelasCredito.trim()) {
      alert("Selecione a quantidade de parcelas do crédito.");
      return;
    }

    const itensValidos = itens.filter(
      (item) =>
        item.descricao.trim() &&
        converterNumero(item.quantidade) > 0 &&
        converterNumero(item.valorUnitario) > 0
    );

    if (itensValidos.length === 0) {
      alert("Adicione pelo menos um item válido ao orçamento.");
      return;
    }

    atualizarCadastroCliente();

    if (orcamentoEditandoId) {
      const orcamentoOriginal = orcamentosSalvos.find(
        (orcamento) => orcamento.id === orcamentoEditandoId
      );

      if (!orcamentoOriginal) {
        alert("Orçamento não encontrado para edição.");
        return;
      }

      const orcamentoAtualizado: OrcamentoSalvo = {
        ...orcamentoOriginal,
        clienteId: Number(clienteSelecionadoId),
        cliente: clienteDigitado,
        telefone,
        cpfCnpj,
        endereco,
        numero,
        bairro,
        cidade,
        cep,
        enderecoCompleto,
        validade,
        frete,
        desconto,
        formaPagamento,
        parcelasCredito: formaPagamento === "Crédito" ? parcelasCredito : "",
        observacao,
        itens: itensValidos,
        subtotal,
        total,
      };

      const orcamentosAtualizados = orcamentosSalvos.map((orcamento) => {
        if (orcamento.id === orcamentoEditandoId) {
          return orcamentoAtualizado;
        }

        return orcamento;
      });

      localStorage.setItem(
        "fg_orcamentos",
        JSON.stringify(orcamentosAtualizados)
      );
      setOrcamentosSalvos(orcamentosAtualizados);

      atualizarPedidoVinculado(orcamentoAtualizado);

      alert(
        `Orçamento ${orcamentoAtualizado.numeroOrcamento} atualizado com sucesso.`
      );

      limparFormulario();
      return;
    }

    const numeroOrcamento = gerarNumeroOrcamento();

    const novoOrcamento: OrcamentoSalvo = {
      id: Date.now(),
      numeroOrcamento,
      clienteId: Number(clienteSelecionadoId),
      cliente: clienteDigitado,
      telefone,
      cpfCnpj,
      endereco,
      numero,
      bairro,
      cidade,
      cep,
      enderecoCompleto,
      validade,
      frete,
      desconto,
      formaPagamento,
      parcelasCredito: formaPagamento === "Crédito" ? parcelasCredito : "",
      observacao,
      itens: itensValidos,
      subtotal,
      total,
      status: "Aguardando aprovação",
      dataCriacao: new Date().toLocaleDateString("pt-BR"),
    };

    const orcamentosAtualizados = [...orcamentosSalvos, novoOrcamento];

    localStorage.setItem("fg_orcamentos", JSON.stringify(orcamentosAtualizados));
    setOrcamentosSalvos(orcamentosAtualizados);

    alert(`Orçamento ${numeroOrcamento} salvo com sucesso.`);

    limparFormulario();
  }

  function aprovarOrcamento(id: number) {
    const orcamentoEncontrado = orcamentosSalvos.find(
      (orcamento) => orcamento.id === id
    );

    if (!orcamentoEncontrado) {
      alert("Orçamento não encontrado.");
      return;
    }

    const confirmar = window.confirm(
      "Deseja aprovar este orçamento e transformá-lo em pedido?"
    );

    if (!confirmar) {
      return;
    }

    const orcamentoAprovado: OrcamentoSalvo = {
      ...orcamentoEncontrado,
      status: "Aprovado",
    };

    const orcamentosAtualizados = orcamentosSalvos.map((orcamento) => {
      if (orcamento.id === id) {
        return orcamentoAprovado;
      }

      return orcamento;
    });

    localStorage.setItem("fg_orcamentos", JSON.stringify(orcamentosAtualizados));
    setOrcamentosSalvos(orcamentosAtualizados);

    const pedidosSalvos = localStorage.getItem("fg_pedidos");
    const pedidosAtuais = pedidosSalvos ? JSON.parse(pedidosSalvos) : [];

    const pedidoJaExiste = pedidosAtuais.some(
      (pedido: any) =>
        pedido.numeroOrcamento === orcamentoAprovado.numeroOrcamento
    );

    if (!pedidoJaExiste) {
      const novoPedido = {
        id: Date.now(),
        numeroPedido: orcamentoAprovado.numeroOrcamento,
        numeroOrcamento: orcamentoAprovado.numeroOrcamento,
        clienteId: orcamentoAprovado.clienteId,
        cliente: orcamentoAprovado.cliente,
        telefone: orcamentoAprovado.telefone,
        cpfCnpj: orcamentoAprovado.cpfCnpj,
        endereco: orcamentoAprovado.endereco,
        numero: orcamentoAprovado.numero,
        bairro: orcamentoAprovado.bairro,
        cidade: orcamentoAprovado.cidade,
        cep: orcamentoAprovado.cep,
        enderecoCompleto: orcamentoAprovado.enderecoCompleto,
        formaPagamento: orcamentoAprovado.formaPagamento,
        parcelasCredito: orcamentoAprovado.parcelasCredito,
        itens: orcamentoAprovado.itens,
        frete: orcamentoAprovado.frete,
        desconto: orcamentoAprovado.desconto,
        subtotal: orcamentoAprovado.subtotal,
        total: orcamentoAprovado.total,
        status: "Em produção",
        dataCriacao: new Date().toLocaleDateString("pt-BR"),
      };

      localStorage.setItem(
        "fg_pedidos",
        JSON.stringify([...pedidosAtuais, novoPedido])
      );
    }

    alert("Orçamento aprovado e movido para pedidos com sucesso.");

    window.location.href = "/pedidos";
  }

  function cancelarOrcamento(id: number) {
    const orcamentosAtualizados = orcamentosSalvos.map((orcamento) => {
      if (orcamento.id === id) {
        return {
          ...orcamento,
          status: "Cancelado",
        };
      }

      return orcamento;
    });

    localStorage.setItem("fg_orcamentos", JSON.stringify(orcamentosAtualizados));
    setOrcamentosSalvos(orcamentosAtualizados);
  }

  function gerarHtmlOrcamento(orcamento: OrcamentoSalvo) {
    const logoSrc = `${window.location.origin}${FG_LOGO_PATH}`;

    const linhasItens = orcamento.itens
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

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Orçamento ${orcamento.numeroOrcamento}</title>

          <style>
            * { box-sizing: border-box; }

            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              background: #ffffff;
            }

            .orcamento-pdf {
              max-width: 900px;
              margin: 0 auto;
            }

            .topo {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #111827;
              padding-bottom: 18px;
              margin-bottom: 24px;
              gap: 24px;
            }

            .empresa {
              display: flex;
              align-items: center;
              gap: 16px;
            }

            .empresa-logo {
              width: 95px;
              height: auto;
              object-fit: contain;
            }

            .empresa-dados h1 {
              margin: 0;
              font-size: 28px;
            }

            .empresa-dados p {
              margin: 4px 0;
              color: #374151;
              font-size: 13px;
            }

            .numero {
              text-align: right;
              min-width: 220px;
            }

            .numero h2 {
              margin: 0;
              font-size: 22px;
            }

            .numero p {
              margin: 6px 0;
              font-size: 14px;
            }

            .bloco {
              margin-bottom: 22px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 14px;
            }

            .bloco h3 {
              margin: 0 0 10px;
              font-size: 16px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
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

            .observacao {
              white-space: pre-wrap;
              font-size: 14px;
            }

            .rodape {
              margin-top: 40px;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }

            @media print {
              body { padding: 0; }
              .orcamento-pdf { max-width: none; }
            }
          </style>
        </head>

        <body>
          <main class="orcamento-pdf">
            <section class="topo">
              <div class="empresa">
                <img
                  src="${logoSrc}"
                  alt="Logo FG Portas"
                  class="empresa-logo"
                />

                <div class="empresa-dados">
                  <h1>FG Portas</h1>
                  <p>Portas, ferragens e materiais de construção</p>
                  <p>CNPJ: ${FG_CNPJ}</p>
                </div>
              </div>

              <div class="numero">
                <h2>Orçamento</h2>
                <p><strong>Nº:</strong> ${orcamento.numeroOrcamento}</p>
                <p><strong>Data:</strong> ${orcamento.dataCriacao}</p>
                <p><strong>Status:</strong> ${orcamento.status}</p>
              </div>
            </section>

            <section class="bloco">
              <h3>Dados do cliente</h3>

              <div class="grid">
                <div><strong>Cliente:</strong> ${orcamento.cliente}</div>
                <div><strong>Telefone:</strong> ${orcamento.telefone || "-"}</div>
                <div><strong>CPF/CNPJ:</strong> ${orcamento.cpfCnpj || "-"}</div>
                <div><strong>Validade:</strong> ${orcamento.validade || "-"}</div>
                <div><strong>Pagamento:</strong> ${orcamento.formaPagamento || "-"}</div>
                <div><strong>Parcelas:</strong> ${
                  orcamento.formaPagamento === "Crédito"
                    ? orcamento.parcelasCredito || "-"
                    : "-"
                }</div>
                <div style="grid-column: 1 / -1;"><strong>Endereço:</strong> ${
                  orcamento.enderecoCompleto || "-"
                }</div>
              </div>
            </section>

            <section class="bloco">
              <h3>Itens do orçamento</h3>

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
                  <span>Subtotal</span>
                  <strong>${formatarMoeda(orcamento.subtotal || 0)}</strong>
                </div>

                <div>
                  <span>Frete</span>
                  <strong>${formatarMoeda(converterNumero(orcamento.frete))}</strong>
                </div>

                <div>
                  <span>Desconto</span>
                  <strong>${formatarMoeda(converterNumero(orcamento.desconto))}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>${formatarMoeda(orcamento.total || 0)}</strong>
                </div>
              </div>
            </section>

            ${
              orcamento.observacao
                ? `
              <section class="bloco">
                <h3>Observações</h3>
                <p class="observacao">${orcamento.observacao}</p>
              </section>
            `
                : ""
            }

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
    `;
  }

  function imprimirOrcamento(orcamento: OrcamentoSalvo) {
    const janela = window.open("", "_blank", "width=900,height=700");

    if (!janela) {
      alert("O navegador bloqueou a janela de impressão.");
      return;
    }

    janela.document.open();
    janela.document.write(gerarHtmlOrcamento(orcamento));
    janela.document.close();
  }

  function gerarPdfOrcamento(orcamento: OrcamentoSalvo) {
    imprimirOrcamento(orcamento);
  }

  if (carregando) {
    return null;
  }

  if (!autorizado) {
    return null;
  }

  if (clientesSalvos.length === 0) {
    return (
      <main className="orcamentos-container">
        <div className="aviso-sem-cliente">
          <h1>Nenhum cliente cadastrado</h1>
          <p>
            Para criar um orçamento, primeiro cadastre o cliente no sistema.
          </p>

          <Link href="/clientes" className="botao-primario">
            Cadastrar cliente
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="orcamentos-container">
      <header className="pagina-header">
        <div>
          <h1>Orçamentos</h1>
          <p>Crie orçamentos usando clientes e produtos cadastrados.</p>
        </div>

        <Link href="/" className="botao-secundario">
          Voltar ao dashboard
        </Link>
      </header>

      <section className="form-card">
        <h2>{orcamentoEditandoId ? "Editar orçamento" : "Novo orçamento"}</h2>

        <form onSubmit={salvarOrcamento} className="form-orcamento">
          <div className="form-grid">
            <div className="campo">
              <label htmlFor="cliente">Cliente cadastrado</label>
              <input
                id="cliente"
                type="text"
                list="lista-clientes"
                value={clienteDigitado}
                onChange={(e) => selecionarClientePorNome(e.target.value)}
                placeholder="Digite ou selecione o nome do cliente"
                required
              />

              <datalist id="lista-clientes">
                {clientesSalvos.map((cliente) => (
                  <option key={cliente.id} value={cliente.nome} />
                ))}
              </datalist>
            </div>

            <div className="campo">
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Telefone do cliente"
              />
            </div>

            <div className="campo">
              <label htmlFor="cpfCnpj">CPF/CNPJ</label>
              <input
                id="cpfCnpj"
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="CPF ou CNPJ"
              />
            </div>

            <div className="campo">
              <label htmlFor="validade">Validade do orçamento</label>
              <input
                id="validade"
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="campo">
              <label htmlFor="endereco">Endereço</label>
              <input
                id="endereco"
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, avenida, travessa..."
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="numero">Número</label>
              <input
                id="numero"
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Nº"
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="bairro">Bairro</label>
              <input
                id="bairro"
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Digite o bairro"
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="cidade">Cidade</label>
              <input
                id="cidade"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Digite a cidade"
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="cep">CEP</label>
              <input
                id="cep"
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                required
              />
            </div>
          </div>

          <div className="campo">
            <label>Endereço completo do orçamento</label>
            <input
              type="text"
              value={enderecoCompleto}
              readOnly
              placeholder="O endereço completo será montado automaticamente"
            />
            <small>
              Se você alterar os campos de endereço neste orçamento e salvar, o
              cadastro do cliente também será atualizado automaticamente.
            </small>
          </div>

          <div className="itens-header">
            <h3>Itens do orçamento</h3>

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
                    <label>Produto do estoque</label>
                    <select
                      value={item.produtoId ? String(item.produtoId) : ""}
                      onChange={(e) =>
                        selecionarProdutoNoItem(item.id, e.target.value)
                      }
                    >
                      <option value="">Selecione um produto</option>

                      {produtosEstoque.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="campo item-descricao">
                    <label>Descrição do item {index + 1}</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) =>
                        atualizarItem(item.id, "descricao", e.target.value)
                      }
                      placeholder="Ex: Porta de madeira, fechadura, instalação..."
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
                      placeholder="1"
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
                      placeholder="0,00"
                    />
                  </div>

                  <div className="campo">
                    <label>Total</label>
                    <input
                      type="text"
                      value={formatarMoeda(totalItem)}
                      readOnly
                    />
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

          <div className="form-grid">
            <div className="campo">
              <label htmlFor="frete">Frete</label>
              <input
                id="frete"
                type="text"
                value={frete}
                onChange={(e) => setFrete(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="campo">
              <label htmlFor="desconto">Desconto</label>
              <input
                id="desconto"
                type="text"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="campo">
              <label htmlFor="formaPagamento">Forma de pagamento</label>
              <select
                id="formaPagamento"
                value={formaPagamento}
                onChange={(e) => {
                  const valor = e.target.value;
                  setFormaPagamento(valor);

                  if (valor !== "Crédito") {
                    setParcelasCredito("");
                  }
                }}
                required
              >
                <option value="">Selecione</option>
                <option value="Crédito">Crédito</option>
                <option value="Débito">Débito</option>
                <option value="Pix">Pix</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>

            {formaPagamento === "Crédito" && (
              <div className="campo">
                <label htmlFor="parcelasCredito">Parcelas</label>
                <select
                  id="parcelasCredito"
                  value={parcelasCredito}
                  onChange={(e) => setParcelasCredito(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="1x">1x</option>
                  <option value="2x">2x</option>
                  <option value="3x">3x</option>
                  <option value="4x">4x</option>
                  <option value="5x">5x</option>
                  <option value="6x">6x</option>
                  <option value="7x">7x</option>
                  <option value="8x">8x</option>
                  <option value="9x">9x</option>
                  <option value="10x">10x</option>
                </select>
              </div>
            )}
          </div>

          <div className="campo">
            <label htmlFor="observacao">Observações</label>
            <textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Observações adicionais do orçamento"
              rows={4}
            />
          </div>

          <div className="resumo-orcamento">
            <div>
              <span>Subtotal</span>
              <strong>{formatarMoeda(subtotal)}</strong>
            </div>

            <div>
              <span>Frete</span>
              <strong>{formatarMoeda(converterNumero(frete))}</strong>
            </div>

            <div>
              <span>Desconto</span>
              <strong>{formatarMoeda(converterNumero(desconto))}</strong>
            </div>

            <div className="total-final">
              <span>Total</span>
              <strong>{formatarMoeda(total)}</strong>
            </div>
          </div>

          <div className="acoes-form">
            <button type="button" onClick={limparFormulario}>
              {orcamentoEditandoId ? "Cancelar edição" : "Limpar"}
            </button>

            <button type="submit" className="botao-primario">
              {orcamentoEditandoId ? "Salvar alterações" : "Salvar orçamento"}
            </button>
          </div>
        </form>
      </section>

      <section className="lista-card">
        <div className="lista-header">
          <div>
            <h2>Orçamentos ativos</h2>
            <p>{orcamentosFiltrados.length} registro(s) encontrado(s)</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="campo">
            <label htmlFor="filtroOrcamentos">Filtrar orçamentos</label>
            <input
              id="filtroOrcamentos"
              type="text"
              value={filtroOrcamentos}
              onChange={(e) => setFiltroOrcamentos(e.target.value)}
              placeholder="Busque por cliente, número, telefone, CPF/CNPJ, endereço ou status"
            />
          </div>

          <div className="campo">
            <label>&nbsp;</label>
            <button
              type="button"
              className="botao-secundario"
              onClick={() => setFiltroOrcamentos("")}
            >
              Limpar filtro
            </button>
          </div>
        </div>

        {orcamentosFiltrados.length === 0 ? (
          <p className="lista-vazia">Nenhum orçamento ativo encontrado.</p>
        ) : (
          <div className="tabela-orcamentos">
            <div className="linha-orcamento cabecalho">
              <span>Número</span>
              <span>Cliente</span>
              <span>Status</span>
              <span>Total</span>
              <span>Ações</span>
            </div>

            {[...orcamentosFiltrados].reverse().map((orcamento) => (
              <div className="linha-orcamento" key={orcamento.id}>
                <span>{orcamento.numeroOrcamento || "-"}</span>
                <span>{orcamento.cliente}</span>
                <span>{orcamento.status}</span>
                <span>{formatarMoeda(orcamento.total)}</span>

                <div className="acoes-linha">
                  <button
                    type="button"
                    onClick={() => editarOrcamento(orcamento)}
                  >
                    Editar
                  </button>

                  {orcamento.status !== "Aprovado" && (
                    <button
                      type="button"
                      onClick={() => aprovarOrcamento(orcamento.id)}
                    >
                      Aprovar
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => imprimirOrcamento(orcamento)}
                  >
                    Imprimir
                  </button>

                  <button
                    type="button"
                    onClick={() => gerarPdfOrcamento(orcamento)}
                  >
                    Gerar PDF
                  </button>

                  {orcamento.status !== "Cancelado" && (
                    <button
                      type="button"
                      onClick={() => cancelarOrcamento(orcamento.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}