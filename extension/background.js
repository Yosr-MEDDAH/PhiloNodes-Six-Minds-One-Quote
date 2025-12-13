const API_BASE = "http://127.0.0.1:8000";

const state = {
  lastRecommendation: null,
  recommendationHistory: [],
  settings: {
    autoNotifications: true,
    notificationFrequency: 120000,
    confidenceThreshold: 40,
  },
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("Philosophical Wisdom Extension Installed");

  chrome.storage.local.get(["settings", "history"], (result) => {
    if (result.settings) {
      state.settings = { ...state.settings, ...result.settings };
    }
    if (result.history) {
      state.recommendationHistory = result.history;
    }
  });

  checkBackendStatus();
});

async function checkBackendStatus() {
  try {
    const response = await fetch(`${API_BASE}/status`);
    if (response.ok) {
      console.log("Backend server connected");
      return true;
    }
  } catch (error) {
    console.warn("Backend server not reachable:", error);
    return false;
  }
}

async function getRecommendation(context) {
  try {
    console.log("Requesting recommendation...", context);

    const payload = {
      context: context.context || "",
      keywords: context.keywords || [],
      category: context.category || null,
    };

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

    console.log("Recommendation received:", data);

    return data;
  } catch (error) {
    console.error("Failed to get recommendation:", error);
    return null;
  }
}

function showNotification(recommendation, context) {
  if (!state.settings.autoNotifications) return;

  const winner = recommendation.winner;
  if (!winner) {
    console.log("No winner quote to display");
    return;
  }

  const quote = winner.quote;
  const consensus = recommendation.consensus;

  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "icon128.png",
      title: `💭 Wisdom for You`,
      message: `"${quote.text}"\n\n— ${quote.source}`,
      contextMessage: `${consensus.accepts}/${consensus.total_votes} philosophers agree (${consensus.quorum_percentage}% consensus)`,
      priority: 2,
      requireInteraction: false,
    },
    (notificationId) => {
      chrome.storage.local.set({
        [`notification_${notificationId}`]: {
          recommendation,
          context,
          timestamp: Date.now(),
        },
      });

      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, 10000);
    }
  );

  state.lastRecommendation = {
    recommendation,
    context,
    timestamp: Date.now(),
  };

  state.recommendationHistory.unshift({
    quote: quote.text,
    philosopher: quote.source,
    category: context.category,
    timestamp: Date.now(),
    confidence: context.confidence,
    consensus: consensus.quorum_percentage,
  });

  if (state.recommendationHistory.length > 50) {
    state.recommendationHistory = state.recommendationHistory.slice(0, 50);
  }

  chrome.storage.local.set({
    history: state.recommendationHistory,
    lastRecommendation: state.lastRecommendation,
  });
}

chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.storage.local.get([`notification_${notificationId}`], (result) => {
    const data = result[`notification_${notificationId}`];

    if (data) {
      chrome.action.openPopup();

      chrome.runtime.sendMessage({
        action: "showRecommendation",
        data: data,
      });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "contextAnalyzed") {
    const context = request.context;

    console.log("Context analyzed:", context);

    if (context.confidence >= state.settings.confidenceThreshold) {
      getRecommendation(context).then((recommendation) => {
        if (recommendation && recommendation.winner) {
          showNotification(recommendation, context);

          sendResponse({ success: true, recommendation });
        } else {
          console.log("No consensus reached or error occurred");
          sendResponse({ success: false });
        }
      });

      return true;
    } else {
      console.log(
        `Confidence too low (${context.confidence}%), not requesting recommendation`
      );
      sendResponse({ success: false, reason: "low_confidence" });
    }
  } else if (request.action === "requestRecommendation") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getContext" },
          (response) => {
            if (response && response.context) {
              getRecommendation(response.context).then((recommendation) => {
                sendResponse({
                  success: true,
                  recommendation,
                  context: response.context,
                });
              });
            } else {
              sendResponse({ success: false, reason: "no_context" });
            }
          }
        );
      }
    });

    return true;
  } else if (request.action === "getHistory") {
    sendResponse({ history: state.recommendationHistory });
  } else if (request.action === "getLastRecommendation") {
    sendResponse({ recommendation: state.lastRecommendation });
  } else if (request.action === "updateSettings") {
    state.settings = { ...state.settings, ...request.settings };
    chrome.storage.local.set({ settings: state.settings });
    sendResponse({ success: true });
  } else if (request.action === "getSettings") {
    sendResponse({ settings: state.settings });

    if (request.action === "openPopup") {
      chrome.action.openPopup();
      sendResponse({ success: true });
    } else if (request.action === "openPopupWithData") {
      chrome.storage.local.set({
        pendingRecommendation: request.recommendation,
        timestamp: Date.now(),
      });

      chrome.action.openPopup();
      sendResponse({ success: true });
    }

    return true;
  } else if (request.action === "openPopup") {
    chrome.action.openPopup();
    sendResponse({ success: true });
  }
});

setInterval(() => {
  checkBackendStatus();
}, 300000);

chrome.tabs.onActivated.addListener((activeInfo) => {
  setTimeout(() => {
    chrome.tabs.sendMessage(
      activeInfo.tabId,
      { action: "analyze" },
      (response) => {
        if (response && response.context) {
          console.log("Context from tab switch:", response.context);
        }
      }
    );
  }, 2000);
});

console.log("Philosophical Wisdom background service initialized");
