const URL_SCRIPT =
  "https://script.google.com/macros/s/AKfycbxdGQoJJouLOD9WbsPgdfofRjHkuk1hHQ93Yyl-1kCx762LEv1Kct_dN2CnGPollTgq/exec";

function salvarNaPlanilha(dados) {
  fetch(URL_SCRIPT, {
    method: "POST",
    body: JSON.stringify(dados),
  })
    .then((resposta) => resposta.json())
    .then((resultado) => console.log("Salvo na planilha:", resultado))
    .catch((erro) => console.error("Erro ao salvar:", erro));
}
// ---------- REFERÊNCIAS AOS ELEMENTOS DO HTML ----------
const formServico = document.getElementById("formServico");
const linhasExtras = document.getElementById("linhasExtras");
const btnAddLinha = document.getElementById("btnAddLinha");
const resumo = document.getElementById("resumoOrcamento");

// ================================================
// PARTE 1: CRIAR LINHAS DE ITEM EXTRA DINAMICAMENTE
// ================================================
function criarLinhaExtra() {
  const linha = document.createElement("div");
  linha.className = "linha-extra";

  linha.innerHTML = `
    <input type="text" class="nomeExtra" placeholder="Material / serviço extra" />
    <input type="number" class="valorExtra" step="0.01" min="0" placeholder="Valor (R$)" />
    <button type="button" class="remover-linha">Remover</button>
  `;

  // botão de remover essa linha específica
  linha.querySelector(".remover-linha").addEventListener("click", function () {
    linha.remove();
  });

  linhasExtras.appendChild(linha);
}

btnAddLinha.addEventListener("click", criarLinhaExtra);

// cria uma primeira linha vazia já ao carregar a página
criarLinhaExtra();

// Lê todas as linhas extras preenchidas no momento do envio
function coletarItensExtras() {
  const itens = [];
  document.querySelectorAll(".linha-extra").forEach(function (linha) {
    const nome = linha.querySelector(".nomeExtra").value.trim();
    const valor = parseFloat(linha.querySelector(".valorExtra").value);

    // ignora linhas em branco; só entra se tiver nome E valor válido
    if (nome && !isNaN(valor)) {
      itens.push({ nome: nome, valor: valor });
    }
  });
  return itens;
}

// ================================================
// PARTE 2: GERAR O ORÇAMENTO PRINCIPAL
// ================================================
formServico.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nomeCliente = document.getElementById("nomeCliente").value.trim();
  const descricao = document.getElementById("descricaoServico").value.trim();
  const dataBruta = document.getElementById("dataOrcamento").value;
  const metragem = parseFloat(document.getElementById("metragem").value);
  const valorM2 = parseFloat(document.getElementById("valorM2").value);

  if (
    !nomeCliente ||
    !descricao ||
    !dataBruta ||
    isNaN(metragem) ||
    isNaN(valorM2)
  ) {
    alert(
      "Preencha todos os campos do serviço corretamente antes de gerar o orçamento.",
    );
    return;
  }

  const itensExtras = coletarItensExtras();

  const totalServico = metragem * valorM2;
  const totalExtras = itensExtras.reduce(function (soma, item) {
    return soma + item.valor;
  }, 0);
  const totalGeral = totalServico + totalExtras;

  const [ano, mes, dia] = dataBruta.split("-");
  const dataFormatada = `${dia}/${mes}/${ano}`;
  imprimirResumo({
    nomeCliente,
    descricao,
    dataFormatada,
    metragem,
    valorM2,
    totalServico,
    totalExtras,
    totalGeral,
    itensExtras,
  });
});
function imprimirResumo(dados) {
  let htmlExtras = "";
  if (dados.itensExtras.length === 0) {
    htmlExtras = "<p><em>Nenhum item extra adicionado</em></p>";
  } else {
    htmlExtras = "<ul>";
    dados.itensExtras.forEach(function (item) {
      htmlExtras += `<li>${item.nome}: R$ ${item.valor.toFixed(2)}</li>`;
    });
    htmlExtras += "</ul>";
  }

  resumo.innerHTML = `
      <h2>Resumo do Orçamento</h2>
      <p><strong>Cliente:</strong> ${dados.nomeCliente}</p>
      <p><strong>Descrição do serviço:</strong> ${dados.descricao}</p>
      <p><strong>Data:</strong> ${dados.dataFormatada}</p>
      <p><strong>Metragem:</strong> ${dados.metragem} m²</p>
      <p><strong>Valor por m²:</strong> R$ ${dados.valorM2.toFixed(2)}</p>
      <p><strong>Subtotal do serviço:</strong> R$ ${dados.totalServico.toFixed(2)}</p>

      <h3>Materiais / extras cobrados à parte:</h3>
      ${htmlExtras}
      <p><strong>Subtotal dos extras:</strong> R$ ${dados.totalExtras.toFixed(2)}</p>

      <p class="total">Total geral: R$ ${dados.totalGeral.toFixed(2)}</p>
    `;

  resumo.style.display = "block";
  resumo.scrollIntoView({ behavior: "smooth" });

  salvarNaPlanilha({
    cliente: dados.nomeCliente,
    descricao: dados.descricao,
    data: dados.dataFormatada,
    metragem: dados.metragem,
    valorM2: dados.valorM2,
    totalServico: dados.totalServico,
    totalExtras: dados.totalExtras,
    totalGeral: dados.totalGeral,
    extras: JSON.stringify(dados.itensExtras),
  });
}
