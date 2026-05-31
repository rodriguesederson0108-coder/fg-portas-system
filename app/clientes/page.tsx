"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { verificarLogin } from "@/app/autenticacao/auth";

type ClienteSalvo = {
  id: number;
  nome: string;
  tipo: string;
  cpfCnpj: string;
  rg: string;
  email: string;
  telefone: string;
  celular: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  dataCadastro: string;
};

export default function ClientesPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [clientesSalvos, setClientesSalvos] = useState<ClienteSalvo[]>([]);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Pessoa física");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [rg, setRg] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [celular, setCelular] = useState("");

  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");

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

    const clientes = localStorage.getItem("fg_clientes");

    if (clientes) {
      try {
        setClientesSalvos(JSON.parse(clientes));
      } catch {
        setClientesSalvos([]);
      }
    }
  }, [autorizado]);

  function montarEnderecoCompleto(cliente: ClienteSalvo) {
    const partes = [];

    if (cliente.endereco) {
      partes.push(cliente.endereco);
    }

    if (cliente.numero) {
      partes.push(`Nº ${cliente.numero}`);
    }

    if (cliente.bairro) {
      partes.push(cliente.bairro);
    }

    if (cliente.cidade) {
      partes.push(cliente.cidade);
    }

    if (cliente.cep) {
      partes.push(`CEP ${cliente.cep}`);
    }

    return partes.length > 0 ? partes.join(" - ") : "-";
  }

  function limparFormulario() {
    setNome("");
    setTipo("Pessoa física");
    setCpfCnpj("");
    setRg("");
    setEmail("");
    setTelefone("");
    setCelular("");
    setEndereco("");
    setNumero("");
    setBairro("");
    setCidade("");
    setCep("");
  }

  function salvarCliente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Informe o nome do cliente.");
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

    const clienteJaExiste = clientesSalvos.some(
      (cliente) =>
        cliente.nome.trim().toLowerCase() === nome.trim().toLowerCase()
    );

    if (clienteJaExiste) {
      alert("Já existe um cliente cadastrado com esse nome.");
      return;
    }

    const novoCliente: ClienteSalvo = {
      id: Date.now(),
      nome: nome.trim(),
      tipo,
      cpfCnpj: cpfCnpj.trim(),
      rg: rg.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      celular: celular.trim(),
      endereco: endereco.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      cep: cep.trim(),
      dataCadastro: new Date().toLocaleDateString("pt-BR"),
    };

    const clientesAtualizados = [...clientesSalvos, novoCliente];

    localStorage.setItem("fg_clientes", JSON.stringify(clientesAtualizados));
    setClientesSalvos(clientesAtualizados);

    alert("Cliente salvo com sucesso.");

    limparFormulario();
  }

  function excluirCliente(id: number) {
    const confirmar = window.confirm("Deseja realmente excluir este cliente?");

    if (!confirmar) return;

    const clientesAtualizados = clientesSalvos.filter(
      (cliente) => cliente.id !== id
    );

    localStorage.setItem("fg_clientes", JSON.stringify(clientesAtualizados));
    setClientesSalvos(clientesAtualizados);
  }

  if (carregando) {
    return (
      <main className="clientes-container">
        <p>Carregando...</p>
      </main>
    );
  }

  if (!autorizado) {
    return null;
  }

  return (
    <main className="clientes-container">
      <header className="pagina-header">
        <div>
          <h1>Clientes</h1>
          <p>Cadastre os clientes antes de criar orçamentos.</p>
        </div>

        <Link href="/" className="botao-secundario">
          Voltar ao dashboard
        </Link>
      </header>

      <section className="form-card">
        <h2>Novo cliente</h2>

        <form className="form-cliente" onSubmit={salvarCliente}>
          <div className="form-grid">
            <div className="campo">
              <label htmlFor="nome">Nome do cliente</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome do cliente"
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="tipo">Tipo</label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="Pessoa física">Pessoa física</option>
                <option value="Pessoa jurídica">Pessoa jurídica</option>
              </select>
            </div>

            <div className="campo">
              <label htmlFor="cpfCnpj">CPF/CNPJ</label>
              <input
                id="cpfCnpj"
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="Digite o CPF ou CNPJ"
              />
            </div>

            <div className="campo">
              <label htmlFor="rg">RG</label>
              <input
                id="rg"
                type="text"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="Digite o RG"
              />
            </div>

            <div className="campo">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o e-mail"
              />
            </div>

            <div className="campo">
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Digite o telefone"
              />
            </div>

            <div className="campo">
              <label htmlFor="celular">Celular</label>
              <input
                id="celular"
                type="text"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="Digite o celular"
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

          <div className="acoes-form">
            <button type="button" onClick={limparFormulario}>
              Limpar
            </button>

            <button type="submit" className="botao-primario">
              Salvar cliente
            </button>
          </div>
        </form>
      </section>

      <section className="lista-card">
        <h2>Clientes cadastrados</h2>

        {clientesSalvos.length === 0 ? (
          <p>Nenhum cliente cadastrado ainda.</p>
        ) : (
          <div className="tabela-clientes">
            <div className="linha-cliente cabecalho">
              <span>Nome</span>
              <span>Telefone</span>
              <span>CPF/CNPJ</span>
              <span>Endereço</span>
              <span>Ações</span>
            </div>

            {[...clientesSalvos].reverse().map((cliente) => (
              <div className="linha-cliente" key={cliente.id}>
                <span>{cliente.nome}</span>
                <span>{cliente.telefone || cliente.celular || "-"}</span>
                <span>{cliente.cpfCnpj || "-"}</span>
                <span>{montarEnderecoCompleto(cliente)}</span>

                <div className="acoes-linha">
                  <button
                    type="button"
                    onClick={() => excluirCliente(cliente.id)}
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