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
                                            '</tr>' +
                                        '</thead>' +
                                        '<tbody>';
                data.forEach(category => {
                    categoriesTable += '<tr>' +
                                            '<td>' + category.id + '</td>' +
                                            '<td>' + category.descricao + '</td>' +
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