const API_BASE = "http://127.0.0.1:8000";

function getAvatarUrl(filename) {
  const extensionRoot = document.getElementById(
    "philo-extension-root"
  )?.content;
  if (extensionRoot) {
    return `${extensionRoot}images/${filename}`;
  }
  console.warn("PhiloNodes: Impossible de trouver l'URL racine de l'extension");
  return null;
}

const PHILOSOPHERS = {
  1: { name: "Aristote", emoji: "🏛️", avatar: getAvatarUrl("aristotle.png") },
  2: { name: "Emmanuel Kant", emoji: "📚", avatar: getAvatarUrl("kant.png") },
  3: {
    name: "Friedrich Nietzsche",
    emoji: "⚡",
    avatar: getAvatarUrl("nietzsche.png"),
  },
  4: {
    name: "Fiodor Dostoïevski",
    emoji: "✍️",
    avatar: getAvatarUrl("dostoevsky.png"),
  },
  5: { name: "Léon Tolstoï", emoji: "🌾", avatar: getAvatarUrl("tolstoy.png") },
  6: { name: "Confucius", emoji: "🎋", avatar: getAvatarUrl("confucius.png") },
};
let chatState = {
  isOpen: false,
  isLoading: false,
  currentDebate: null,
};



function initChat() {
//   console.log("PhiloNodes Chat initializing...");

  const chatBtn = document.getElementById("PhiloNodes-chat-btn");
  const closeBtn = document.getElementById("chat-close-btn");
  const sendBtn = document.getElementById("chat-send-btn");
  const input = document.getElementById("chat-input");

  if (chatBtn) {
    chatBtn.addEventListener("click", toggleChat);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeChat);
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

//   console.log("PhiloNodes Chat ready");
}

initChat();



function toggleChat() {
  const chatWindow = document.getElementById("PhiloNodes-chat-window");

  if (chatState.isOpen) {
    closeChat();
  } else {
    openChat();
  }
}

function openChat() {
  const chatWindow = document.getElementById("PhiloNodes-chat-window");
  const chatBtn = document.getElementById("PhiloNodes-chat-btn");

  if (chatWindow) {
    chatWindow.style.display = "flex";
    chatState.isOpen = true;

    setTimeout(() => {
      const input = document.getElementById("chat-input");
      if (input) input.focus();
    }, 100);
  }

  if (chatBtn) {
    chatBtn.style.transform = "scale(0.9)";
  }
}

function closeChat() {
  const chatWindow = document.getElementById("PhiloNodes-chat-window");
  const chatBtn = document.getElementById("PhiloNodes-chat-btn");

  if (chatWindow) {
    chatWindow.style.display = "none";
    chatState.isOpen = false;
  }

  if (chatBtn) {
    chatBtn.style.transform = "scale(1)";
  }
}



async function sendMessage() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");

  if (!input || !sendBtn || chatState.isLoading) return;

  const message = input.value.trim();

  if (!message) {
    alert(" Veuillez entrer un mot-clé ou une question");
    return;
  }

  input.disabled = true;
  sendBtn.disabled = true;
  chatState.isLoading = true;

  addUserMessage(message);

  input.value = "";

  addLoadingMessage();

  try {
    const recommendation = await getRecommendation(message);

    removeLoadingMessage();

    if (recommendation && recommendation.winner) {
      await displayPhilosophicalDebate(recommendation);
    } else {
      addSystemMessage(
        "Aucun Consensus",
        "Les philosophes n'ont pas réussi à s'entendre sur cette question."
      );
    }
  } catch (error) {
    console.error("Error:", error);
    removeLoadingMessage();
    addSystemMessage(
      "Erreur",
      "Impossible de se connecter au serveur. Assurez-vous qu'il est lancé sur http://127.0.0.1:8000"
    );
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    chatState.isLoading = false;
    input.focus();
  }
}



async function getRecommendation(keyword) {
  const payload = {
    context: `Question de l'utilisateur: ${keyword}`,
    keywords: keyword
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 5),
    category: null,
  };

//   console.log("Sending to API:", payload);

  const response = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
//   console.log("Received from API:", data);

  return data;
}



function addUserMessage(text) {
  const messagesContainer = document.getElementById("chat-messages");

  const welcomeMsg = messagesContainer.querySelector(".chat-welcome");
  if (welcomeMsg) {
    welcomeMsg.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message";
  messageDiv.innerHTML = `
        <div class="message-avatar">
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                👤
            </div>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-name">Vous</span>
            </div>
            <div class="message-text">${escapeHtml(text)}</div>
        </div>
    `;

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

function addLoadingMessage() {
  const messagesContainer = document.getElementById("chat-messages");

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "chat-loading";
  loadingDiv.id = "chat-loading-msg";
  loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Les philosophes délibèrent...</div>
    `;

  messagesContainer.appendChild(loadingDiv);
  scrollToBottom();
}

function removeLoadingMessage() {
  const loadingMsg = document.getElementById("chat-loading-msg");
  if (loadingMsg) {
    loadingMsg.remove();
  }
}

function addPhilosopherMessage(philosopher, vote, reasoning, score) {
  const messagesContainer = document.getElementById("chat-messages");
  const philData = PHILOSOPHERS[philosopher.id] || {
    name: philosopher.name,
    emoji: "📖",
    avatar: null,
  };

  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message";
  messageDiv.innerHTML = `
        <div class="message-avatar">
            ${
              philData.avatar
                ? `<img src="${philData.avatar}" alt="${philData.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div style="width: 100%; height: 100%; display: none; align-items: center; justify-content: center; font-size: 24px;">${philData.emoji}</div>`
                : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">${philData.emoji}</div>`
            }
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-name"> ${
    philData.name
  }</span>
                <span class="message-vote ${vote.toLowerCase()}">${
    vote === "Accept" ? "✓ ACCEPT" : "✗ REJECT"
  }</span>
            </div>
            <div class="message-text typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
            <div class="message-score">Score: ${score}/10</div>
        </div>
    `;

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();

  const messageText = messageDiv.querySelector(".message-text");
  setTimeout(() => {
    messageText.classList.remove("typing-indicator");
    messageText.innerHTML = "";
    typeWriter(messageText, escapeHtml(reasoning), 0);
  }, 800);
}

function typeWriter(element, text, index) {
  if (index < text.length) {
    element.textContent += text.charAt(index);
    scrollToBottom();
    setTimeout(() => typeWriter(element, text, index + 1), 20);
  }
}

function addSystemMessage(title, text) {
  const messagesContainer = document.getElementById("chat-messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = "system-message";
  messageDiv.innerHTML = `
        <div class="system-message-title">${title}</div>
        <div class="system-message-text">${text}</div>
    `;

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

function addWinnerQuote(winner, consensus) {
  const messagesContainer = document.getElementById("chat-messages");
  const quote = winner.quote.quote || winner.quote.text;
  const source = winner.quote.source;

  const messageDiv = document.createElement("div");
  messageDiv.className = "winner-quote";
  messageDiv.innerHTML = `
        <div class="winner-badge">🏆 Citation Gagnante</div>
        <div class="winner-text">"${escapeHtml(quote)}"</div>
        <div class="winner-source">— ${escapeHtml(source)}</div>
        <div style="text-align: center; margin-top: 12px; font-size: 11px; color: #a08968;">
            Consensus ${consensus.quorum_percentage}% • ${
    consensus.accepts
  } Accept / ${consensus.rejects} Reject
        </div>
    `;

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}



async function displayPhilosophicalDebate(recommendation) {
  const votes = recommendation.votes_detail;
  const winner = recommendation.winner;
  const consensus = recommendation.consensus;

  addSystemMessage(
    "🗣️ Débat en cours",
    `${votes.length} philosophes participent à la discussion...`
  );

  await sleep(800);

  for (const vote of votes) {
    let philosopherId = null;
    for (const [id, data] of Object.entries(PHILOSOPHERS)) {
      if (data.name === vote.philosopher_name) {
        philosopherId = parseInt(id);
        break;
      }
    }

    if (!philosopherId) {
      philosopherId = 1;
    }

    addPhilosopherMessage(
      { id: philosopherId, name: vote.philosopher_name },
      vote.vote,
      vote.reasoning,
      vote.score
    );

    const reasoningLength = vote.reasoning.length;
    const typingTime = reasoningLength * 20 + 800; 
    await sleep(typingTime + 400); 
  }

  await sleep(500);

  if (consensus.quorum_reached) {
    addSystemMessage(
      "Consensus Atteint",
      `Quorum: ${consensus.quorum_percentage}% • ${consensus.accepts} philosophes acceptent la recommandation`
    );

    await sleep(600);

    addWinnerQuote(winner, consensus);
  } else {
    addSystemMessage(
      "Consensus Non Atteint",
      `Quorum: ${consensus.quorum_percentage}% (seuil requis: ${consensus.threshold}%)`
    );
  }
}


function scrollToBottom() {
  const messagesContainer = document.getElementById("chat-messages");
  if (messagesContainer) {
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


