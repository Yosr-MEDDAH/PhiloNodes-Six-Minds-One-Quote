    const API_BASE = "http://127.0.0.1:8000";

    let state = {
    philosophers: {},
    currentProcess: [],
    logs: [],
    recordedProcesses: [],
    capturedStates: [],
    lastRecommendationTimestamp: 0,
    isCapturing: false,
    };

    const philosopherImages = {
    Aristotle: "../extension/images/aristotle.png",
    "Immanuel Kant": "../extension/images/kant.png",
    "Friedrich Nietzsche": "../extension/images/nietzsche.png",
    "Fyodor Dostoevsky": "../extension/images/dostoevsky.png",
    "Leo Tolstoy": "../extension/images/tolstoy.png",
    Confucius: "../extension/images/confucius.png",
    };

    const philosopherIds = {
    Aristotle: 1,
    "Immanuel Kant": 2,
    "Friedrich Nietzsche": 3,
    "Fyodor Dostoevsky": 4,
    "Leo Tolstoy": 5,
    Confucius: 6,
    };

    async function init() {
    await updateStatus();
    await loadRecentRecommendations();

    document
        .getElementById("replayBtn")
        .addEventListener("click", replayLastProcess);
    document
        .getElementById("clearHistoryBtn")
        .addEventListener("click", clearHistory);
    document
        .getElementById("captureBtn")
        .addEventListener("click", captureCurrentState);

    setInterval(updateStatus, 2000);

    setInterval(checkForNewRecommendations, 1000);

    addLog(
        "REQUEST",
        "Système initialisé",
        "Dashboard démarré avec système de capture"
    );
    }

    async function captureCurrentState() {
    const btn = document.getElementById("captureBtn");

    if (state.isCapturing) {
        state.isCapturing = false;
        btn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                    Capturer l'État Actuel
                `;
        addLog("REQUEST", "Capture", "Mode capture désactivé");
        return;
    }

    if (state.recordedProcesses.length === 0) {
        alert(
        "Aucun processus à capturer. Lancez d'abord une recommandation depuis l'extension Chrome."
        );
        return;
    }

    state.isCapturing = true;
    btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                Arrêter la Capture
            `;

    const snapshot = {
        timestamp: Date.now(),
        process: JSON.parse(JSON.stringify(state.recordedProcesses[0])),
        philosophers: JSON.parse(JSON.stringify(state.philosophers)),
        logs: JSON.parse(JSON.stringify(state.logs.slice(0, 20))),
    };

    state.capturedStates.unshift(snapshot);

    try {
        const dataStr = JSON.stringify(snapshot, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `consensus-capture-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addLog(
        "RESPONSE",
        "Capture",
        `État sauvegardé (${(dataStr.length / 1024).toFixed(2)} KB)`
        );

        setTimeout(() => {
        state.isCapturing = false;
        btn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                        Capturer l'État Actuel
                    `;
        }, 2000);
    } catch (error) {
        addLog("ERROR", "Capture", `Erreur: ${error.message}`);
        state.isCapturing = false;
        btn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                    Capturer l'État Actuel
                `;
    }
    }

    async function updateStatus() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();

        document.getElementById("systemStatus").className = "status-dot online";
        document.getElementById("statusText").textContent = "Système en ligne";
        document.getElementById(
        "activeNodes"
        ).textContent = `${data.active_nodes}/${data.total_nodes}`;

        updatePhilosophers(data.philosophers);
    } catch (error) {
        document.getElementById("systemStatus").className = "status-dot offline";
        document.getElementById("statusText").textContent = "Système hors ligne";
    }
    }

    async function checkForNewRecommendations() {
    try {
        const response = await fetch(`${API_BASE}/recommendations?limit=1`);
        const data = await response.json();

        if (data.recommendations && data.recommendations.length > 0) {
        const latest = data.recommendations[0];

        if (latest.timestamp > state.lastRecommendationTimestamp) {
            state.lastRecommendationTimestamp = latest.timestamp;

            state.recordedProcesses.unshift(latest);
            if (state.recordedProcesses.length > 10) {
            state.recordedProcesses.pop();
            }

            addLog(
            "REQUEST",
            "Nouveau processus détecté",
            "Enregistrement automatique en cours..."
            );
            displayRecommendationProcess(latest);
        }
        }
    } catch (error) {
        console.error("Error checking recommendations:", error);
    }
    }

    async function loadRecentRecommendations() {
    try {
        const response = await fetch(`${API_BASE}/recommendations?limit=10`);
        const data = await response.json();

        if (data.recommendations && data.recommendations.length > 0) {
        state.lastRecommendationTimestamp = data.recommendations[0].timestamp;
        state.recordedProcesses = data.recommendations;

        displayRecommendationProcess(data.recommendations[0]);

        const successCount = data.recommendations.filter((r) => r.winner).length;
        document.getElementById("consensusCount").textContent = successCount;

        if (data.recommendations.length > 0) {
            const avgTime =
            data.recommendations.reduce((sum, r) => sum + r.processing_time, 0) /
            data.recommendations.length;
            document.getElementById("avgTime").textContent = `${avgTime.toFixed(
            2
            )}s`;
        }

        addLog(
            "RESPONSE",
            "Historique chargé",
            `${data.recommendations.length} processus récupérés`
        );
        }
    } catch (error) {
        console.error("Error loading recommendations:", error);
    }
    }

    async function displayRecommendationProcess(recommendation, isReplay = false) {
    state.currentProcess = [];

    const context = recommendation.context;
    const data = recommendation;

    addLog(
        "REQUEST",
        "Extension Chrome → Backend",
        `Contexte: "${context.context}"${isReplay ? " (REPLAY)" : ""}`
    );

    clearTimeline();
    addTimelineStep("Requête reçue", `Contexte: "${context.context}"`);

    await sleep(300);

    addTimelineStep(
        "Distribution aux nœuds",
        `${data.consensus.total_votes} nœuds actifs`
    );
    addLog(
        "TCP_SEND",
        "Coordinateur → Tous les nœuds",
        "Broadcast de la requête"
    );

    animatePhilosophersThinking();

    await sleep(500);

    addTimelineStep(
        "Réception des votes",
        `${data.votes_detail.length} philosophes ont répondu`
    );

    data.votes_detail.forEach((vote) => {
        addLog(
        "TCP_RECV",
        `${vote.philosopher_name} → Coordinateur`,
        `Vote: ${vote.vote}, Score: ${vote.score}/10`
        );
    });

    resetPhilosopherAnimations();

    await sleep(400);

    addTimelineStep(
        "Calcul du consensus",
        `Quorum: ${data.consensus.quorum_percentage}%`
    );
    addLog(
        "CONSENSUS",
        "Protocole de consensus",
        `Accepts: ${data.consensus.accepts}, Rejects: ${data.consensus.rejects}`
    );

    await sleep(400);

    if (data.winner) {
        addTimelineStep("Consensus atteint", "Citation gagnante sélectionnée");
        addLog("RESPONSE", "Coordinateur → Extension", "Citation envoyée");

        if (data.votes_detail.length > 0) {
        const winnerName = data.votes_detail[0].philosopher_name;
        const winnerId = philosopherIds[winnerName];
        highlightWinner(winnerId);
        }
    } else {
        addTimelineStep("Consensus échoué", "Quorum non atteint");
        addLog("ERROR", "Protocole de consensus", "Pas de consensus");
    }

    displayVotes(data.votes_detail);
    displayConsensus(data);
    }

    function updatePhilosophers(philosophers) {
    const grid = document.getElementById("philosophersGrid");

    if (Object.keys(state.philosophers).length === 0) {
        grid.innerHTML = "";
        philosophers.forEach((phil) => {
        state.philosophers[phil.id] = phil;
        const card = createPhilosopherCard(phil);
        grid.appendChild(card);
        });
    } else {
        philosophers.forEach((phil) => {
        state.philosophers[phil.id] = phil;
        updatePhilosopherCard(phil);
        });
    }
    }

    function createPhilosopherCard(phil) {
    const card = document.createElement("div");
    card.className = `philosopher-card ${
        phil.status === "active" ? "connected" : "disconnected"
    }`;
    card.id = `phil-${phil.id}`;

    const imagePath = philosopherImages[phil.name] || "./images/default.jpg";

    card.innerHTML = `
                <div class="philosopher-avatar">
                    <img src="${imagePath}" alt="${
        phil.name
    }" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size: 28px\\'>📖</span>';">
                </div>
                <div class="philosopher-name">${phil.name}</div>
                <div class="philosopher-school">${phil.school}</div>
                <div class="philosopher-status ${
                phil.status === "active" ? "connected" : "disconnected"
                }">
                    <div class="dot"></div>
                    <span>${
                    phil.status === "active" ? "Connecté" : "Déconnecté"
                    }</span>
                </div>
                <div class="philosopher-stats">
                    <span>Port ${phil.port}</span>
                    <span id="phil-${phil.id}-wins">0 victoires</span>
                </div>
            `;

    return card;
    }

    function updatePhilosopherCard(phil) {
    const card = document.getElementById(`phil-${phil.id}`);
    if (!card) return;

    card.className = `philosopher-card ${
        phil.status === "active" ? "connected" : "disconnected"
    }`;
    }

    function displayVotes(votes) {
    const container = document.getElementById("votesDisplay");

    if (votes.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <div>Aucun vote</div>
                    </div>
                `;
        return;
    }

    container.innerHTML =
        '<div class="votes-grid">' +
        votes
        .map(
            (vote) => `
                    <div class="vote-item ${vote.vote.toLowerCase()}">
                        <div>
                            <div class="vote-philosopher">${
                            vote.philosopher_name
                            }</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                                ${vote.reasoning}
                            </div>
                        </div>
                        <div class="vote-score">
                            <span style="color: #f1f5f9; font-weight: 600;">${
                            vote.score
                            }/10</span>
                            <span class="vote-badge ${vote.vote.toLowerCase()}">${
            vote.vote
            }</span>
                        </div>
                    </div>
                `
        )
        .join("") +
        "</div>";
    }

    function displayConsensus(data) {
    const container = document.getElementById("consensusDisplay");
    const consensus = data.consensus;
    const winner = data.winner;

    container.innerHTML = `
                <div class="consensus-result ${
                consensus.quorum_reached ? "" : "failed"
                }">
                    <div class="consensus-header">
                        <div>
                            <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">
                                Quorum
                            </div>
                            <div class="consensus-percentage">${
                            consensus.quorum_percentage
                            }%</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 24px; margin-bottom: 5px;">
                                ${consensus.quorum_reached ? "✓" : "✗"}
                            </div>
                            <div style="font-size: 12px; color: #64748b;">
                                ${consensus.accepts} Accept / ${
        consensus.rejects
    } Reject
                            </div>
                        </div>
                    </div>
                    
                    ${
                    winner
                        ? `
                        <div class="quote-display">
                            "${winner.quote.text || winner.quote.quote}"
                            <div class="quote-source">
                                — ${winner.quote.source}
                            </div>
                        </div>
                        <div style="margin-top: 15px; font-size: 13px; color: #64748b;">
                            Score moyen: <strong style="color: #f1f5f9;">${
                            winner.average_score
                            }/10</strong> 
                            • Supporté par <strong style="color: #f1f5f9;">${
                            winner.votes_count
                            }</strong> philosophe(s)
                        </div>
                    `
                        : `
                        <div style="margin-top: 20px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; text-align: center; color: #f87171;">
                            Le quorum n'a pas été atteint (seuil: ${consensus.threshold}%)
                        </div>
                    `
                    }
                </div>
            `;
    }

    function clearTimeline() {
    const timeline = document.getElementById("processTimeline");
    timeline.innerHTML = "";
    }

    function addTimelineStep(title, description) {
    const timeline = document.getElementById("processTimeline");

    const item = document.createElement("div");
    item.className = "timeline-item active";
    item.innerHTML = `
                <div class="timeline-time">${new Date().toLocaleTimeString()}</div>
                <div class="timeline-content"><strong>${title}</strong><br>${description}</div>
            `;
    timeline.appendChild(item);

    setTimeout(() => {
        const items = timeline.querySelectorAll(".timeline-item");
        if (items.length > 1) {
        items[items.length - 2].classList.remove("active");
        }
    }, 100);

    timeline.scrollTop = timeline.scrollHeight;
    }

    function animatePhilosophersThinking() {
    Object.values(state.philosophers).forEach((phil) => {
        if (phil.status === "active") {
        const card = document.getElementById(`phil-${phil.id}`);
        if (card) {
            card.classList.add("thinking");
            const status = card.querySelector(".philosopher-status");
            if (status) {
            status.className = "philosopher-status thinking";
            const span = status.querySelector("span");
            if (span) span.textContent = "Réfléchit...";
            }
        }
        }
    });
    }

    function resetPhilosopherAnimations() {
    Object.values(state.philosophers).forEach((phil) => {
        const card = document.getElementById(`phil-${phil.id}`);
        if (card) {
        card.classList.remove("thinking");
        if (phil.status === "active") {
            card.classList.add("voting");
            const status = card.querySelector(".philosopher-status");
            if (status) {
            status.className = "philosopher-status voted";
            const span = status.querySelector("span");
            if (span) span.textContent = "A voté";
            }
        }
        }
    });

    setTimeout(() => {
        Object.values(state.philosophers).forEach((phil) => {
        const card = document.getElementById(`phil-${phil.id}`);
        if (card) {
            card.classList.remove("voting", "winner");
            const status = card.querySelector(".philosopher-status");
            if (status) {
            status.className = `philosopher-status ${
                phil.status === "active" ? "connected" : "disconnected"
            }`;
            const span = status.querySelector("span");
            if (span)
                span.textContent =
                phil.status === "active" ? "Connecté" : "Déconnecté";
            }
        }
        });
    }, 2000);
    }

    function highlightWinner(philosopherId) {
    const card = document.getElementById(`phil-${philosopherId}`);
    if (card) {
        card.classList.add("winner");

        const winsEl = document.getElementById(`phil-${philosopherId}-wins`);
        if (winsEl) {
        const currentWins = parseInt(winsEl.textContent) || 0;
        winsEl.textContent = `${currentWins + 1} victoire${
            currentWins + 1 > 1 ? "s" : ""
        }`;
        }
    }
    }

    function addLog(type, source, message) {
    const log = {
        time: new Date().toLocaleTimeString(),
        type: type,
        source: source,
        message: message,
    };

    state.logs.unshift(log);
    if (state.logs.length > 100) state.logs.pop();

    updateLogs();
    }

    function updateLogs() {
    const consoleEl = document.getElementById("logsConsole");
    consoleEl.innerHTML = state.logs
        .map(
        (log) => `
                <div class="log-entry">
                    <span class="log-time">[${log.time}]</span>
                    <span class="log-type ${log.type}">${log.type}</span>
                    <span>${log.source}: ${log.message}</span>
                </div>
            `
        )
        .join("");
    }

    async function replayLastProcess() {
    if (state.recordedProcesses.length === 0) {
        addLog("ERROR", "Replay", "Aucun processus enregistré à rejouer");
        alert(
        "Aucun processus enregistré. Lancez d'abord une recommandation depuis l'extension Chrome."
        );
        return;
    }

    const btn = document.getElementById("replayBtn");
    btn.disabled = true;
    btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Replay en cours...
            `;

    const lastProcess = state.recordedProcesses[0];
    addLog("REQUEST", "Replay", "Rejeu du dernier processus enregistré");

    await displayRecommendationProcess(lastProcess, true);

    btn.disabled = false;
    btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                Rejouer le Dernier Processus
            `;
    }

    function clearHistory() {
    if (
        confirm(
        "Êtes-vous sûr de vouloir effacer l'historique des processus enregistrés ?"
        )
    ) {
        state.recordedProcesses = [];
        state.capturedStates = [];
        state.logs = [];
        updateLogs();
        addLog("REQUEST", "Système", "Historique et captures effacés");
    }
    }

    function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
    }

    init();
