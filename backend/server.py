# server.py - Enhanced with detailed node metrics for distributed system visualization
"""
Serveur coordinateur FastAPI avec métriques détaillées pour visualisation
du système distribué (TCP, consensus, communication inter-nœuds)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import time
from collections import deque
import asyncio

from config import (
    API_TITLE, API_VERSION, API_DESCRIPTION, 
    CORS_ORIGINS, PHILOSOPHERS
)
from socket_manager import SocketManager
from consensus import ConsensusProtocol

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# ============================================
# STOCKAGE DES MÉTRIQUES DISTRIBUÉES
# ============================================

recommendations_history = deque(maxlen=100)

# Métriques par nœud
node_metrics = {
    phil_id: {
        "total_requests": 0,
        "successful_responses": 0,
        "failed_responses": 0,
        "total_response_time": 0.0,
        "avg_response_time": 0.0,
        "last_response_time": 0.0,
        "last_seen": None,
        "votes_accept": 0,
        "votes_reject": 0,
        "connection_status": "unknown"
    }
    for phil_id in PHILOSOPHERS.keys()
}

# Historique des messages (derniers 50)
message_log = deque(maxlen=50)

# Métriques globales
global_metrics = {
    "total_consensus_sessions": 0,
    "successful_consensus": 0,
    "failed_consensus": 0,
    "total_processing_time": 0.0,
    "avg_processing_time": 0.0
}

# ============================================
# INITIALISATION FASTAPI
# ============================================

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

socket_manager = SocketManager()
consensus_protocol = ConsensusProtocol()

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Démarrage du serveur...")
    socket_manager.scan_all_nodes()
    active, total = socket_manager.get_nodes_count()
    logger.info(f" Serveur prêt! {active}/{total} nœuds actifs")
    
    # Background task pour heartbeat périodique
    asyncio.create_task(periodic_heartbeat())

async def periodic_heartbeat():
    """Heartbeat périodique pour surveiller les nœuds"""
    while True:
        await asyncio.sleep(5)
        socket_manager.scan_all_nodes()
        
        # Mettre à jour le statut de connexion
        for phil_id in PHILOSOPHERS.keys():
            is_active = phil_id in socket_manager.active_nodes
            node_metrics[phil_id]["connection_status"] = "connected" if is_active else "disconnected"
            if is_active:
                node_metrics[phil_id]["last_seen"] = time.time()

# ============================================
# MODÈLES PYDANTIC
# ============================================

class RecommendationRequest(BaseModel):
    context: Optional[str] = Field(None, description="Contexte textuel")
    keywords: List[str] = Field(default_factory=list, description="Mots-clés")
    category: Optional[str] = Field(None, description="Catégorie")

class QuoteResponse(BaseModel):
    winner: Optional[dict] = Field(description="Citation gagnante")
    consensus: dict = Field(description="Statistiques du consensus")
    votes_detail: List[dict] = Field(description="Détail des votes")
    processing_time: float = Field(description="Temps de traitement")
    active_nodes: int = Field(description="Nœuds actifs")
    node_timings: Optional[dict] = Field(description="Temps de réponse par nœud")

# ============================================
# FONCTIONS UTILITAIRES MÉTRIQUES
# ============================================

def log_message(message_type: str, source: str, target: str, content: str):
    """Enregistre un message dans l'historique"""
    message_log.appendleft({
        "timestamp": time.time(),
        "type": message_type,
        "source": source,
        "target": target,
        "content": content
    })

def update_node_metrics(phil_id: int, response_time: float, success: bool, vote: str):
    """Met à jour les métriques d'un nœud"""
    metrics = node_metrics[phil_id]
    
    metrics["total_requests"] += 1
    if success:
        metrics["successful_responses"] += 1
        metrics["total_response_time"] += response_time
        metrics["avg_response_time"] = metrics["total_response_time"] / metrics["successful_responses"]
        metrics["last_response_time"] = response_time
        
        if vote == "Accept":
            metrics["votes_accept"] += 1
        elif vote == "Reject":
            metrics["votes_reject"] += 1
    else:
        metrics["failed_responses"] += 1
    
    metrics["last_seen"] = time.time()

# ============================================
# ENDPOINTS API
# ============================================

@app.get("/")
async def root():
    active, total = socket_manager.get_nodes_count()
    return {
        "message": "Système de Recommandation Philosophique Distribué",
        "version": API_VERSION,
        "status": "running",
        "active_nodes": f"{active}/{total}",
        "stored_recommendations": len(recommendations_history),
        "total_messages": len(message_log)
    }


@app.post("/recommend", response_model=QuoteResponse)
async def recommend_quote(request: RecommendationRequest):
    """Endpoint principal avec métriques détaillées"""
    start_time = time.time()
    
    logger.info(f"📨 Nouvelle demande: contexte='{request.context}'")
    
    # Log du message initial
    log_message("REQUEST", "Client", "Coordinateur", f"Contexte: {request.context}")
    
    active, total = socket_manager.get_nodes_count()
    if active == 0:
        logger.error(" Aucun nœud actif!")
        raise HTTPException(status_code=503, detail="Aucun nœud actif")
    
    # Distribution avec timing par nœud
    node_timings = {}
    
    log_message("BROADCAST", "Coordinateur", "Tous les nœuds", "Distribution de la requête")
    
    responses = {}
    for phil_id in socket_manager.active_nodes.keys():
        node_start = time.time()
        
        log_message("TCP_SEND", "Coordinateur", f"Nœud {phil_id}", f"Envoi requête TCP")
        
        response = socket_manager.send_request_to_node(
            phil_id, request.context, request.keywords, request.category
        )
        
        node_time = time.time() - node_start
        node_timings[phil_id] = round(node_time, 3)
        
        if response:
            log_message("TCP_RECV", f"Nœud {phil_id}", "Coordinateur", 
                       f"Vote: {response.get('vote')}, Score: {response.get('score')}")
            update_node_metrics(phil_id, node_time, True, response.get('vote', 'Abstain'))
        else:
            log_message("TCP_TIMEOUT", f"Nœud {phil_id}", "Coordinateur", "Pas de réponse")
            update_node_metrics(phil_id, node_time, False, "Timeout")
        
        responses[phil_id] = response
    
    # Calcul du consensus
    log_message("CONSENSUS_START", "Coordinateur", "Protocole", "Calcul du consensus")
    result = consensus_protocol.aggregate_votes(responses)
    log_message("CONSENSUS_END", "Protocole", "Coordinateur", 
               f"Quorum: {result['consensus']['quorum_reached']}")
    
    processing_time = round(time.time() - start_time, 3)
    
    # Mise à jour métriques globales
    global_metrics["total_consensus_sessions"] += 1
    global_metrics["total_processing_time"] += processing_time
    global_metrics["avg_processing_time"] = round(
        global_metrics["total_processing_time"] / global_metrics["total_consensus_sessions"], 3
    )
    
    if result["consensus"]["quorum_reached"]:
        global_metrics["successful_consensus"] += 1
    else:
        global_metrics["failed_consensus"] += 1
    
    # Construction de la réponse
    response_data = {
        "winner": result["winner"],
        "consensus": result["consensus"],
        "votes_detail": result["votes_detail"],
        "processing_time": processing_time,
        "active_nodes": active,
        "node_timings": node_timings
    }
    
    # Stockage pour le dashboard
    recommendation_entry = {
        "timestamp": int(time.time() * 1000),
        "context": {
            "context": request.context,
            "keywords": request.keywords,
            "category": request.category
        },
        "winner": result["winner"],
        "consensus": result["consensus"],
        "votes_detail": result["votes_detail"],
        "processing_time": processing_time,
        "node_timings": node_timings
    }
    
    recommendations_history.appendleft(recommendation_entry)
    
    log_message("RESPONSE", "Coordinateur", "Client", 
               f"Consensus atteint" if result["winner"] else "Pas de consensus")
    
    if result["winner"]:
        logger.info(f" Citation #{result['winner']['quote_id']}, quorum={result['consensus']['quorum_percentage']}%")
    
    return response_data


@app.get("/recommendations")
async def get_recommendations(limit: int = 50):
    """Retourne l'historique des recommandations"""
    recommendations_list = list(recommendations_history)[:limit]
    
    return {
        "total": len(recommendations_history),
        "returned": len(recommendations_list),
        "recommendations": recommendations_list
    }


@app.delete("/recommendations")
async def clear_recommendations():
    """Efface l'historique des recommandations"""
    count = len(recommendations_history)
    recommendations_history.clear()
    logger.info(f"🗑️ Historique effacé ({count} entrées)")
    
    return {
        "message": "Historique effacé",
        "cleared_count": count
    }


# ✨ NOUVEAU: Métriques des nœuds
@app.get("/metrics/nodes")
async def get_node_metrics():
    """Retourne les métriques détaillées de chaque nœud"""
    metrics_with_names = {}
    
    for phil_id, metrics in node_metrics.items():
        phil_config = PHILOSOPHERS[phil_id]
        metrics_with_names[phil_id] = {
            "name": phil_config["name"],
            "port": phil_config["port"],
            "school": phil_config["school"],
            **metrics,
            "success_rate": round(
                (metrics["successful_responses"] / metrics["total_requests"] * 100) 
                if metrics["total_requests"] > 0 else 0, 1
            )
        }
    
    return {
        "nodes": metrics_with_names,
        "timestamp": time.time()
    }


# ✨ NOUVEAU: Historique des messages
@app.get("/metrics/messages")
async def get_message_log(limit: int = 50):
    """Retourne l'historique des messages TCP"""
    messages = list(message_log)[:limit]
    
    return {
        "total": len(message_log),
        "returned": len(messages),
        "messages": messages
    }


# ✨ NOUVEAU: Métriques globales
@app.get("/metrics/global")
async def get_global_metrics():
    """Retourne les métriques globales du système"""
    return {
        **global_metrics,
        "timestamp": time.time(),
        "success_rate": round(
            (global_metrics["successful_consensus"] / global_metrics["total_consensus_sessions"] * 100)
            if global_metrics["total_consensus_sessions"] > 0 else 0, 1
        )
    }


@app.get("/status")
async def get_status():
    """Retourne l'état du système"""
    active, total = socket_manager.get_nodes_count()
    
    all_philosophers = []
    for phil_id, config in PHILOSOPHERS.items():
        is_active = phil_id in socket_manager.active_nodes
        metrics = node_metrics[phil_id]
        
        all_philosophers.append({
            "id": phil_id,
            "name": config["name"],
            "school": config["school"],
            "port": config["port"],
            "status": "active" if is_active else "inactive",
            "last_seen": metrics["last_seen"],
            "avg_response_time": metrics["avg_response_time"]
        })
    
    return {
        "system_status": "operational" if active > 0 else "degraded",
        "active_nodes": active,
        "total_nodes": total,
        "philosophers": all_philosophers,
        "consensus_config": {
            "quorum_threshold": f"{consensus_protocol.quorum_threshold * 100}%",
            "min_votes_required": consensus_protocol.min_votes_required
        },
        "stored_recommendations": len(recommendations_history),
        "message_log_size": len(message_log)
    }


@app.post("/scan")
async def scan_nodes():
    """Force un nouveau scan de tous les nœuds"""
    logger.info("🔍 Scan manuel des nœuds")
    availability = socket_manager.scan_all_nodes()
    active, total = socket_manager.get_nodes_count()
    
    return {
        "message": "Scan terminé",
        "active_nodes": active,
        "total_nodes": total,
        "availability": {
            PHILOSOPHERS[phil_id]["name"]: is_available
            for phil_id, is_available in availability.items()
        }
    }


@app.get("/philosophers")
async def get_philosophers():
    """Retourne la liste de tous les philosophes"""
    return {
        "philosophers": [
            {
                "id": phil_id,
                "name": config["name"],
                "school": config["school"],
                "behavior": config["behavior"],
                "port": config["port"]
            }
            for phil_id, config in PHILOSOPHERS.items()
        ]
    }


if __name__ == "__main__":
    import uvicorn
    
    print("="*60)
    print("SERVEUR DISTRIBUÉ - RECOMMANDATION PHILOSOPHIQUE")
    print("="*60)
    print("\n Serveur sur http://127.0.0.1:8000")
    print("\n Documentation: http://127.0.0.1:8000/docs")
    print("\n Dashboard: Ouvrez dashboard/index.html")
    print("="*60 + "\n")
    
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )