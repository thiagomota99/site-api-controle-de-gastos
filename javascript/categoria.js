isAuthenticate();	
//const urlDestino = "http://ec2-3-21-19-165.us-east-2.compute.amazonaws.com:8080/categorias"
const urlDestino = "http://localhost:8080/categorias"

$(document).ready(function() {
  isAuthenticate();
  $("#btnCadastrarCategoria").click(function() {
	var objetoJSON = getCamposFormulario();
	enviarObjetoJSON(objetoJSON, urlDestino, function (resposta) {
		alert(resposta);
		console.log("Requisição bem-sucedida. Resposta do servidor:", resposta);
	}, function (erro) {
		alert(erro);
		console.error("Ocorreu um erro na requisição:", erro);
	});
  });

  $("#btn-enviarEdita").click(editarCategoria)
});

function enviarObjetoJSON(objetoJSON, urlDestino, sucessoCallback, erroCallback) {
    // Configuração da requisição AJAX
    $.ajax({
        type: "POST",
        url: urlDestino,
        contentType: "application/json",
        data: JSON.stringify(objetoJSON),
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },        
        success: function (resposta) {
            if (sucessoCallback && typeof sucessoCallback === "function") {
                sucessoCallback(resposta);
            }
        },
        error: function (xhr, status, error) {
            if (erroCallback && typeof erroCallback === "function") {
                erroCallback(xhr.responseText);
            }
        }
    });
}

function getCamposFormulario() {
    var descricao = document.getElementById("descricao").value;
	
	var formDataJSON = {
      "descricao": descricao
    };
	
	return formDataJSON;
}

function fetchData() {
    // Configuração da requisição
    var configuracaoRequisicao = {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    };
    fetch(urlDestino, configuracaoRequisicao)
        .then(response => response.json())
        .then(data => {
            // Processar os dados recebidos
            displayData(data);
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            document.getElementById('response').innerHTML = '<p>Erro ao buscar dados.</p>';
        });
}

function displayData(data) {
    // Exibir os dados recebidos na página
            let responseDiv = document.getElementById('response');
            responseDiv.innerHTML = '<h2>Categorias:</h2>';
            if (data.length === 0) {
                responseDiv.innerHTML += '<p>Nenhuma categoria encontrada.</p>';
            } else {
                let categoriesTable = '<table>' +
                                        '<thead>' +
                                            '<tr>' +
                                                '<th>ID</th>' +
                                                '<th>Descrição</th>' +
                                                '<th>Ações</th>' +
                                            '</tr>' +
                                        '</thead>' +
                                        '<tbody>';
                data.forEach(category => {
                    categoriesTable += '<tr>' +
                                            '<td>' + category.id + '</td>' +
                                            '<td>' + category.descricao + '</td>' +
                                            '<td> <i class="fas fa-pencil-alt acao-icon acao-editar" onclick="carregarModalCategoria('+category.id+')"></i>' +
                                            '<i class="fas fa-times acao-icon" onclick="deletarCategoria('+category.id+')"></i></td>' +
                                        '</tr>';
                });
                categoriesTable += '</tbody>' +
                                    '</table>';
                responseDiv.innerHTML += categoriesTable;
            }
        }
function logoff() {
  localStorage.clear();
  window.location = "login.html";
}

function isAuthenticate() {
  if(localStorage.getItem("token") == null) 
    logoff();    
}

function carregarModalCategoria(id) {
    $.ajax({
        type: "GET",
        url: urlDestino + '/' + id,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },        
        success: function (categoria) {
            document.getElementById("idEditaDespesa").value = categoria.id;
            document.getElementById("descricaoEdita").value = categoria.descricao;

            $('#myModalEditaCategoria').modal('show');
        },
        error: function (xhr, status, error) {
            if (erroCallback && typeof erroCallback === "function") {
                erroCallback(xhr.responseText);
            }
        }
    });
}

function editarCategoria() {
    var id = document.getElementById("idEditaDespesa").value;
    var descricao = document.getElementById("descricaoEdita").value;
   
    var objecto = {
        "id": Number(id),
        "descricao": descricao
    };
  
    // Configuração da requisição AJAX
    $.ajax({
        type: "PUT",
        url: urlDestino,
        contentType: "application/json",
        data: JSON.stringify(objecto),
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },        
        success: function (resposta) {
            alert("Categoria editada com sucesso!");
            console.log("Requisição bem-sucedida. Resposta do servidor:", resposta);
            $('#myModalEditaCategoria').modal('hide');
        },
        error: function (xhr, status, error) {
            alert(error);
            console.error("Ocorreu um erro na requisição:", error);
        }
    });
  }

  function deletarCategoria(id) {
        $.ajax({
            type: "DELETE",
            url: urlDestino + '/' + id,            
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },        
            success: function (resposta) {
                alert(resposta);
            },
            error: function (xhr, status, error) {
                alert(error);
                console.error("Ocorreu um erro na requisição:", error);
            }
        });
  }