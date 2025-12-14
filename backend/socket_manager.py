import socket
import json
import logging
from typing import Dict, List, Optional, Tuple
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from config import (
    HOST, PHILOSOPHERS, SOCKET_TIMEOUT, 
    CONNECTION_RETRY, MSG_TYPE_REQUEST
)
from utils import parse_message

logger = logging.getLogger(__name__)

try:
    from profiling import profiler, ProfileResult
    PROFILING_ENABLED = True
    logger.info("Profiling module loaded successfully")
except ImportError:
    PROFILING_ENABLED = False
    logger.warning("Profiling module not available")


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
                logger.info(f"Nœud {name} (port {port}) est disponible")
                return True
                
        except (socket.timeout, ConnectionRefusedError, Exception) as e:
            logger.warning(f"Nœud {name} (port {port}) indisponible: {e}")
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
                        f"Réponse reçue de {name}: "
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
        
        logger.error(f"Échec de réception de réponse de {name} après {CONNECTION_RETRY} tentatives")
        return None
    
    def broadcast_request(
        self,
        context: Optional[str],
        keywords: List[str],
        category_name: Optional[str]
    ) -> Dict[int, Optional[Dict]]:
        logger.info(f"[SEQUENTIAL] Diffusion de la requête à {len(self.active_nodes)} nœuds actifs...")
        start_time = time.time()
        
        responses = {}
        
        for phil_id in self.active_nodes.keys():
            response = self.send_request_to_node(
                philosopher_id=phil_id,
                context=context,
                keywords=keywords,
                category_name=category_name
            )
            responses[phil_id] = response
        
        elapsed = time.time() - start_time
        successful = sum(1 for r in responses.values() if r is not None)
        
        logger.info(
            f"[SEQUENTIAL] Diffusion terminée: {successful}/{len(self.active_nodes)} nœuds "
            f"ont répondu en {elapsed:.3f}s"
        )
        
        if PROFILING_ENABLED:
            try:
                result = ProfileResult(
                    method="sequential",
                    start_time=start_time,
                    end_time=time.time(),
                    duration=elapsed,
                    active_nodes=len(responses),
                    successful_responses=successful,
                    failed_responses=len(responses) - successful,
                    node_timings={phil_id: 0.0 for phil_id in responses.keys()},
                    context=context or "",
                    timestamp=time.time()
                )
                profiler.record_result(result)
                logger.info(f"[PROFILING] Sequential result recorded: {elapsed:.3f}s")
            except Exception as e:
                logger.error(f"Error recording profiling result: {e}")
        
        return responses
    
    def broadcast_request_parallel(
        self,
        context: Optional[str],
        keywords: List[str],
        category_name: Optional[str],
        max_workers: int = 6
    ) -> Dict[int, Optional[Dict]]:
        logger.info(f"[PARALLEL] Diffusion de la requête à {len(self.active_nodes)} nœuds actifs...")
        start_time = time.time()
        
        responses = {}
        
        def send_to_node(phil_id: int) -> Tuple[int, Optional[Dict]]:
            response = self.send_request_to_node(
                philosopher_id=phil_id,
                context=context,
                keywords=keywords,
                category_name=category_name
            )
            return (phil_id, response)
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_phil = {
                executor.submit(send_to_node, phil_id): phil_id 
                for phil_id in self.active_nodes.keys()
            }
            
            for future in as_completed(future_to_phil):
                try:
                    phil_id, response = future.result()
                    responses[phil_id] = response
                except Exception as e:
                    phil_id = future_to_phil[future]
                    logger.error(f"Exception lors de la requête parallèle au nœud {phil_id}: {e}")
                    responses[phil_id] = None
        
        elapsed = time.time() - start_time
        successful = sum(1 for r in responses.values() if r is not None)
        
        logger.info(
            f"[PARALLEL] Diffusion terminée: {successful}/{len(self.active_nodes)} nœuds "
            f"ont répondu en {elapsed:.3f}s"
        )
        
        if PROFILING_ENABLED:
            try:
                result = ProfileResult(
                    method="parallel",
                    start_time=start_time,
                    end_time=time.time(),
                    duration=elapsed,
                    active_nodes=len(responses),
                    successful_responses=successful,
                    failed_responses=len(responses) - successful,
                    node_timings={phil_id: 0.0 for phil_id in responses.keys()},
                    context=context or "",
                    timestamp=time.time()
                )
                profiler.record_result(result)
                logger.info(f"[PROFILING] Parallel result recorded: {elapsed:.3f}s")
            except Exception as e:
                logger.error(f"Error recording profiling result: {e}")
        
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
    print("TEST DU SOCKET MANAGER - SEQUENTIAL vs PARALLEL")
    print("="*60)
    print("\nAssurez-vous de démarrer quelques nœuds d'abord:")
    print("  python node_philosopher.py 1")
    print("  python node_philosopher.py 2")
    print("  python node_philosopher.py 3")
    print("  python node_philosopher.py 4")
    print("  python node_philosopher.py 5")
    print("  python node_philosopher.py 6")
    print("\nAppuyez sur Entrée pour continuer...")
    input()
    
    manager = SocketManager()
    
    print("\n[TEST 1] Scan des nœuds...")
    availability = manager.scan_all_nodes()
    print(f"\nNœuds disponibles: {sum(availability.values())}/6")
    
    if manager.active_nodes:
        test_context = "se sentir stressé au travail"
        test_keywords = ["stress", "travail", "pression"]
        test_category = "Happiness and well-being"
        
        print("\n" + "="*60)
        print("[TEST 2] SEQUENTIAL BROADCAST")
        print("="*60)
        seq_start = time.time()
        seq_responses = manager.broadcast_request(
            context=test_context,
            keywords=test_keywords,
            category_name=test_category
        )
        seq_time = time.time() - seq_start
        
        print(f"\nTemps séquentiel: {seq_time:.3f}s")
        print(f"Réponses reçues: {sum(1 for r in seq_responses.values() if r)}/{len(seq_responses)}")
        
        time.sleep(1)
        
        print("\n" + "="*60)
        print("[TEST 3] PARALLEL BROADCAST")
        print("="*60)
        par_start = time.time()
        par_responses = manager.broadcast_request_parallel(
            context=test_context,
            keywords=test_keywords,
            category_name=test_category
        )
        par_time = time.time() - par_start
        
        print(f"\nTemps parallèle: {par_time:.3f}s")
        print(f"Réponses reçues: {sum(1 for r in par_responses.values() if r)}/{len(par_responses)}")
        
        print("\n" + "="*60)
        print("COMPARAISON")
        print("="*60)
        speedup = seq_time / par_time if par_time > 0 else 0
        improvement = ((seq_time - par_time) / seq_time * 100) if seq_time > 0 else 0
        
        print(f"\nTemps séquentiel:  {seq_time:.3f}s")
        print(f"Temps parallèle:   {par_time:.3f}s")
        print(f"Accélération:      {speedup:.2f}x")
        print(f"Amélioration:      {improvement:.1f}%")
        
        print("\n" + "="*60)
        print("RÉPONSES DÉTAILLÉES")
        print("="*60)
        
        for phil_id in sorted(seq_responses.keys()):
            response = seq_responses.get(phil_id) or par_responses.get(phil_id)
            if response:
                print(f"\n{response['philosopher_name']}:")
                print(f"  Vote: {response['vote']}")
                print(f"  Score: {response['score']}/10")
                print(f"  Citation: \"{response['quote']['text'][:60]}...\"")
    else:
        print("\nAucun nœud actif trouvé. Démarrez d'abord quelques nœuds!")
    
    print("\n" + "="*60)
    print("Test terminé!")
    print("="*60)