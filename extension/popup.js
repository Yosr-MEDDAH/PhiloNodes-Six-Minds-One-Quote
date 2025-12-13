// popup.js - FIXED VERSION with backend synchronization

const API_BASE = 'http://127.0.0.1:8000';

let state = {
    currentQuote: null,
    history: [],
    settings: {
        autoNotifications: true
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ PhiloSagesse extension chargée');
    
    await loadSettings();
    await checkBackendStatus();
    await loadHistory();
    
    setupTabs();
    
    document.getElementById('getQuoteBtn').addEventListener('click', getQuoteForCurrentPage);
    
    document.getElementById('autoNotifications').addEventListener('change', (e) => {
        state.settings.autoNotifications = e.target.checked;
        saveSettings();
    });
});

// ============================================
// GESTION DES ONGLETS
// ============================================

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const targetId = tab.dataset.tab;
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

async function getQuoteForCurrentPage() {
    const btn = document.getElementById('getQuoteBtn');
    const container = document.getElementById('currentQuote');
    
    try {
        btn.disabled = true;
        btn.textContent = 'Chargement...';
        
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Les philosophes délibèrent...</p>
            </div>
        `;
        
        const context = await getCurrentPageContext();
        
        console.log('📤 Envoi requête:', context);
        
        // Requête à l'API backend
        const response = await fetch(`${API_BASE}/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(context)
        });
        
        if (!response.ok) {
            throw new Error('Échec de connexion au serveur');
        }
        
        const data = await response.json();
        console.log('📥 Réponse reçue:', data);
        
        // Afficher le résultat
        displayQuote(data, context);
        
        // ✅ Le backend stocke déjà automatiquement!
        // Pas besoin de saveRecommendationToStorage() car /recommend le fait déjà
        
        // Sauvegarder dans l'historique local (pour l'extension)
        await saveToHistory(data, context);
        
        // Notification si activée
        if (state.settings.autoNotifications && data.winner) {
            showNotification(data.winner.quote.quote || data.winner.quote.text);
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        container.innerHTML = `
            <div class="empty-state">
                ❌ Erreur: ${error.message}
                <br><br>
                Assurez-vous que le serveur backend est en cours d'exécution sur http://127.0.0.1:8000
            </div>
        `;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Obtenir la sagesse pour cette page';
    }
}

async function getCurrentPageContext() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const title = tab.title || '';
    const url = tab.url || '';
    
    const keywords = extractKeywords(title);
    const category = guessCategory(title, url);
    
    return {
        context: `Navigation sur: ${title}`,
        keywords: keywords,
        category: category
    };
}

function extractKeywords(text) {
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
    
    return [...new Set(words)].slice(0, 5);
}

function guessCategory(title, url) {
    const text = (title + ' ' + url).toLowerCase();
    
    const categories = {
        'Wisdom': ['sagesse', 'connaissance', 'apprendre', 'philosophie', 'wisdom', 'knowledge'],
        'Ethics and behavior': ['éthique', 'morale', 'comportement', 'ethics', 'moral'],
        'Life and human nature': ['vie', 'humain', 'nature', 'existence', 'life', 'human'],
        'Action and discipline': ['action', 'discipline', 'travail', 'effort', 'work'],
        'Freedom': ['liberté', 'libre', 'choix', 'freedom', 'choice'],
        'Faith': ['foi', 'religion', 'spirituel', 'faith', 'spiritual'],
        'Reason and logic': ['raison', 'logique', 'pensée', 'reason', 'logic'],
        'Society and Justice': ['société', 'justice', 'social', 'society'],
        'Happiness and well-being': ['bonheur', 'bien-être', 'joie', 'happiness', 'wellbeing']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => text.includes(kw))) {
            return category;
        }
    }
    
    return null;
}

function displayQuote(data, context) {
    const container = document.getElementById('currentQuote');
    
    if (!data.winner) {
        container.innerHTML = `
            <div class="quote-card">
                <p>❌ Aucun consensus n'a été atteint par les philosophes.</p>
                <p style="font-size: 12px; margin-top: 10px;">
                    Votes: ${data.consensus.accepts} Accepte, ${data.consensus.rejects} Rejette
                </p>
            </div>
        `;
        return;
    }
    
    const winner = data.winner;
    const quoteText = winner.quote.quote || winner.quote.text;
    const quoteSource = winner.quote.source;
    
    const mainPhilosopher = winner.supporters && winner.supporters.length > 0 
        ? winner.supporters[0].philosopher 
        : 'Unknown Philosopher';
    
    container.innerHTML = `
        <div class="context-info">
            <strong>Contexte:</strong> ${context.context}
            <br>
            <strong>Mots-clés:</strong> ${context.keywords.join(', ')}
        </div>
        
        <div class="quote-card">
            <div class="quote-text">"${quoteText}"</div>
            <div class="quote-source">— ${quoteSource}</div>
            
            <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="font-size: 13px; color: #6b5d4f; font-weight: 600;">
                    🏆 ${mainPhilosopher}
                </div>
                <div class="consensus-badge">
                    Consensus ${data.consensus.quorum_percentage}%
                </div>
            </div>
        </div>
        
        ${data.votes_detail.length > 0 ? `
            <div class="votes-detail">
                <strong>Votes des philosophes:</strong>
                ${data.votes_detail.map(vote => `
                    <div class="vote-item ${vote.vote.toLowerCase()}">
                        <span>${vote.philosopher_name}</span>
                        <span>${vote.vote === 'Accept' ? '✓' : '✗'} ${vote.score}/10</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    state.currentQuote = { winner, context, timestamp: Date.now() };
}

// ============================================
// HISTORIQUE LOCAL
// ============================================

async function saveToHistory(data, context) {
    if (!data.winner) return;
    
    const quoteText = data.winner.quote.quote || data.winner.quote.text;
    
    const entry = {
        quote: quoteText,
        source: data.winner.quote.source,
        context: context.context,
        timestamp: Date.now()
    };
    
    state.history.unshift(entry);
    
    if (state.history.length > 20) {
        state.history = state.history.slice(0, 20);
    }
    
    await chrome.storage.local.set({ history: state.history });
    
    displayHistory();
}

async function loadHistory() {
    const result = await chrome.storage.local.get('history');
    state.history = result.history || [];
    displayHistory();
}

function displayHistory() {
    const container = document.getElementById('historyList');
    
    if (state.history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                Votre historique de citations apparaîtra ici
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.history.map(entry => {
        const date = new Date(entry.timestamp);
        return `
            <div class="history-item">
                <div class="quote">"${entry.quote}"</div>
                <div class="meta">
                    <strong>${entry.source}</strong><br>
                    ${date.toLocaleString('fr-FR')}<br>
                    Contexte: ${entry.context}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// PARAMÈTRES
// ============================================

async function loadSettings() {
    const result = await chrome.storage.local.get('settings');
    if (result.settings) {
        state.settings = result.settings;
        document.getElementById('autoNotifications').checked = state.settings.autoNotifications;
    }
}

async function saveSettings() {
    await chrome.storage.local.set({ settings: state.settings });
}

// ============================================
// VÉRIFICATION DU BACKEND
// ============================================

async function checkBackendStatus() {
    const statusDot = document.getElementById('backendStatus');
    const statusText = document.getElementById('backendStatusText');
    
    try {
        const response = await fetch(`${API_BASE}/status`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
            const data = await response.json();
            statusDot.classList.add('online');
            statusDot.classList.remove('offline');
            statusText.textContent = `En ligne (${data.active_nodes}/${data.total_nodes} nœuds)`;
        } else {
            throw new Error('Réponse invalide');
        }
    } catch (error) {
        statusDot.classList.add('offline');
        statusDot.classList.remove('online');
        statusText.textContent = 'Hors ligne';
        console.error('Backend inaccessible:', error);
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message) {
    if (chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'PhiloSagesse',
            message: message.substring(0, 100) + '...',
            priority: 1
        });
    }
}