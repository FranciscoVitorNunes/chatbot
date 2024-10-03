// Definições das credenciais do Google Sheets
const API_KEY = 'AIzaSyByYQMj1fS-j6WMujKM81HEdgbcurwfCSI';  // Substitua com sua chave de API
const SHEET_ID = '1jhnmrgWKxWwNV7xE5iRM5iBP7geIPE1opIIf_YDKP-A';  // Substitua com o ID da sua planilha
const RANGE = 'Sheet1!A:B';  // Intervalo de células que contém as perguntas e respostas

// Função para buscar os dados da planilha
async function obterDadosDaPlanilha() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.values && data.values.length) {
      return data.values;  // Retorna os dados como um array de arrays
    } else {
      console.warn('A planilha está vazia ou o intervalo está incorreto.');
      return [];
    }
  } catch (error) {
    console.error('Erro ao buscar dados da planilha:', error);
    return [];
  }
}

// Função para buscar a resposta com base na pergunta digitada pelo usuário
async function obterResposta(perguntaUsuario) {
  const dados = await obterDadosDaPlanilha();

  // Procura a pergunta na planilha, ignorando maiúsculas e minúsculas
  const perguntaEncontrada = dados.find(linha => linha[0].toLowerCase() === perguntaUsuario.toLowerCase());

  if (perguntaEncontrada) {
    return perguntaEncontrada[1];  // Retorna a resposta correspondente
  } else {
    return "Desculpe, não encontrei uma resposta para essa pergunta.";
  }
}

// Exibir sugestões conforme o usuário digita
async function mostrarSugestoes() {
  const input = document.getElementById('question-input').value.toLowerCase();
  const suggestionsDiv = document.getElementById('suggestions');
  suggestionsDiv.innerHTML = '';  // Limpa as sugestões anteriores

  if (input.length > 0) {
    const dados = await obterDadosDaPlanilha();

    dados.forEach(([pergunta, resposta]) => {
      if (pergunta.toLowerCase().includes(input)) {
        const suggestion = document.createElement('div');
        suggestion.innerText = pergunta;
        suggestion.onclick = () => {
          document.getElementById('question-input').value = pergunta;
          suggestionsDiv.innerHTML = '';
        };
        suggestionsDiv.appendChild(suggestion);
      }
    });
  }
}

// Força o scroll do container de sugestões enquanto digita
document.getElementById('question-input').addEventListener('input', function() {
  const suggestionsDiv = document.getElementById('suggestions');
  suggestionsDiv.scrollTop = suggestionsDiv.scrollHeight;
});


// Enviar a pergunta do usuário e exibir a resposta no chat
async function enviarPergunta() {
  const input = document.getElementById('question-input').value;
  if (input.trim() === '') {
    return;  // Se o campo de input estiver vazio, não faz nada
  }

  const chatBody = document.getElementById('chat-body');

  // Adicionar a pergunta do usuário ao chat
  const userMessageDiv = document.createElement('div');
  userMessageDiv.innerText = "Usuário: " + input;
  userMessageDiv.classList.add('message', 'user-message');
  chatBody.appendChild(userMessageDiv);

  // Buscar a resposta e adicionar ao chat
  const resposta = await obterResposta(input);
  const botMessageDiv = document.createElement('div');
  botMessageDiv.innerText = "Assistente: " + resposta;
  botMessageDiv.classList.add('message', 'bot-message');
  chatBody.appendChild(botMessageDiv);

  // Limpar o input e rolar o chat até o final
  document.getElementById('question-input').value = '';
  chatBody.scrollTop = chatBody.scrollHeight;
}
