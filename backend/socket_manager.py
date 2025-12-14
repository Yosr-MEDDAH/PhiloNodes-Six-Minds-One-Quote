
import socket
import json
import logging
from typing import Dict, List, Optional, Tuple
import time

from config import (
    HOST, PHILOSOPHERS, SOCKET_TIMEOUT, 
    CONNECTION_RETRY, MSG_TYPE_REQUEST
)
from utils import parse_message

logger = logging.getLogger(__name__)


class SocketManager:
 
    def __init__(self):
        self.philosophers = PHILOSOPHERS
        self.active_nodes = {}          
        logger.info("SocketManager initialisé")
    
    def check_node_availability(self, philosopher_id: int) -> bool:
        if philosopher_id not in self.philosophers:
            return False
        
        port = self.philosophers[philosopher_id]["port"]
        name = self.philosophers[philosopher_id]["name"]
        
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1.0)
            sock.connect((HOST, port))
            
            heartbeat = json.dumps({"type": "HEARTBEAT"})
            sock.sendall(heartbeat.encode('utf-8'))
            
            response = sock.recv(1024).decode('utf-8')
            sock.close()
            
            if response:
                self.active_nodes[philosopher_id] = {
                    "name": name,
                    "port": port,
                    "status": "active"
                }
                logger.info(f" Nœud {name} (port {port}) est disponible")
                return True
                
        except (socket.timeout, ConnectionRefusedError, Exception) as e:
            logger.warning(f" Nœud {name} (port {port}) indisponible: {e}")
            if philosopher_id in self.active_nodes:
                del self.active_nodes[philosopher_id]
            return False
        
        return False
    
    def scan_all_nodes(self) -> Dict[int, bool]:
        logger.info("Scan de tous les 6 nœuds philosophes...")
        
        availability = {}
        for phil_id in self.philosophers.keys():
            is_available = self.check_node_availability(phil_id)
            availability[phil_id] = is_available
        
        active_count = sum(availability.values())
        logger.info(f"Scan terminé: {active_count}/6 nœuds sont actifs")
        
        return availability
    
    def send_request_to_node(
        self, 
        philosopher_id: int, 
        context: Optional[str],
        keywords: List[str],
        category_name: Optional[str]
    ) -> Optional[Dict]:
        if philosopher_id not in self.philosophers:
            logger.error(f"ID philosophe invalide: {philosopher_id}")
            return None
        
        port = self.philosophers[philosopher_id]["port"]
        name = self.philosophers[philosopher_id]["name"]
        
        request = {
            "type": MSG_TYPE_REQUEST,
            "context": context or "",
            "keywords": keywords,
            "category": category_name or ""
        }
        
        request_json = json.dumps(request)
        
        for attempt in range(CONNECTION_RETRY):
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(SOCKET_TIMEOUT)
                sock.connect((HOST, port))
                
                sock.sendall(request_json.encode('utf-8'))
                logger.debug(f"Requête envoyée à {name} (tentative {attempt + 1})")
                
                response_data = sock.recv(4096).decode('utf-8')
                sock.close()
                
                if not response_data:
                    logger.warning(f"Réponse vide de {name}")
                    continue
                
                response = parse_message(response_data)
                
                if response:
                    logger.info(
                        f" Réponse reçue de {name}: "
                        f"vote={response.get('vote')}, score={response.get('score')}"
                    )
                    return response
                
            except socket.timeout:
                logger.warning(f"Timeout en attendant {name} (tentative {attempt + 1})")
                if attempt < CONNECTION_RETRY - 1:
                    time.sleep(0.5)
                    
            except ConnectionRefusedError:
                logger.error(f"Connexion refusée par {name} sur le port {port}")
                break
                
            except Exception as e:
                logger.error(f"Erreur de communication avec {name}: {e}")
                break
        
        logger.error(f" Échec de réception de réponse de {name} après {CONNECTION_RETRY} tentatives")
        return None
    
    def broadcast_request(
        self,
        context: Optional[str],
        keywords: List[str],
        category_name: Optional[str]
    ) -> Dict[int, Optional[Dict]]:
       
        logger.info(f"Diffusion de la requête à {len(self.active_nodes)} nœuds actifs...")
        
        responses = {}
        
        for phil_id in self.active_nodes.keys():
            response = self.send_request_to_node(
                philosopher_id=phil_id,
                context=context,
                keywords=keywords,
                category_name=category_name
            )
            responses[phil_id] = response
        
        successful = sum(1 for r in responses.values() if r is not None)
        logger.info(f"Diffusion terminée: {successful}/{len(self.active_nodes)} nœuds ont répondu")
        
        return responses
    
    def get_active_nodes_info(self) -> List[Dict]:
     
        return [
            {
                "id": phil_id,
                "name": info["name"],
                "port": info["port"],
                "status": info["status"]
            }
            for phil_id, info in self.active_nodes.items()
        ]
    
    def get_nodes_count(self) -> Tuple[int, int]:
        return len(self.active_nodes), len(self.philosophers)

if __name__ == "__main__":
    
    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    print("="*60)
    print("TEST DU SOCKET MANAGER")
    print("="*60)
    print("\nAssurez-vous de démarrer quelques nœuds d'abord:")
    print("  python node_philosopher.py 1  # Aristotle")
    print("  python node_philosopher.py 2  # Kant")
    print("  python node_philosopher.py 5  # Tolstoy")
    print("\nAppuyez sur Entrée pour continuer...")
    input()
    
    manager = SocketManager()
    
    print("\n[TEST 1] Scan des nœuds...")
    availability = manager.scan_all_nodes()
    print(f"\nNœuds disponibles: {sum(availability.values())}/6")
    
    if manager.active_nodes:
        print("\n[TEST 2] Diffusion de la requête aux nœuds actifs...")
        responses = manager.broadcast_request(
            context="se sentir stressé au travail",
            keywords=["stress", "travail", "pression"],
            category_name="Happiness and well-being"
        )
        
        print("\n" + "="*60)
        print("RÉPONSES:")
        print("="*60)
        
        for phil_id, response in responses.items():
            if response:
                print(f"\n{response['philosopher_name']}:")
                print(f"  Vote: {response['vote']}")
                print(f"  Score: {response['score']}/10")
                print(f"  Citation: \"{response['quote']['text'][:60]}...\"")
            else:
                print(f"\nPhilosophe {phil_id}: Pas de réponse")
    else:
        print("\n Aucun nœud actif trouvé. Démarrez d'abord quelques nœuds!")
    
    print("\n" + "="*60)
    print("Test terminé!")
    print("="*60)