
PHILOSOPHERS = {
    1: {
        "id": 1,
        "name": "Aristotle",
        "port": 5001,
        "school": "Classical Virtue Ethics",
        "behavior": "virtue_seeker", 
        
        "weight_categories": {
            "Wisdom": 1.2,
            "Ethics and behavior": 1.3,
            "Happiness and well-being": 1.1
        }
    },
    2: {
        "id": 2,
        "name": "Immanuel Kant",
        "port": 5002,
        "school": "Deontological Ethics",
        "behavior": "strict_duty", 
        "weight_categories": {
            "Ethics and behavior": 1.4,
            "Reason and logic": 1.3,
            "Society and Justice": 1.2
        }
    },
    3: {
        "id": 3,
        "name": "Friedrich Nietzsche",
        "port": 5003,
        "school": "Power Philosophy",
        "behavior": "power_seeker", 
        "weight_categories": {
            "Freedom": 1.4,
            "Action and discipline": 1.3,
            "Life and human nature": 1.2
        }
    },
    4: {
        "id": 4,
        "name": "Fyodor Dostoevsky",
        "port": 5004,
        "school": "Christian Existentialism",
        "behavior": "depth_seeker", 
        "weight_categories": {
            "Faith": 1.4,
            "Life and human nature": 1.3,
            "Happiness and well-being": 1.2
        }
    },
    5: {
        "id": 5,
        "name": "Leo Tolstoy",
        "port": 5005,
        "school": "Christian Anarchism",
        "behavior": "love_seeker",  
        "weight_categories": {
            "Faith": 1.3,
            "Society and Justice": 1.2,
            "Happiness and well-being": 1.4
        }
    },
    6: {
        "id": 6,
        "name": "Confucius",
        "port": 5006,
        "school": "Social/Virtue Ethics",
        "behavior": "harmony_seeker", 
        "weight_categories": {
            "Wisdom": 1.3,
            "Society and Justice": 1.4,
            "Ethics and behavior": 1.2
        }
    }
}

HOST = "127.0.0.1"  
NODE_PORTS = [5001, 5002, 5003, 5004, 5005, 5006]
COORDINATOR_PORT = 8000  

SOCKET_TIMEOUT = 2.0 
CONNECTION_RETRY = 3
HEARTBEAT_INTERVAL = 5.0  

# ========================================
# PROTOCOLE DE CONSENSUS - MIS Ã€ JOUR POUR DES EXIGENCES PLUS SOUPLES
# ========================================

QUORUM_THRESHOLD = 0.50     # ChangÃ© de 0.67 (50% au lieu de 67%)
MIN_VOTES_REQUIRED = 2       # ChangÃ© de 4 (besoin de 3 au lieu de 4)
MAX_VOTES = 6

MIN_RELEVANCE_SCORE = 2.0    # Score minimum Ã  considÃ©rer
ACCEPT_THRESHOLD = 3.0       # ChangÃ© de 5.0 (acceptation plus permissive)


import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

PHILOSOPHERS_JSON = os.path.join(DATA_DIR, "philosophers.json")
QUOTES_JSON = os.path.join(DATA_DIR, "quotes.json")

CATEGORIES = {
    1: "Wisdom",
    2: "Knowledge and learning",
    3: "Ethics and behavior",
    4: "Life and human nature",
    5: "Action and discipline",
    6: "Freedom",
    7: "Faith",
    8: "Reason and logic",
    9: "Society and Justice",
    10: "Happiness and well-being"
}

MSG_TYPE_REQUEST = "REQUEST"
MSG_TYPE_RESPONSE = "RESPONSE"
MSG_TYPE_HEARTBEAT = "HEARTBEAT"
MSG_TYPE_SHUTDOWN = "SHUTDOWN"

"""
Formats de messages :

REQUEST:
{
    "type": "REQUEST",
    "context": "stress au travail",
    "keywords": ["Ã©chÃ©ance", "pression", "anxiÃ©tÃ©"],
    "category": "Happiness and well-being"
}

RESPONSE:
{
    "type": "RESPONSE",
    "philosopher_id": 5,
    "philosopher_name": "Leo Tolstoy",
    "quote": {
        "quoteId": 50,
        "text": "La joie ne peut Ãªtre rÃ©elle que si...",
        "source": "Le Royaume de Dieu",
        "category": 10,
        "categoryName": "Happiness and well-being"
    },
    "score": 9.2,
    "vote": "Accept",
    "reasoning": "Haute pertinence pour le soulagement du stress par le service"
}
"""


LOG_LEVEL = "INFO"  
LOG_FORMAT = "[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"



API_TITLE = "SystÃ¨me de Recommandation de Citations Philosophiques"
API_VERSION = "1.0.0"
API_DESCRIPTION = """
SystÃ¨me distribuÃ© oÃ¹ 6 nÅ“uds philosophes votent via consensus TCP 
pour recommander la meilleure citation philosophique basÃ©e sur le contexte.
"""

CORS_ORIGINS = [
    "chrome-extension://*", 
    "http://localhost:*",
    "http://127.0.0.1:*"
]
