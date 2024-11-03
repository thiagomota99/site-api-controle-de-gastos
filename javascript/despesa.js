isAuthenticate();
//const urlDestino = "http://ec2-3-21-19-165.us-east-2.compute.amazonaws.com:8080/";
const urlDestino = "http://localhost:8080/"

const categoriaSelect = document.getElementById("categoria");
const categoriaDespesaSelect = document.getElementById("categoriaDespesa");
const categoriDespesaSelectEditar = document.getElementById("categoriaEdita");
const arraySelectsCategorias = new Array(categoriaSelect,categoriaDespesaSelect,categoriDespesaSelectEditar);

const formaPagamentoSelect = document.getElementById("forma_pagamento");
const formaPagamentoDespesaSelect = document.getElementById("forma_pagamentoDespesa");
const formaPagamentoEditarSelect = document.getElementById("forma_pagamentoEdita");
const arraySelectsFormaDePagamento = new Array(formaPagamentoSelect,formaPagamentoDespesaSelect,formaPagamentoEditarSelect);

var dataInicioDespesa = document.getElementById("dataInicioDespesa");
var dataFimDespesa = document.getElementById("dataFimDespesa");

var despesasTable = document.getElementById("despesasTable").getElementsByTagName('tbody')[0];



$(document).ready(function() {
  isAuthenticate();
  $("#btn-enviar").click(function() {
	  var objetoJSON = getCamposFormulario();
    enviarObjetoJSON("POST", objetoJSON, urlDestino + "despesas", function (resposta) {
      // Callback de sucesso
      alert(resposta);
      console.log("Requisição bem-sucedida. Resposta do servidor:", resposta);
    }, function (erro) {
      alert(erro);
      // Callback de erro
      console.error("Ocorreu um erro na requisição:", erro);
    });
  });
  
  $("#btnConsultar").click(carregarDespesas);
  $("#btn-enviarEdita").click(editarDespesa)
	
  aplicarFormatacaoMoeda();
  carregarCategorias();
  carregarFormasPagamento();
});

function formatarMoedaEnvio(valor) {
    // Remove todos os caracteres não numéricos
    var numero = valor.replace(/[^\d,]/g, '');

    // Converte a vírgula para ponto e remove o cifrão
    numero = numero.replace(',', '.').replace('R$', '').trim();

    return numero;
}

function formatarDataEnvio(data) {
    data = data.replace('T', ' ');
    return data;
}

function formatarMoeda(valor) {
    // Remove todos os caracteres não numéricos
    var numero = valor.replace(/\D/g, '');

    // Formata o número como moeda com ponto como separador de milhares
    return (Number(numero) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para aplicar formatação de moeda ao campo de entrada
function aplicarFormatacaoMoeda() {
    var inputValor = document.getElementById('valor');
    var inputEditarValor = document.getElementById("valorEdita");
    var arrayInputs = new Array(inputValor,inputEditarValor);
    
    arrayInputs.forEach(function(element) {
      element.addEventListener('input',function() {
        // Obtém o valor atual do campo
        var valorAtual = element.value;

        // Formata o valor como moeda
        var valorFormatado = formatarMoeda(valorAtual);

        // Define o valor formatado de volta no campo
        element.value = valorFormatado;
      });
    });
}

function getCamposFormulario() {
	var dataCadastro = document.getElementById("data_cadastro").value;
	dataCadastro = formatarDataEnvio(dataCadastro);

  var dataVencimento = null;
  if(document.getElementById("data_vencimento").value != "" && 
  document.getElementById("data_vencimento").value != null && 
  document.getElementById("data_vencimento").value != undefined) {
    dataVencimento = document.getElementById("data_vencimento").value;
    dataVencimento = formatarDataEnvio(dataVencimento);
  }

  
  var valor = document.getElementById("valor").value;
	valor = formatarMoedaEnvio(valor);
  var descricao = document.getElementById("descricao").value;
  var categoria = document.getElementById("categoria").value;
  var formaPagamento = document.getElementById("forma_pagamento").value;
  var radios = document.getElementsByName("tipoDespesa");

  var fixa = false;

  for(var i = 0; i < radios.length; i++)
    if(radios[i].checked)
        fixa = radios[i].value;
	
	var formDataJSON = {
      "dataCadastro": dataCadastro,
      "valor": valor,
      "descricao": descricao,
      "categoriaId": categoria,
      "formaPagamentoId": formaPagamento,
      "fixa": fixa,
      "dataVencimento": dataVencimento
    };
	
	return formDataJSON;
}

function enviarObjetoJSON(typeRequest,objetoJSON, urlDestino, sucessoCallback, erroCallback) {
    // Configuração da requisição AJAX
    $.ajax({
        type: typeRequest,
        url: urlDestino,
        contentType: "application/json",
        data: JSON.stringify(objetoJSON),
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },        
        success: function (resposta) {
            // Chamada ao callback de sucesso
            if (sucessoCallback && typeof sucessoCallback === "function") {
                sucessoCallback(resposta);
            }
        },
        error: function (xhr, status, error) {
            // Chamada ao callback de erro
            if (erroCallback && typeof erroCallback === "function") {
                erroCallback(xhr.responseText);
            }
        }
    });
}

  // Função para carregar categorias via AJAX
  function carregarCategorias() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", urlDestino + "categorias", true);
    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var categorias = JSON.parse(xhr.responseText);

        var todasOption = document.createElement("option");
        todasOption.text = "Todas";
        todasOption.value = "0";
        categoriaDespesaSelect.appendChild(todasOption);

        categorias.forEach(function(categoria) {
          arraySelectsCategorias.forEach(function(element) {
            var option = document.createElement("option");
            option.text = categoria.descricao;
            option.value = categoria.id;
            element.appendChild(option);
          });
        });
      }
    };
    xhr.send();
  }

  // Função para carregar formas de pagamento via AJAX
  function carregarFormasPagamento() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", urlDestino + "formaDePagamento", true);
    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var formasPagamento = JSON.parse(xhr.responseText);

        // Criar opção "Todas"
        var todasOption = document.createElement("option");
        todasOption.text = "Todas";
        todasOption.value = "0";
        formaPagamentoDespesaSelect.appendChild(todasOption);

        formasPagamento.forEach(function(formaPagamento) {
          arraySelectsFormaDePagamento.forEach(function(element){
            var option = document.createElement("option");
            option.text = formaPagamento.descricao;
            option.value = formaPagamento.id;
            element.appendChild(option);
          });
        });
      }
    };
    xhr.send();
  }

// Função para carregar despesas via AJAX
function carregarDespesas() {
	var dataInicio = dataInicioDespesa.value + ' 00:00';
	var dataFim = dataFimDespesa.value + ' 23:59';
  
  var dataInicioFormatada = formatarDataEnvio(dataInicio);
  var dataFimFormatada = formatarDataEnvio(dataFim);
  var categoriaId = document.getElementById("categoriaDespesa").value;
  var formaPagamentoId = document.getElementById("forma_pagamentoDespesa").value;
  var tipoDespesa = document.getElementById("tipoDespesaSelect").value;

  var objecto = {
      "periodoInicio": dataInicioFormatada,
      "periodoFim": dataFimFormatada,
      "categoriaId": Number(categoriaId),
      "formaPagamentoId": Number(formaPagamentoId),
      "tipoDespesa": tipoDespesa
  };

  enviarObjetoJSON("POST", objecto, urlDestino + "despesas/list", function (resposta) {
		montarTabela(resposta);
		console.log("Requisição bem-sucedida. Resposta do servidor:", resposta);
	}, function (erro) {
		alert(erro);
		// Callback de erro
		console.error("Ocorreu um erro na requisição:", erro);
	});
}

function montarTabela(dados) {
  // Limpar a tabela antes de adicionar novas linhas
  despesasTable.innerHTML = '';

  var totalDespesas = 0;

  dados.forEach(function(despesa) {
    var row = despesasTable.insertRow();
    var cellData = row.insertCell(0);
    var cellValor = row.insertCell(1);
    var cellDescricao = row.insertCell(2);
    var cellCategoria = row.insertCell(3);
    var cellFormaPagamento = row.insertCell(4);
    var cellAcoes = row.insertCell(5); // Nova célula para a coluna de ações

    var dataFormatada = new Date(despesa.dataCadastro);
    var dataString = ('0' + dataFormatada.getDate()).slice(-2) + '/' + ('0' + (dataFormatada.getMonth() + 1)).slice(-2) + '/' + dataFormatada.getFullYear();
    cellData.innerHTML = dataString;
    cellValor.innerHTML = despesa.valor.toFixed(2).replace(".",",");
    cellDescricao.innerHTML = despesa.descricao;
    cellCategoria.innerHTML = despesa.categoria;
    cellFormaPagamento.innerHTML = despesa.formaDePagamento;
    
    // Ícone de edição (lápis)
    var editIcon = document.createElement("i");
    editIcon.className = "fas fa-pencil-alt acao-icon acao-editar"; // Adicione a classe do ícone de edição
    editIcon.onclick = function() {
      carregarModalDespesa(despesa);
      $('#myModalEditaDespesa').modal('show');
    }
    cellAcoes.appendChild(editIcon);

    // Ícone de exclusão (x)
    var deleteIcon = document.createElement("i");
    deleteIcon.className = "fas fa-times acao-icon"; // Adicione a classe do ícone de exclusão
    deleteIcon.onclick = function() {
        deletarDespesa(despesa.id); // Chamada da função deletarDespesa com o id da despesa como argumento
    };
    cellAcoes.appendChild(deleteIcon);
    
    // Somar ao total de despesas
    totalDespesas += despesa.valor;
  });

  // Adicionar uma nova linha para exibir o valor total
    var totalRow = despesasTable.insertRow();
    var totalCellLabel = totalRow.insertCell(0);
    var totalCellValue = totalRow.insertCell(1);
    totalCellLabel.innerHTML = "Total:";
    totalCellValue.innerHTML = totalDespesas.toFixed(2);
}

function deletarDespesa(id) {
  $.ajax({
        type: "DELETE",
        url: urlDestino + "despesas/" + id,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (resposta) {
          console.log("Requisição bem-sucedida. Resposta do servidor:", resposta);
          reloadTabela();
        },
        error: function (xhr, status, error) {
          console.error("Ocorreu um erro na requisição:", erro);
          alert(error);          
        }
    });
}

function carregarModalDespesa(despesa) {
  var dataDespesa = new Date(despesa.dataCadastro);
  dataDespesa.setHours(dataDespesa.getHours() - 3);
  var dataDespesaFormatada = dataDespesa.toISOString().slice(0, 16);
  document.getElementById("data_cadastroEdita").value = dataDespesaFormatada;

  document.getElementById("idEditaDespesa").value = despesa.id;
  document.getElementById("valorEdita").value = despesa.valor.toFixed(2);
  document.getElementById("descricaoEdita").value = despesa.descricao;
  selecionarCategoriaPorNome(despesa.categoria);
  selecionarFormaPagamentoPorNome(despesa.formaDePagamento);
}

function editarDespesa() {
  var id = document.getElementById("idEditaDespesa").value;
  var valor = document.getElementById("valorEdita").value;
  var descricao = document.getElementById("descricaoEdita").value;
  var categoriaId = categoriDespesaSelectEditar.value;
  var formaPagamentoId = formaPagamentoEditarSelect.value;
  var dataDespesa = document.getElementById("data_cadastroEdita").value
  var dataFormatada = formatarDataEnvio(dataDespesa);
 
  var objecto = {
      "id": Number(id),
      "descricao": descricao,
      "data": dataFormatada,
      "valor": formatarMoedaEnvio(valor),
      "formaPagamentoId": Number(formaPagamentoId),
      "categoriaId": Number(categoriaId)
  };

  enviarObjetoJSON("PUT", objecto, urlDestino + "despesas", function (resposta) {    
      alert("Despesa editada com sucesso!");
      console.log("Requisição bem-sucedida. Resposta do servidor:", resposta);
      $('#myModalEditaDespesa').modal('hide');
    }, function (erro) {
      alert(erro);
      console.error("Ocorreu um erro na requisição:", erro);
    });
}

function selecionarCategoriaPorNome(nome) {
    var select = categoriDespesaSelectEditar;
    var options = categoriDespesaSelectEditar.options;

    for (var i = 0; i < options.length; i++) {
        if (options[i].text === nome) {
            select.selectedIndex = i;
            break;
        }
    }
}

function selecionarFormaPagamentoPorNome(nome) {
    var select = formaPagamentoEditarSelect;
    var options = formaPagamentoEditarSelect.options;

    for (var i = 0; i < options.length; i++) {
        if (options[i].text === nome) {
            select.selectedIndex = i;
            break;
        }
    }
}


function reloadTabela() {
  var dataInicio = new Date(); // Obtém a data atual
  var dataFim = new Date();
  // Obtém o dia, mês e ano
  var diaInicio = ('0' + dataInicio.getDate()).slice(-2); // Adiciona zero à esquerda se for menor que 10
  var mesInicio = ('0' + (dataInicio.getMonth() + 1)).slice(-2); // Adiciona 1 ao mês, e adiciona zero à esquerda se for menor que 10
  var anoInicio = dataInicio.getFullYear();
  var horaInicio = "00:00";

  var diaFim = ('0' + dataInicio.getDate()).slice(-2); // Adiciona zero à esquerda se for menor que 10
  var mesFim = ('0' + (dataInicio.getMonth() + 2)).slice(-2); // Adiciona 1 ao mês, e adiciona zero à esquerda se for menor que 10
  var anoFim = dataInicio.getFullYear();
  var horaFim = "23:59";


  var dataInicioString = anoInicio + '-' + mesInicio + '-' + diaInicio + " " + horaInicio;
  var dataFimString = anoFim + '-' + mesFim + '-' + diaFim + " " + horaFim;
  var categoriaId = 0;
  var formaPagamentoId = 0;
  var tipoDespesa = document.getElementById("tipoDespesaSelect").value;

  var objecto = {
      "periodoInicio": dataInicioString,
      "periodoFim": dataFimString,
      "categoriaId": categoriaId,
      "formaPagamentoId": formaPagamentoId,
      "tipoDespesa": tipoDespesa
  };

  console.log("Objeto de envio: " + objecto);

  enviarObjetoJSON("POST", objecto, urlDestino + "despesas/list", function (resposta) {
		montarTabela(resposta);
		console.log("Requisição bem-sucedida. Resposta do servidor:", resposta);
	}, function (erro) {
		alert(erro);
		// Callback de erro
		console.error("Ocorreu um erro na requisição:", erro);
	});
}

function logoff() {
  localStorage.clear();
  window.location = "login.html";
}

function isAuthenticate() {
  if(localStorage.getItem("token") == null) 
    logoff();    
}