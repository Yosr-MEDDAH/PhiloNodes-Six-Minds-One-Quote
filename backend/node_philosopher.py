import socket
import json
import logging
import sys
from typing import Dict, List, Optional

from config import (
    HOST, SOCKET_TIMEOUT, PHILOSOPHERS, 
    MSG_TYPE_REQUEST, MSG_TYPE_HEARTBEAT, MSG_TYPE_SHUTDOWN,
    ACCEPT_THRESHOLD, QUOTES_JSON
)
from utils import (
    load_json_file, get_philosopher_quotes, select_best_quote,
    format_response_message, parse_message, determine_vote
)

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


class PhilosopherNode:
    def __init__(self, philosopher_id: int):
        self.philosopher_id = philosopher_id
        self.config = PHILOSOPHERS[philosopher_id]
        
        self.name = self.config["name"]
        self.port = self.config["port"]
        self.school = self.config["school"]
        self.behavior = self.config["behavior"]
        self.weight_categories = self.config["weight_categories"]
        
        self.logger = logging.getLogger(f"Nœud-{self.name}")
        
        self.quotes = []
        self._load_quotes()
        
        self.socket = None
        self.running = False
        
        self.logger.info(
            f"Nœud philosophe initialisé: {self.name} "
            f"({self.school}) sur le port {self.port}"
        )
    
    def _load_quotes(self):
        quotes_data = load_json_file(QUOTES_JSON)
        self.quotes = get_philosopher_quotes(quotes_data, self.philosopher_id)
        self.logger.info(f"Chargement de {len(self.quotes)} citations pour {self.name}")
    
    def start(self):
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            
            self.socket.bind((HOST, self.port))
            self.socket.listen(5)
            
            self.running = True
            self.logger.info(
                f" {self.name} écoute sur {HOST}:{self.port}"
            )
            
            while self.running:
                try:
                    client_socket, address = self.socket.accept()
                    self.logger.debug(f"Connexion depuis {address}")
                    
                    self._handle_client(client_socket)
                    
                except socket.timeout:
                    continue
                except Exception as e:
                    self.logger.error(f"Erreur lors du traitement du client: {e}")
                    
        except Exception as e:
            self.logger.error(f"Échec du démarrage du nœud: {e}")
        finally:
            self.stop()
    
    def _handle_client(self, client_socket: socket.socket):
        try:
            data = client_socket.recv(4096).decode('utf-8')
            
            if not data:
                return
            
            message = parse_message(data)
            if not message:
                self.logger.warning("Message invalide reçu")
                return
            
            msg_type = message.get("type")
            
            if msg_type == MSG_TYPE_REQUEST:
                response = self._process_request(message)
                client_socket.sendall(response.encode('utf-8'))
                
            elif msg_type == MSG_TYPE_HEARTBEAT:
                response = json.dumps({
                    "type": "HEARTBEAT_ACK",
                    "philosopher": self.name,
                    "status": "en vie"
                })
                client_socket.sendall(response.encode('utf-8'))
                
            elif msg_type == MSG_TYPE_SHUTDOWN:
                self.logger.info("Signal d'arrêt reçu")
                self.running = False
                
        except Exception as e:
            self.logger.error(f"Erreur dans _handle_client: {e}")
        finally:
            client_socket.close()
    
    def _process_request(self, request: Dict) -> str:
        context = request.get("context", "")
        keywords = request.get("keywords", [])
        category_name = request.get("category", "")
        
        self.logger.info(
            f"Traitement de la requête: contexte='{context}', "
            f"mots-clés={keywords}, catégorie='{category_name}'"
        )
        
        best_quote = select_best_quote(
            quotes=self.quotes,
            context=context,
            keywords=keywords,
            category_name=category_name,
            philosopher_weights=self.weight_categories
        )
        
        if not best_quote:
            self.logger.warning("Aucune citation trouvée!")
            return self._format_no_quote_response()
        
        score = best_quote.get("relevance_score", 0.0)
        vote = determine_vote(score, ACCEPT_THRESHOLD)
        
        reasoning = self._generate_reasoning(best_quote, score, vote)
        
        self.logger.info(
            f"Citation sélectionnée #{best_quote['quoteId']}: "
            f"score={score}, vote={vote}"
        )
        
        response = format_response_message(
            philosopher_id=self.philosopher_id,
            philosopher_name=self.name,
            quote=best_quote,
            score=score,
            vote=vote,
            reasoning=reasoning
        )
        
        return response
    
    def _generate_reasoning(
        self, quote: Dict, score: float, vote: str
    ) -> str:
        category = quote.get("categoryName", "")
        
        if self.behavior == "virtue_seeker":  
            if vote == "Accept":
                return f"Ceci promeut la vertu et la vie bonne dans {category}"
            else:
                return f"Manque de vertu ou de sagesse pratique suffisante"
        
        elif self.behavior == "strict_duty":  
            if vote == "Accept":
                return f"S'aligne avec le devoir moral et la loi universelle dans {category}"
            else:
                return f"Principe moral ou impératif catégorique insuffisant"
        
        elif self.behavior == "power_seeker": 
            if vote == "Accept":
                return f"Exprime la volonté de puissance et le dépassement de soi dans {category}"
            else:
                return f"Trop faible ou conventionnel pour la vraie excellence"
        
        elif self.behavior == "depth_seeker": 
            if vote == "Accept":
                return f"Révèle une vérité profonde sur la souffrance et la foi dans {category}"
            else:
                return f"Manque de profondeur spirituelle ou de perspicacité existentielle"
        
        elif self.behavior == "love_seeker":  
            if vote == "Accept":
                return f"Incarne l'amour et le service aux autres dans {category}"
            else:
                return f"Accent insuffisant sur la compassion et la simplicité"
        
        elif self.behavior == "harmony_seeker":  
            if vote == "Accept":
                return f"Promeut l'harmonie sociale et la conduite appropriée dans {category}"
            else:
                return f"Ne soutient pas suffisamment l'ordre et la piété filiale"
        
        return f"Score de pertinence: {score}"
    
    def _format_no_quote_response(self) -> str:
        return json.dumps({
            "type": "RESPONSE",
            "philosopher_id": self.philosopher_id,
            "philosopher_name": self.name,
            "quote": None,
            "score": 0.0,
            "vote": "Abstain",
            "reasoning": "Aucune citation appropriée trouvée"
        })
    
    def stop(self):
        """Arrête le nœud"""
        self.running = False
        if self.socket:
            try:
                self.socket.close()
                self.logger.info(f" {self.name} arrêté")
            except:
                pass


def run_node(philosopher_id: int):
    node = PhilosopherNode(philosopher_id)
    try:
        node.start()
    except KeyboardInterrupt:
        print(f"\n{node.name} interrompu par l'utilisateur")
    finally:
        node.stop()



if __name__ == "__main__":
    if len(sys.argv) > 1:
        phil_id = int(sys.argv[1])
        if phil_id not in PHILOSOPHERS:
            print(f"Erreur: ID philosophe invalide {phil_id}. Doit être 1-6")
            sys.exit(1)
        
        print(f"Démarrage du nœud {PHILOSOPHERS[phil_id]['name']}...")
        run_node(phil_id)
    else:
        print("Usage: python node_philosopher.py <philosopher_id>")
        print("Démarrage de Kant (nœud 2) par défaut...")
        run_node(2)