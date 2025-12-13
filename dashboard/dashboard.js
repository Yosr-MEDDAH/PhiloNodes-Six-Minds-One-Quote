// dashboard.js
// Dashboard de monitoring temps réel pour le système distribué

const API_BASE = 'http://127.0.0.1:8000';
const POLL_INTERVAL = 2000; // 2 secondes

// État global
let state = {
    startTime: Date.now(),
    nodes: {},
    currentVote: null,
    logs: [],
    stats: {
        totalRequests: 0,
        avgResponseTime: 0,
        consensusRate: 0,
        responseTimes: [],
        winnerCounts: {}
    },
    autoScroll: true
};

let charts = {};

// ============================================
// FONCTIONS API
// ============================================

async function fetchStatus() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        updateNodes(data.philosophers);
        updateSystemStatus(data.active_nodes, data.total_nodes);
        return data;
    } catch (error) {
        console.error('Error fetching status:', error);
        updateSystemStatus(0, 6, false);
    }
}

async function testRecommendation() {
    const contexts = [
        { context: "feeling stressed", keywords: ["stress", "anxiety"], category: "Happiness and well-being" },
        { context: "moral dilemma", keywords: ["ethics", "morality"], category: "Ethics and behavior" },
        { context: "seeking wisdom", keywords: ["wisdom", "knowledge"], category: "Wisdom" }
    ];
    
    const test = contexts[Math.floor(Math.random() * contexts.length)];
    
    try {
        logEvent('request', `Testing with: "${test.context}"`, 'System');
        const startTime = performance.now();
        
        const response = await fetch(`${API_BASE}/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(test)
        });
        
        const data = await response.json();
        const responseTime = ((performance.now() - startTime) / 1000).toFixed(2);
        
        // Mise à jour des stats
        state.stats.totalRequests++;
        state.stats.responseTimes.push(parseFloat(responseTime));
        if (state.stats.responseTimes.length > 20) {
            state.stats.responseTimes.shift();
        }
        
        const avgTime = (state.stats.responseTimes.reduce((a, b) => a + b, 0) / state.stats.responseTimes.length).toFixed(2);
        state.stats.avgResponseTime = avgTime;
        
        if (data.consensus.quorum_reached) {
            state.stats.consensusRate = ((state.stats.consensusRate * (state.stats.totalRequests - 1) + 100) / state.stats.totalRequests).toFixed(1);
        } else {
            state.stats.consensusRate = ((state.stats.consensusRate * (state.stats.totalRequests - 1)) / state.stats.totalRequests).toFixed(1);
        }
        
        // Track winners
        if (data.winner) {
            const philosopherId = data.winner.quote.quoteId; // Utiliser l'ID de la quote comme proxy
            const winnerName = data.votes_detail[0]?.philosopher_name || 'Unknown';
            state.stats.winnerCounts[winnerName] = (state.stats.winnerCounts[winnerName] || 0) + 1;
        }
        
        displayVote(data, test);
        updateGlobalStats();
        updateCharts();
        
        logEvent('consensus', `Quorum: ${data.consensus.quorum_percentage}% | Time: ${responseTime}s`, 'System');
        
        if (data.winner) {
            logEvent('response', `Winner: ${data.votes_detail[0]?.philosopher_name}`, 'System');
        }
        
    } catch (error) {
        console.error('Error testing recommendation:', error);
        logEvent('error', `Request failed: ${error.message}`, 'System');
    }
}

// ============================================
// MISE À JOUR UI
// ============================================

function updateSystemStatus(active, total, connected = true) {
    const statusText = document.getElementById('status-text');
    const statusIndicator = document.querySelector('.status-indicator');
    const statActiveNodes = document.getElementById('stat-active-nodes');
    
    if (!connected) {
        statusText.textContent = 'Server Disconnected';
        statusIndicator.classList.add('inactive');
    } else {
        statusText.textContent = `${active}/${total} Nodes Active`;
        statusIndicator.classList.remove('inactive');
    }
    
    statActiveNodes.textContent = `${active}/${total}`;
}

function updateNodes(philosophers) {
    const grid = document.getElementById('nodes-grid');
    
    if (Object.keys(state.nodes).length === 0) {
        // Première fois - créer les cartes
        grid.innerHTML = '';
        philosophers.forEach(phil => {
            state.nodes[phil.id] = phil;
            const card = createNodeCard(phil);
            grid.appendChild(card);
        });
    } else {
        // Mise à jour
        philosophers.forEach(phil => {
            const previousStatus = state.nodes[phil.id]?.status;
            state.nodes[phil.id] = phil;
            
            const card = document.querySelector(`[data-node-id="${phil.id}"]`);
            if (card) {
                updateNodeCard(card, phil);
                
                // Log si changement de statut
                if (previousStatus && previousStatus !== phil.status) {
                    logEvent('node_status', `${phil.name} is now ${phil.status}`, phil.name);
                }
            }
        });
    }
}

function createNodeCard(phil) {
    const card = document.createElement('div');
    card.className = `node-card ${phil.status}`;
    card.dataset.nodeId = phil.id;
    
    card.innerHTML = `
        <div class="node-header">
            <span class="node-name">${phil.name}</span>
            <span class="node-status-badge ${phil.status}">${phil.status}</span>
        </div>
        <div class="node-info">
            <div><strong>School:</strong> ${phil.school}</div>
            <div><strong>Port:</strong> ${phil.port}</div>
        </div>
        <div class="node-stats">
            <span>Last seen: <span class="node-last-seen">Just now</span></span>
        </div>
    `;
    
    return card;
}

function updateNodeCard(card, phil) {
    card.className = `node-card ${phil.status}`;
    const badge = card.querySelector('.node-status-badge');
    badge.className = `node-status-badge ${phil.status}`;
    badge.textContent = phil.status;
}

function displayVote(data, request) {
    const voteContainer = document.getElementById('current-vote');
    
    voteContainer.innerHTML = `
        <div class="vote-active">
            <div class="vote-request">
                <h3>📨 Request</h3>
                <p><strong>Context:</strong> ${request.context}</p>
                <p><strong>Keywords:</strong> ${request.keywords.join(', ')}</p>
                <p><strong>Category:</strong> ${request.category || 'Auto-detect'}</p>
            </div>
            
            <h3>🗳️ Votes (${data.consensus.total_votes} philosophers)</h3>
            <div class="vote-grid">
                ${data.votes_detail.map(vote => `
                    <div class="vote-item ${vote.vote.toLowerCase()}">
                        <div class="vote-item-header">
                            <span>${vote.philosopher_name}</span>
                            <span>${vote.vote}</span>
                        </div>
                        <div class="vote-score">Score: ${vote.score}/10</div>
                        <div class="vote-reasoning">${vote.reasoning}</div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: ${data.consensus.quorum_reached ? '#f0fdf4' : '#fef2f2'}; border-radius: 8px;">
                <h3>${data.consensus.quorum_reached ? '✅ Consensus Reached' : '❌ No Consensus'}</h3>
                <p>Quorum: ${data.consensus.quorum_percentage}% (threshold: ${data.consensus.threshold}%)</p>
                <p>Accepts: ${data.consensus.accepts} | Rejects: ${data.consensus.rejects}</p>
                ${data.winner ? `
                    <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 5px;">
                        <strong>🏆 Winner Quote:</strong>
                        <p style="font-style: italic; margin: 5px 0;">"${data.winner.quote.text}"</p>
                        <p style="font-size: 12px; color: #6b7280;">Average Score: ${data.winner.average_score}/10</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function updateGlobalStats() {
    document.getElementById('stat-requests').textContent = state.stats.totalRequests;
    document.getElementById('stat-response-time').textContent = state.stats.avgResponseTime + ' s';
    document.getElementById('stat-consensus-rate').textContent = state.stats.consensusRate + '%';
}

function logEvent(type, message, source = 'System') {
    const timestamp = new Date().toLocaleTimeString();
    const log = { timestamp, type, message, source };
    
    state.logs.unshift(log);
    if (state.logs.length > 100) {
        state.logs.pop();
    }
    
    updateLogsConsole();
}

function updateLogsConsole() {
    const console = document.getElementById('logs-console');
    const shouldScroll = state.autoScroll && (console.scrollTop + console.clientHeight >= console.scrollHeight - 10);
    
    console.innerHTML = state.logs.map(log => `
        <div class="log-entry">
            <span class="log-time">${log.timestamp}</span>
            <span class="log-type ${log.type}">${log.type.toUpperCase()}</span>
            <span class="log-message">[${log.source}] ${log.message}</span>
        </div>
    `).join('');
    
    if (shouldScroll) {
        console.scrollTop = console.scrollHeight;
    }
}

function updateUptime() {
    const elapsed = Date.now() - state.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    document.getElementById('uptime').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// GRAPHIQUES
// ============================================

function initCharts() {
    // Winners Distribution
    const winnersCtx = document.getElementById('chart-winners').getContext('2d');
    charts.winners = new Chart(winnersCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
    
    // Response Time
    const responseTimeCtx = document.getElementById('chart-response-time').getContext('2d');
    charts.responseTime = new Chart(responseTimeCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Response Time (s)',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Seconds' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateCharts() {
    // Winners
    charts.winners.data.labels = Object.keys(state.stats.winnerCounts);
    charts.winners.data.datasets[0].data = Object.values(state.stats.winnerCounts);
    charts.winners.update();
    
    // Response Time
    const times = state.stats.responseTimes;
    charts.responseTime.data.labels = times.map((_, i) => `#${state.stats.totalRequests - times.length + i + 1}`);
    charts.responseTime.data.datasets[0].data = times;
    charts.responseTime.update();
}

// ============================================
// EVENT LISTENERS
// ============================================

document.getElementById('clear-logs-btn').addEventListener('click', () => {
    state.logs = [];
    updateLogsConsole();
    logEvent('system', 'Logs cleared', 'User');
});

document.getElementById('toggle-auto-scroll').addEventListener('click', (e) => {
    state.autoScroll = !state.autoScroll;
    e.target.classList.toggle('active');
    e.target.textContent = state.autoScroll ? 'Auto-scroll' : 'Manual scroll';
});

// ============================================
// POLLING ET INIT
// ============================================

async function mainLoop() {
    await fetchStatus();
    updateUptime();
}

async function init() {
    logEvent('system', 'Dashboard started', 'System');
    
    initCharts();
    await fetchStatus();
    
    // Polling régulier
    setInterval(mainLoop, POLL_INTERVAL);
    
    // Uptime update every second
    setInterval(updateUptime, 1000);
    
    // Auto test recommendation every 10 seconds (optionnel - commenter pour désactiver)
    setInterval(testRecommendation, 10000);
    
    logEvent('system', 'Polling started (interval: 2s)', 'System');
}

// Démarrage
init();