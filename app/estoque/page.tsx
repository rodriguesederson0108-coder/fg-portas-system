"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { verificarLogin } from "@/app/autenticacao/auth";

type ProdutoEstoque = {
  id: number;
  nome: string;
  valorVenda: string;
  dataCadastro: string;
};

export default function EstoquePage() {
  const [autorizado, setAutorizado] = useState(false);

  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [produtoEditandoId, setProdutoEditandoId] = useState<number | null>(
    null
  );

  const [nome, setNome] = useState("");
  const [valorVenda, setValorVenda] = useState("");
  const [busca, setBusca] = useState("");

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
      const produtosSalvos = localStorage.getItem("fg_estoque");

      if (produtosSalvos) {
        setProdutos(JSON.parse(produtosSalvos));
      } else {
        setProdutos([]);
      }
    } catch {
      setProdutos([]);
    }
  }, [autorizado]);

  const produtosFiltrados = useMemo(() => {
    const filtro = busca.trim().toLowerCase();

    if (!filtro) {
      return produtos;
    }

    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(filtro)
    );
  }, [produtos, busca]);

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

  function limparFormulario() {
    setProdutoEditandoId(null);
    setNome("");
    setValorVenda("");
  }

  function salvarProduto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Informe o nome do produto.");
      return;
    }

    if (converterNumero(valorVenda) <= 0) {
      alert("Informe um valor de venda válido.");
      return;
    }

    if (produtoEditandoId) {
      const produtosAtualizados = produtos.map((produto) => {
        if (produto.id === produtoEditandoId) {
          return {
            ...produto,
            nome: nome.trim(),
            valorVenda: valorVenda.trim(),
          };
        }

        return produto;
      });

      localStorage.setItem("fg_estoque", JSON.stringify(produtosAtualizados));
      setProdutos(produtosAtualizados);

      alert("Produto atualizado com sucesso.");
      limparFormulario();
      return;
    }

    const produtoJaExiste = produtos.some(
      (produto) =>
        produto.nome.trim().toLowerCase() === nome.trim().toLowerCase()
    );

    if (produtoJaExiste) {
      alert("Já existe um produto cadastrado com esse nome.");
      return;
    }

    const novoProduto: ProdutoEstoque = {
      id: Date.now(),
      nome: nome.trim(),
      valorVenda: valorVenda.trim(),
      dataCadastro: new Date().toLocaleDateString("pt-BR"),
    };

    const produtosAtualizados = [...produtos, novoProduto];

    localStorage.setItem("fg_estoque", JSON.stringify(produtosAtualizados));
    setProdutos(produtosAtualizados);

    alert("Produto salvo com sucesso.");
    limparFormulario();
  }

  function editarProduto(produto: ProdutoEstoque) {
    setProdutoEditandoId(produto.id);
    setNome(produto.nome);
    setValorVenda(produto.valorVenda);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function excluirProduto(id: number) {
    const confirmar = window.confirm("Deseja realmente excluir este produto?");

    if (!confirmar) return;

    const produtosAtualizados = produtos.filter((produto) => produto.id !== id);

    localStorage.setItem("fg_estoque", JSON.stringify(produtosAtualizados));
    setProdutos(produtosAtualizados);
  }

  if (!autorizado) {
    return null;
  }

  return (
    <main className="estoque-container">
      <header className="pagina-header">
        <div>
          <h1>Estoque</h1>
          <p>Cadastro de produtos de venda da FG Portas.</p>
        </div>

        <Link href="/" className="botao-secundario">
          Voltar ao dashboard
        </Link>
      </header>

      <section className="form-card">
        <h2>{produtoEditandoId ? "Editar produto" : "Novo produto"}</h2>

        <form className="form-estoque" onSubmit={salvarProduto}>
          <div className="form-grid">
            <div className="campo">
              <label htmlFor="nome">Nome do produto</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Porta de madeira, fechadura, dobradiça..."
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="valorVenda">Valor de venda</label>
              <input
                id="valorVenda"
                type="text"
                value={valorVenda}
                onChange={(e) => setValorVenda(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="acoes-form">
            <button type="button" onClick={limparFormulario}>
              {produtoEditandoId ? "Cancelar edição" : "Limpar"}
            </button>

            <button type="submit" className="botao-primario">
              {produtoEditandoId ? "Salvar alterações" : "Salvar produto"}
            </button>
          </div>
        </form>
      </section>

      <section className="lista-card">
        <div className="lista-header">
          <div>
            <h2>Produtos cadastrados</h2>
            <p>{produtosFiltrados.length} produto(s) encontrado(s)</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="campo">
            <label htmlFor="busca">Buscar produto</label>
            <input
              id="busca"
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome do produto"
            />
          </div>

          <div className="campo">
            <label>&nbsp;</label>
            <button
              type="button"
              className="botao-secundario"
              onClick={() => setBusca("")}
            >
              Limpar filtro
            </button>
          </div>
        </div>

        {produtosFiltrados.length === 0 ? (
          <p className="lista-vazia">Nenhum produto cadastrado.</p>
        ) : (
          <div className="tabela-estoque">
            <div className="linha-estoque cabecalho">
              <span>Produto</span>
              <span>Valor de venda</span>
              <span>Data</span>
              <span>Ações</span>
            </div>

            {[...produtosFiltrados].reverse().map((produto) => (
              <div className="linha-estoque" key={produto.id}>
                <span>{produto.nome}</span>
                <span>{formatarMoeda(converterNumero(produto.valorVenda))}</span>
                <span>{produto.dataCadastro}</span>

                <div className="acoes-linha">
                  <button type="button" onClick={() => editarProduto(produto)}>
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => excluirProduto(produto.id)}
                  >
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